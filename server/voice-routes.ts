import express from 'express';
import { z } from 'zod';
import { db } from './db';
import { voiceAgents, voiceCalls, businessCards, kbDocs } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import twilio from 'twilio';
import {
  initializeCall,
  getVoiceAgent,
  getVoiceAgentByCardId,
  generateAIResponse,
  generateTwiMLResponse,
  updateCallStatus,
  analyzeCallForQualification,
  syncCallToCRM,
  transcribeAudio,
  makeOutboundCall,
  type ConversationMessage
} from './voice-agent';
import { requireAuth } from './auth';
import { insertVoiceAgentSchema } from '@shared/schema';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const router = express.Router();

// Helper function to query knowledge base with RAG
async function queryKnowledgeBase(query: string, topK: number = 5): Promise<string> {
  try {
    // Generate embedding for the query
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryVector = embedding.data[0].embedding;

    // Query similar documents using vector similarity
    const similarDocs = await db
      .select({
        title: kbDocs.title,
        content: kbDocs.content,
        url: kbDocs.url,
      })
      .from(kbDocs)
      .where(sql`embedding IS NOT NULL`)
      .orderBy(sql`embedding <-> ${JSON.stringify(queryVector)}`)
      .limit(topK);

    if (similarDocs.length === 0) {
      return '';
    }

    // Format retrieved documents as context
    const context = similarDocs
      .map((doc) => `Title: ${doc.title || 'Untitled'}\nContent: ${doc.content}`)
      .join('\n\n---\n\n');

    return context;
  } catch (error) {
    console.error('Knowledge base query error:', error);
    return '';
  }
}

// In-memory conversation storage (in production, use Redis or database)
const conversations = new Map<string, ConversationMessage[]>();

// Twilio webhook signature validation middleware
const validateTwilioRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Skip validation if auth token is not configured (development)
  if (!process.env.TWILIO_AUTH_TOKEN) {
    console.warn('Twilio webhook validation skipped: TWILIO_AUTH_TOKEN not configured');
    return next();
  }

  const twilioSignature = req.headers['x-twilio-signature'] as string;
  
  // Construct the full public URL that Twilio called
  // Use REPLIT_DEV_DOMAIN or construct from forwarded headers (handles proxies)
  let url: string;
  if (process.env.REPLIT_DEV_DOMAIN) {
    url = `${process.env.REPLIT_DEV_DOMAIN}${req.originalUrl}`;
  } else {
    const protocol = req.get('x-forwarded-proto') || req.protocol;
    const host = req.get('x-forwarded-host') || req.get('host');
    url = `${protocol}://${host}${req.originalUrl}`;
  }
  
  console.log('Validating Twilio request for URL:', url);
  
  // Validate signature using Twilio's validation
  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    twilioSignature,
    url,
    req.body
  );

  if (!isValid) {
    console.error('Invalid Twilio signature', { url, signature: twilioSignature });
    return res.status(403).send('Forbidden');
  }

  next();
};

// ===== TWILIO WEBHOOKS =====

// Handle incoming calls
router.post('/webhook/inbound', validateTwilioRequest, async (req, res) => {
  try {
    const { CallSid, From, To, Called } = req.body;
    
    console.log('Incoming call:', { CallSid, From, To });

    // Find voice agent by phone number
    const [agent] = await db
      .select()
      .from(voiceAgents)
      .where(and(
        eq(voiceAgents.phoneNumber, Called || To),
        eq(voiceAgents.isActive, true)
      ));

    if (!agent) {
      const VoiceResponse = require('twilio').twiml.VoiceResponse;
      const response = new VoiceResponse();
      response.say('This number is not configured. Please contact support.');
      response.hangup();
      return res.type('text/xml').send(response.toString());
    }

    // Initialize call
    await initializeCall({
      callSid: CallSid,
      from: From,
      to: To,
      voiceAgentId: agent.id,
      cardId: agent.cardId,
      userId: agent.userId,
    }, 'inbound');

    // Initialize conversation
    conversations.set(CallSid, []);

    // Generate greeting
    const greeting = agent.greeting || `Hello! You've reached ${agent.agentName}. How can I help you today?`;
    
    const twiml = generateTwiMLResponse(greeting, true);
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Error handling inbound call:', error);
    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    const response = new VoiceResponse();
    response.say('We apologize, but we are experiencing technical difficulties.');
    response.hangup();
    res.type('text/xml').send(response.toString());
  }
});

// Process speech input
router.post('/webhook/process-speech', validateTwilioRequest, async (req, res) => {
  try {
    const { CallSid, SpeechResult, RecordingUrl } = req.body;
    
    console.log('Processing speech:', { CallSid, SpeechResult });

    if (!SpeechResult && !RecordingUrl) {
      const twiml = generateTwiMLResponse('I didn\'t catch that. Could you please repeat?', true);
      return res.type('text/xml').send(twiml);
    }

    // Get call details
    const [call] = await db
      .select()
      .from(voiceCalls)
      .where(eq(voiceCalls.callSid, CallSid));

    if (!call) {
      throw new Error('Call not found');
    }

    // Get voice agent
    const agent = await getVoiceAgent(call.voiceAgentId);
    if (!agent) {
      throw new Error('Voice agent not found');
    }

    // Update call status to in_progress
    await updateCallStatus(CallSid, { status: 'in_progress' });

    // Get conversation history
    const history = conversations.get(CallSid) || [];
    
    // Add user message to history
    const userMessage = SpeechResult || 'Voice input received';
    history.push({ role: 'user', content: userMessage });

    // Generate AI response
    let aiResponse = await generateAIResponse(userMessage, agent, history);
    
    // Check if this is a booking or qualification request
    let shouldEndCall = false;
    if (agent.enableAppointmentBooking && aiResponse.toLowerCase().includes('appointment')) {
      // Handle appointment booking
      aiResponse += ' Let me help you schedule that.';
    }

    // Add assistant message to history
    history.push({ role: 'assistant', content: aiResponse });
    conversations.set(CallSid, history);

    // Generate TwiML response
    const twiml = generateTwiMLResponse(aiResponse, !shouldEndCall);
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Error processing speech:', error);
    const twiml = generateTwiMLResponse('I apologize, I encountered an error. Let me transfer you.', false);
    res.type('text/xml').send(twiml);
  }
});

// Handle call status updates
router.post('/webhook/status', validateTwilioRequest, async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration, RecordingUrl } = req.body;
    
    console.log('Call status update:', { CallSid, CallStatus, CallDuration });

    const updates: any = {
      status: CallStatus === 'completed' ? 'completed' : CallStatus,
    };

    if (CallStatus === 'completed') {
      updates.endedAt = new Date();
      updates.duration = parseInt(CallDuration) || 0;
      updates.recordingUrl = RecordingUrl;

      // Get conversation transcript
      const history = conversations.get(CallSid) || [];
      const transcript = history
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join('\n\n');
      
      updates.transcript = transcript;

      // Clean up conversation from memory
      conversations.delete(CallSid);

      // Get call details for analysis
      const [call] = await db
        .select()
        .from(voiceCalls)
        .where(eq(voiceCalls.callSid, CallSid));

      if (call) {
        const agent = await getVoiceAgent(call.voiceAgentId);
        
        if (agent && transcript) {
          // Analyze call for qualification
          if (agent.enableLeadQualification) {
            const qualification = await analyzeCallForQualification(transcript, agent);
            updates.leadScore = qualification.score;
            updates.qualificationData = qualification.data;
            updates.outcome = qualification.outcome;
          }

          // Sync to CRM
          if (agent.enableCrmSync) {
            const crmContactId = await syncCallToCRM(
              { ...call, ...updates },
              updates.qualificationData
            );
            if (crmContactId) {
              updates.crmContactId = crmContactId;
            }
          }
        }
      }
    }

    await updateCallStatus(CallSid, updates);
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating call status:', error);
    res.sendStatus(500);
  }
});

// Handle outbound call
router.post('/webhook/outbound-handler', validateTwilioRequest, async (req, res) => {
  try {
    const { CallSid } = req.body;
    
    const [call] = await db
      .select()
      .from(voiceCalls)
      .where(eq(voiceCalls.callSid, CallSid));

    if (!call) {
      throw new Error('Call not found');
    }

    const agent = await getVoiceAgent(call.voiceAgentId);
    if (!agent) {
      throw new Error('Voice agent not found');
    }

    const greeting = agent.greeting || `Hello, this is ${agent.agentName} calling.`;
    const twiml = generateTwiMLResponse(greeting, true);
    
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Error handling outbound call:', error);
    res.sendStatus(500);
  }
});

// ===== API ENDPOINTS (Authenticated) =====

// Get voice agent for card
router.get('/agent/card/:cardId', requireAuth, async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = (req.user as any).id;

    // Verify card ownership
    const [card] = await db
      .select()
      .from(businessCards)
      .where(and(
        eq(businessCards.id, cardId),
        eq(businessCards.userId, userId)
      ));

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const agent = await getVoiceAgentByCardId(cardId);
    res.json({ success: true, data: agent });
  } catch (error) {
    console.error('Error getting voice agent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update voice agent
router.post('/agent', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const data = insertVoiceAgentSchema.parse(req.body);

    // Verify card ownership
    const [card] = await db
      .select()
      .from(businessCards)
      .where(and(
        eq(businessCards.id, data.cardId),
        eq(businessCards.userId, userId)
      ));

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if agent already exists for this card
    const existing = await getVoiceAgentByCardId(data.cardId);

    if (existing) {
      // Update existing agent
      const [updated] = await db
        .update(voiceAgents)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(voiceAgents.id, existing.id))
        .returning();

      res.json({ success: true, data: updated });
    } else {
      // Create new agent
      const [agent] = await db
        .insert(voiceAgents)
        .values({
          ...data,
          userId,
        })
        .returning();

      res.json({ success: true, data: agent });
    }
  } catch (error) {
    console.error('Error creating/updating voice agent:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get call history
router.get('/calls/card/:cardId', requireAuth, async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = (req.user as any).id;
    const limit = parseInt(req.query.limit as string) || 50;

    const agent = await getVoiceAgentByCardId(cardId);
    if (!agent || agent.userId !== userId) {
      return res.status(404).json({ error: 'Voice agent not found' });
    }

    const calls = await db
      .select()
      .from(voiceCalls)
      .where(eq(voiceCalls.voiceAgentId, agent.id))
      .orderBy(desc(voiceCalls.createdAt))
      .limit(limit);

    res.json({ success: true, data: calls });
  } catch (error) {
    console.error('Error getting calls:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Make outbound call
router.post('/call/outbound', requireAuth, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const { voiceAgentId, toNumber, message } = req.body;

    const agent = await getVoiceAgent(voiceAgentId);
    if (!agent || agent.userId !== userId) {
      return res.status(404).json({ error: 'Voice agent not found' });
    }

    const call = await makeOutboundCall(voiceAgentId, toNumber, message);
    
    res.json({ success: true, data: { callSid: call.sid } });
  } catch (error) {
    console.error('Error making outbound call:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get call transcript
router.get('/call/:callId/transcript', requireAuth, async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = (req.user as any).id;

    const [call] = await db
      .select()
      .from(voiceCalls)
      .where(eq(voiceCalls.id, callId));

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const agent = await getVoiceAgent(call.voiceAgentId);
    if (!agent || agent.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      success: true,
      data: {
        id: call.id,
        callSid: call.callSid,
        transcript: call.transcript,
        summary: call.summary,
        duration: call.duration,
        recordingUrl: call.recordingUrl,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
      },
    });
  } catch (error) {
    console.error('Error getting call transcript:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics for a card
router.get('/analytics/:cardId', requireAuth, async (req, res) => {
  try {
    const { cardId } = req.params;
    const userId = (req.user as any).id;

    const agent = await getVoiceAgentByCardId(cardId);
    if (!agent || agent.userId !== userId) {
      return res.status(404).json({ error: 'Voice agent not found' });
    }

    const calls = await db
      .select()
      .from(voiceCalls)
      .where(eq(voiceCalls.voiceAgentId, agent.id));

    const totalCalls = calls.length;
    const completedCalls = calls.filter(c => c.status === 'completed').length;
    const totalDuration = calls.reduce((sum, c) => sum + (c.duration || 0), 0);
    const appointmentsBooked = calls.filter(c => c.appointmentBooked).length;
    const leadsQualified = calls.filter(c => c.outcome === 'qualified').length;
    const inboundCalls = calls.filter(c => c.direction === 'inbound').length;
    const outboundCalls = calls.filter(c => c.direction === 'outbound').length;
    const missedCalls = calls.filter(c => c.status === 'no_answer' || c.status === 'failed').length;

    const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0;
    const appointmentConversionRate = totalCalls > 0 ? Math.round((appointmentsBooked / totalCalls) * 100) : 0;
    const qualificationRate = totalCalls > 0 ? Math.round((leadsQualified / totalCalls) * 100) : 0;
    const answerRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalCalls,
          completedCalls,
          totalDuration,
          avgDuration,
          appointmentsBooked,
          leadsQualified,
        },
        callTypes: {
          inbound: inboundCalls,
          outbound: outboundCalls,
          missed: missedCalls,
        },
        conversionRates: {
          appointmentConversionRate,
          qualificationRate,
          answerRate,
        },
        recentCalls: calls.slice(0, 10).map(c => ({
          id: c.id,
          callSid: c.callSid,
          direction: c.direction,
          status: c.status,
          callerNumber: c.callerNumber,
          duration: c.duration,
          outcome: c.outcome,
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Voice testing endpoint for demo/testing purposes (public for demo)
router.post('/test/simulate', async (req, res) => {
  try {
    const { action, message } = req.body;

    if (action === 'start') {
      // Simulate AI greeting
      const responses = [
        "Hello! I'm your AI voice assistant. How can I help you today?",
        "Hi there! Thanks for calling. I'm here to assist you with appointments, questions, or any information you need.",
        "Welcome! I'm an AI assistant ready to help. What would you like to know?",
      ];
      
      const greeting = responses[Math.floor(Math.random() * responses.length)];
      
      res.json({
        success: true,
        transcript: greeting,
        status: 'active',
      });
    } else if (action === 'speak' && message) {
      // Simulate AI response to user input
      const userMessage = message.toLowerCase();
      let aiResponse = '';
      
      if (userMessage.includes('appointment') || userMessage.includes('book')) {
        aiResponse = "I'd be happy to help you schedule an appointment! What date and time works best for you?";
      } else if (userMessage.includes('hour') || userMessage.includes('time')) {
        aiResponse = "We're open Monday through Friday, 9 AM to 6 PM, and Saturday 10 AM to 4 PM. Would you like to schedule something during these hours?";
      } else if (userMessage.includes('emergency') || userMessage.includes('urgent')) {
        aiResponse = "For emergency situations, please call our emergency hotline at 1-800-EMERGENCY. I can also connect you directly to our on-call staff if needed.";
      } else if (userMessage.includes('price') || userMessage.includes('cost')) {
        aiResponse = "Our pricing varies depending on the service you need. I can provide you with a detailed quote. What specific service are you interested in?";
      } else {
        aiResponse = "I understand. Let me help you with that. Could you provide more details so I can assist you better?";
      }
      
      res.json({
        success: true,
        transcript: `You: ${message}\n\nAI: ${aiResponse}`,
        status: 'active',
      });
    } else if (action === 'stop') {
      res.json({
        success: true,
        transcript: "Call ended. Thank you for testing the voice agent!",
        status: 'completed',
      });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Error in voice test simulation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Voice processing endpoint for business card voice assistants - WITH RAG
router.post('/process', requireAuth, async (req, res) => {
  try {
    const { audio, cardId, knowledgeBase, messages } = req.body;
    
    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    // Convert base64 audio to buffer
    const base64Data = audio.split(',')[1];
    const audioBuffer = Buffer.from(base64Data, 'base64');
    
    // Save temporarily for processing
    const tempPath = path.join('/tmp', `audio_${Date.now()}.webm`);
    fs.writeFileSync(tempPath, audioBuffer);
    
    try {
      // Transcribe audio using OpenAI Whisper
      const audioFile = fs.createReadStream(tempPath);
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });
      
      const userText = transcription.text;
      
      // Query knowledge base for relevant context
      const kbContext = await queryKnowledgeBase(userText, 5);
      
      // Generate AI response based on knowledge base and context
      const systemPrompt = knowledgeBase?.systemPrompt || 
        `You are a helpful AI assistant for a business. Be professional, friendly, and concise.`;
      
      const systemContent = kbContext
        ? `${systemPrompt}\n\nRelevant Knowledge Base Information:\n${kbContext}\n\nUse the provided knowledge base to answer questions accurately.`
        : systemPrompt;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemContent
          },
          ...messages,
          {
            role: 'user',
            content: userText
          }
        ],
        max_tokens: 500,
      });
      
      const aiResponse = response.choices[0].message.content;
      
      // Generate audio response using TTS
      const audioResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: aiResponse,
      });
      
      // Convert audio stream to base64
      const audioArrayBuffer = await audioResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');
      const audioDataUri = `data:audio/mpeg;base64,${audioBase64}`;
      
      res.json({
        transcript: userText,
        response: aiResponse,
        audioUrl: audioDataUri
      });
      
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  } catch (error: any) {
    console.error('Voice processing error:', error);
    res.status(500).json({ 
      error: 'Voice processing failed', 
      details: error.message 
    });
  }
});

// Text chat endpoint for business card voice assistants - WITH RAG
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message, cardId, knowledgeBase, messages } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Query knowledge base for relevant context
    const kbContext = await queryKnowledgeBase(message, 5);
    
    // Generate AI response based on knowledge base and context
    const systemPrompt = knowledgeBase?.systemPrompt || 
      `You are a helpful AI assistant for a business. Be professional, friendly, and concise.`;
    
    const systemContent = kbContext
      ? `${systemPrompt}\n\nRelevant Knowledge Base Information:\n${kbContext}\n\nUse the provided knowledge base to answer questions accurately.`
      : systemPrompt;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemContent
        },
        ...messages,
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
    });
    
    const aiResponse = response.choices[0].message.content;
    
    // Generate audio response using TTS
    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: aiResponse,
    });
    
    // Convert audio stream to base64
    const audioArrayBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');
    const audioDataUri = `data:audio/mpeg;base64,${audioBase64}`;
    
    res.json({
      response: aiResponse,
      audioUrl: audioDataUri
    });
    
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Chat failed', 
      details: error.message 
    });
  }
});

// Text-to-Speech endpoint
router.post('/tts', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Generate audio using OpenAI TTS
    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });
    
    // Convert audio stream to base64
    const audioArrayBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');
    const audioDataUri = `data:audio/mpeg;base64,${audioBase64}`;
    
    res.json({
      audioUrl: audioDataUri
    });
    
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ 
      error: 'TTS failed', 
      details: error.message 
    });
  }
});

export default router;
