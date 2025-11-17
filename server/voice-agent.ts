import OpenAI from 'openai';
import twilio from 'twilio';
import { db } from './db';
import { voiceAgents, voiceCalls, kbDocs, crmContacts, appointments } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { retrieveSimilarContent } from './ingest';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-4o';
const TTS_VOICE = 'alloy'; // OpenAI TTS voice

export interface CallContext {
  callSid: string;
  from: string;
  to: string;
  voiceAgentId: string;
  cardId: string;
  userId: string;
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Initialize a call and create database record
export async function initializeCall(context: CallContext, direction: 'inbound' | 'outbound') {
  try {
    const [voiceCall] = await db.insert(voiceCalls).values({
      voiceAgentId: context.voiceAgentId,
      userId: context.userId,
      callSid: context.callSid,
      direction,
      status: 'ringing',
      callerNumber: context.from,
      startedAt: new Date(),
    }).returning();

    return voiceCall;
  } catch (error) {
    console.error('Error initializing call:', error);
    throw error;
  }
}

// Get voice agent configuration
export async function getVoiceAgent(voiceAgentId: string) {
  const [agent] = await db
    .select()
    .from(voiceAgents)
    .where(eq(voiceAgents.id, voiceAgentId));
  
  return agent;
}

// Get voice agent by card ID
export async function getVoiceAgentByCardId(cardId: string) {
  const [agent] = await db
    .select()
    .from(voiceAgents)
    .where(eq(voiceAgents.cardId, cardId));
  
  return agent;
}

// Generate AI response using knowledge base (RAG)
export async function generateAIResponse(
  query: string,
  voiceAgent: typeof voiceAgents.$inferSelect,
  conversationHistory: ConversationMessage[] = []
): Promise<string> {
  try {
    let systemPrompt = voiceAgent.systemPrompt || 
      `You are ${voiceAgent.agentName}, a helpful AI voice assistant. Answer questions clearly and concisely.`;

    // If knowledge base is enabled, retrieve relevant context
    if (voiceAgent.useKnowledgeBase) {
      const similarDocs = await retrieveSimilarContent(query, 3);
      
      if (similarDocs.length > 0) {
        const context = similarDocs
          .map((doc, index) => `[#${index + 1}] ${doc.content}`)
          .join('\n\n');
        
        systemPrompt += `\n\nKnowledge Base Context:\n${context}`;
      }
    }

    // Build messages array
    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: query }
    ];

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 150, // Keep responses concise for voice
    });

    return completion.choices[0]?.message?.content || 'I apologize, I didn\'t understand that.';
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'I apologize, I\'m having trouble processing your request.';
  }
}

// Convert text to speech using OpenAI TTS
export async function textToSpeech(text: string): Promise<Buffer> {
  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: TTS_VOICE,
      input: text,
      speed: 1.0,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
}

// Transcribe audio to text using Whisper
export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    // Download audio from Twilio
    const response = await fetch(audioUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`
      }
    });
    
    const audioBuffer = await response.arrayBuffer();
    const audioFile = new File([audioBuffer], 'audio.mp3', { type: 'audio/mpeg' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en', // Auto-detect or specify language
    });

    return transcription.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return '';
  }
}

// Analyze call and extract qualification data
export async function analyzeCallForQualification(
  transcript: string,
  voiceAgent: typeof voiceAgents.$inferSelect
): Promise<{ score: number; data: any; outcome: string }> {
  try {
    const qualificationPrompt = `Analyze this call transcript and extract key qualification information:
- What is the caller interested in?
- What is their budget range?
- What is their timeline?
- How qualified is this lead (1-10)?

Transcript: ${transcript}

Respond in JSON format with: { score: number, interests: string[], budget: string, timeline: string, qualified: boolean }`;

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [{ role: 'user', content: qualificationPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const analysis = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    const outcome = analysis.qualified ? 'qualified' : 'not_qualified';
    const score = Math.round(analysis.score * 10);

    return {
      score,
      data: analysis,
      outcome
    };
  } catch (error) {
    console.error('Error analyzing call:', error);
    return { score: 50, data: {}, outcome: 'follow_up' };
  }
}

// Create or update CRM contact from call
export async function syncCallToCRM(
  voiceCall: typeof voiceCalls.$inferSelect,
  qualificationData: any
) {
  try {
    const existingContact = await db
      .select()
      .from(crmContacts)
      .where(and(
        eq(crmContacts.userId, voiceCall.userId),
        eq(crmContacts.phone, voiceCall.callerNumber || '')
      ))
      .limit(1);

    if (existingContact.length > 0) {
      // Update existing contact
      await db
        .update(crmContacts)
        .set({
          lastContactDate: new Date(),
          leadScore: voiceCall.leadScore || 50,
          qualificationData: qualificationData,
          updatedAt: new Date(),
        })
        .where(eq(crmContacts.id, existingContact[0].id));

      return existingContact[0].id;
    } else {
      // Create new contact
      const [newContact] = await db
        .insert(crmContacts)
        .values({
          userId: voiceCall.userId,
          phone: voiceCall.callerNumber || '',
          name: voiceCall.callerName || 'Phone Lead',
          source: 'voice_agent',
          leadScore: voiceCall.leadScore || 50,
          lifecycleStage: 'lead',
          qualificationData: qualificationData,
        })
        .returning();

      return newContact.id;
    }
  } catch (error) {
    console.error('Error syncing call to CRM:', error);
    return null;
  }
}

// Update call status and metrics
export async function updateCallStatus(
  callSid: string,
  updates: Partial<typeof voiceCalls.$inferInsert>
) {
  try {
    await db
      .update(voiceCalls)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(voiceCalls.callSid, callSid));
  } catch (error) {
    console.error('Error updating call status:', error);
  }
}

// Generate TwiML response for Twilio
export function generateTwiMLResponse(text: string, gather: boolean = false): string {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const response = new VoiceResponse();

  if (gather) {
    const gather = response.gather({
      input: ['speech'],
      timeout: 3,
      speechTimeout: 'auto',
      action: '/api/voice/process-speech',
      method: 'POST',
    });
    gather.say(text);
  } else {
    response.say(text);
  }

  response.pause({ length: 1 });
  
  return response.toString();
}

// Make outbound call
export async function makeOutboundCall(
  voiceAgentId: string,
  toNumber: string,
  message: string
) {
  try {
    const agent = await getVoiceAgent(voiceAgentId);
    if (!agent) {
      throw new Error('Voice agent not found');
    }

    const call = await twilioClient.calls.create({
      from: agent.phoneNumber,
      to: toNumber,
      url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/voice/outbound-handler`,
      method: 'POST',
      statusCallback: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/voice/status`,
      statusCallbackMethod: 'POST',
    });

    await initializeCall({
      callSid: call.sid,
      from: agent.phoneNumber,
      to: toNumber,
      voiceAgentId: agent.id,
      cardId: agent.cardId,
      userId: agent.userId,
    }, 'outbound');

    return call;
  } catch (error) {
    console.error('Error making outbound call:', error);
    throw error;
  }
}
