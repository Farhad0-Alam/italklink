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
import { insertVoiceAgentSchema, insertVoiceLeadsSchema, insertKbDocsSchema, voiceLeads } from '@shared/schema';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const router = express.Router();

// Detect language from text using GPT
async function detectLanguageFromText(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Detect the language of this text and respond with ONLY the language code (e.g., 'en', 'bn', 'es', 'fr', 'de', etc.). Text: "${text}"`
        }
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const languageCode = response.choices[0].message.content?.toLowerCase().trim() || 'en';
    return languageCode;
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en'; // Default to English
  }
}

// Language detection and response mapping
const languageMap: Record<string, { name: string; ttsVoice: string }> = {
  'en': { name: 'English', ttsVoice: 'alloy' },
  'bn': { name: 'Bengali', ttsVoice: 'nova' },
  'es': { name: 'Spanish', ttsVoice: 'nova' },
  'fr': { name: 'French', ttsVoice: 'nova' },
  'de': { name: 'German', ttsVoice: 'nova' },
  'it': { name: 'Italian', ttsVoice: 'nova' },
  'pt': { name: 'Portuguese', ttsVoice: 'nova' },
  'ru': { name: 'Russian', ttsVoice: 'nova' },
  'ja': { name: 'Japanese', ttsVoice: 'nova' },
  'zh': { name: 'Chinese', ttsVoice: 'nova' },
  'ko': { name: 'Korean', ttsVoice: 'nova' },
  'ar': { name: 'Arabic', ttsVoice: 'nova' },
  'hi': { name: 'Hindi', ttsVoice: 'nova' },
  'th': { name: 'Thai', ttsVoice: 'nova' },
  'vi': { name: 'Vietnamese', ttsVoice: 'nova' },
  'tr': { name: 'Turkish', ttsVoice: 'nova' },
  'pl': { name: 'Polish', ttsVoice: 'nova' },
  'nl': { name: 'Dutch', ttsVoice: 'nova' },
  'sv': { name: 'Swedish', ttsVoice: 'nova' },
  'id': { name: 'Indonesian', ttsVoice: 'nova' },
};

function getSystemPromptForLanguage(language: string): string {
  const lang = language || 'en';
  const langName = languageMap[lang]?.name || 'English';
  
  const prompts: Record<string, string> = {
    'en': `You are a helpful TalkLink AI assistant. Respond in English. Be professional, friendly, and concise. Answer questions about our services.`,
    'bn': `আপনি TalkLink এর একজন সহায়ক AI। বাংলায় উত্তর দিন। বন্ধুত্বপূর্ণ এবং পেশাদার হন। আমাদের সেবা সম্পর্কে প্রশ্নের উত্তর দিন।`,
    'es': `Eres un asistente de IA de TalkLink. Responde en español. Sé profesional, amable y conciso.`,
    'fr': `Vous êtes un assistant IA TalkLink. Répondez en français. Soyez professionnel, amical et concis.`,
    'de': `Du bist ein TalkLink KI-Assistent. Antworte auf Deutsch. Sei professionell, freundlich und prägnant.`,
    'it': `Sei un assistente IA di TalkLink. Rispondi in italiano. Sii professionale, amichevole e conciso.`,
    'pt': `Você é um assistente de IA do TalkLink. Responda em português. Seja profissional, amável e conciso.`,
    'ru': `Вы помощник ИИ TalkLink. Отвечайте на русском языке. Будьте профессиональны, дружелюбны и лаконичны.`,
    'ja': `あなたはTalkLinkのAIアシスタントです。日本語で答えてください。専門的で親切で簡潔に。`,
    'zh': `你是TalkLink的AI助手。用中文回答。专业、友好和简洁。`,
    'ko': `당신은 TalkLink의 AI 어시스턴트입니다. 한국어로 답변하세요. 전문적이고 친절하며 간결하게.`,
    'ar': `أنت مساعد ذكاء اصطناعي TalkLink. أجب باللغة العربية. كن محترفًا ودودًا وموجزًا.`,
    'hi': `आप TalkLink के AI सहायक हैं। हिंदी में उत्तर दें। पेशेवर, मित्रवत और संक्षिप्त बनें।`,
    'th': `คุณเป็นผู้ช่วย AI ของ TalkLink ตอบเป็นภาษาไทย เป็นมืออาชีพ เป็นมิตร และกระชับ`,
    'vi': `Bạn là trợ lý AI của TalkLink. Trả lời bằng tiếng Việt. Hãy chuyên nghiệp, thân thiện và ngắn gọn.`,
  };
  
  return prompts[lang] || prompts['en'];
}

function getLeadGenerationPromptForLanguage(language: string): string {
  const lang = language || 'en';
  
  const prompts: Record<string, string> = {
    'en': `You are a lead generation assistant. Ask one question at a time to collect: name, email, phone, interested service, budget range, timeline, and notes. Always respond in English with a friendly tone. Return JSON with "reply" and "lead_state".`,
    'bn': `আপনি একজন লিড জেনারেশন সহায়ক। একবারে একটি প্রশ্ন করুন। নাম, ইমেইল, ফোন, সেবা, বাজেট, সময়সীমা সংগ্রহ করুন। সবসময় বাংলায় বন্ধুত্বপূর্ণভাবে উত্তর দিন। JSON ফরম্যাটে "reply" এবং "lead_state" রিটার্ন করুন।`,
    'es': `Eres un asistente de generación de clientes. Haz una pregunta a la vez. Recopila: nombre, correo, teléfono, servicio, presupuesto, cronograma. Siempre responde en español. Devuelve JSON con "reply" y "lead_state".`,
    'fr': `Vous êtes un assistant de génération de leads. Posez une question à la fois. Collectez: nom, email, téléphone, service, budget, délai. Répondez toujours en français. Retournez JSON avec "reply" et "lead_state".`,
    'de': `Du bist ein Lead-Generation-Assistent. Stelle eine Frage nach der anderen. Sammle: Name, E-Mail, Telefon, Service, Budget, Zeitplan. Antworte immer auf Deutsch. Geben Sie JSON mit "reply" und "lead_state" zurück.`,
    'it': `Sei un assistente di generazione di lead. Poni una domanda alla volta. Raccogli: nome, email, telefono, servizio, budget, timeline. Rispondi sempre in italiano. Restituisci JSON con "reply" e "lead_state".`,
    'pt': `Você é um assistente de geração de leads. Faça uma pergunta por vez. Colete: nome, email, telefone, serviço, orçamento, cronograma. Sempre responda em português. Retorne JSON com "reply" e "lead_state".`,
    'ru': `Вы помощник по генерации лидов. Задавайте по одному вопросу. Собирайте: имя, электронную почту, телефон, услугу, бюджет, график. Всегда отвечайте по-русски. Возвращайте JSON с "reply" и "lead_state".`,
    'ja': `あなたはリード生成アシスタントです。一度に1つの質問をしてください。名前、メール、電話、サービス、予算、スケジュールを収集します。常に日本語で答えてください。"reply"と"lead_state"でJSONを返します。`,
    'zh': `你是线索生成助手。一次提一个问题。收集：名称、电子邮件、电话、服务、预算、时间表。始终用中文回答。使用"reply"和"lead_state"返回JSON。`,
    'ko': `당신은 리드 생성 어시스턴트입니다. 한 번에 한 가지 질문을 하세요. 수집: 이름, 이메일, 전화, 서비스, 예산, 일정. 항상 한국어로 답변하세요. "reply"와 "lead_state"가 포함된 JSON을 반환하세요.`,
    'ar': `أنت مساعد توليد العملاء المحتملين. اطرح سؤالاً واحداً في كل مرة. اجمع: الاسم والبريد الإلكتروني والهاتف والخدمة والميزانية والجدول الزمني. أجب دائماً بالعربية. أعد JSON مع "reply" و"lead_state".`,
    'hi': `आप लीड जेनरेशन सहायक हैं। एक बार में एक प्रश्न पूछें। नाम, ईमेल, फोन, सेवा, बजट, समयसीमा एकत्र करें। हमेशा हिंदी में उत्तर दें। "reply" और "lead_state" के साथ JSON लौटाएं।`,
    'th': `คุณเป็นผู้ช่วยสร้างลีด ถามคำถามทีละข้อ รวบรวม: ชื่อ อีเมล โทรศัพท์ บริการ งบประมาณ ตารางเวลา ตอบเป็นภาษาไทยเสมอ ส่งกลับ JSON ด้วย "reply" และ "lead_state"`,
    'vi': `Bạn là trợ lý tạo ra khách hàng tiềm năng. Hỏi một câu hỏi một lần. Thu thập: tên, email, điện thoại, dịch vụ, ngân sách, lịch trình. Luôn trả lời bằng tiếng Việt. Trả về JSON với "reply" và "lead_state".`,
  };
  
  return prompts[lang] || prompts['en'];
}

// Initialize knowledge base with sample Bengali TalkLink content
async function initializeKnowledgeBase() {
  console.log('[KB Init] Starting knowledge base initialization...');
  try {
    const existingDocs = await db.select().from(kbDocs).limit(1);
    console.log('[KB Init] Checking for existing docs:', existingDocs.length);
    
    if (existingDocs.length > 0) {
      console.log('[KB Init] ✅ Knowledge base already initialized with', existingDocs.length, 'documents');
      return;
    }

    console.log('[KB Init] Creating sample Bengali TalkLink content...');
    const sampleDocuments = [
      {
        title: 'TalkLink পরিষেবা সম্পর্কে',
        content: 'TalkLink একটি ডিজিটাল বিজনেস কার্ড প্ল্যাটফর্ম যা আপনাকে পেশাদার ব্যবসায়িক কার্ড তৈরি করতে সাহায্য করে। এটি অ্যাপয়েন্টমেন্ট বুকিং, CRM সিস্টেম এবং বিশ্লেষণ সরঞ্জাম প্রদান করে।',
        url: 'https://talkl.ink',
      },
      {
        title: 'অ্যাপয়েন্টমেন্ট বুকিং সিস্টেম',
        content: 'আমাদের অ্যাপয়েন্টমেন্ট বুকিং সিস্টেম আপনাকে আপনার সময় পরিচালনা করতে এবং স্বয়ংক্রিয় শিডিউলিং সরবরাহ করে। এটি Google ক্যালেন্ডার, Zoom এবং Microsoft Teams এর সাথে সংযুক্ত হয়। আপনি একাধিক ইভেন্ট টাইপ তৌরি করতে পারেন এবং স্বয়ংক্রিয় বিজ্ঞপ্তি পাঠাতে পারেন।',
        url: 'https://talkl.ink',
      },
      {
        title: 'বিজনেস কার্ড কাস্টমাইজেশন',
        content: 'আপনার বিজনেস কার্ডকে সম্পূর্ণরূপে কাস্টমাইজ করুন। রং, ফন্ট, লোগো এবং লেআউট পরিবর্তন করুন। একাধিক টেমপ্লেট থেকে বেছে নিন বা নিজের ডিজাইন তৈরি করুন। QR কোড সহ শেয়ারযোগ্য লিঙ্ক পান।',
        url: 'https://talkl.ink',
      },
      {
        title: 'CRM এবং লিড ম্যানেজমেন্ট',
        content: 'আমাদের CRM সিস্টেম স্বয়ংক্রিয়ভাবে লিড ক্যাপচার করে এবং সংগঠিত করে। যোগাযোগ তথ্য, ডিল পাইপলাইন এবং কার্যক্রম ট্র্যাক করুন। আপনার দলের সাথে সহযোগিতা করুন এবং বিক্রয় প্রক্রিয়া অপ্টিমাইজ করুন।',
        url: 'https://talkl.ink',
      },
      {
        title: 'বিশ্লেষণ এবং রিপোর্টিং',
        content: 'বিস্তারিত বিশ্লেষণ এবং রিপোর্ট পান। বুকিং ট্রেন্ড, রূপান্তর হার এবং জনপ্রিয় সময় দেখুন। আপনার ব্যবসায়িক কর্মক্ষমতা ট্র্যাক করুন এবং ডেটা-চালিত সিদ্ধান্ত নিন।',
        url: 'https://talkl.ink',
      },
      {
        title: 'ইমেল স্বাক্ষর জেনারেটর',
        content: 'পেশাদার ইমেল স্বাক্ষর তৈরি করুন। আপনার যোগাযোগের বিবরণ, সোশ্যাল মিডিয়া লিঙ্ক এবং লোগো যোগ করুন। HTML কোড সরাসরি আপনার ইমেল ক্লায়েন্টে কপি করুন।',
        url: 'https://talkl.ink',
      },
    ];

    console.log('[KB Init] Saving', sampleDocuments.length, 'documents with embeddings...');
    let savedCount = 0;
    for (const doc of sampleDocuments) {
      try {
        console.log(`[KB Init] Generating embedding for: ${doc.title}`);
        const embedding = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: doc.content,
        });

        console.log(`[KB Init] Embedding generated, vector size: ${embedding.data[0].embedding.length}`);
        await db.insert(kbDocs).values({
          ...doc,
          embedding: embedding.data[0].embedding,
        });

        savedCount++;
        console.log(`[KB Init] ✅ Saved: ${doc.title}`);
      } catch (err) {
        console.error(`[KB Init] ❌ Failed to save ${doc.title}:`, {
          error: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack?.substring(0, 100) : undefined,
        });
      }
    }

    console.log(`[KB Init] ✅ Knowledge base initialization complete! Saved ${savedCount}/${sampleDocuments.length} documents`);
  } catch (error) {
    console.error('[KB Init] ❌ Knowledge base initialization error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.substring(0, 200) : undefined,
    });
  }
}

// Helper function to query knowledge base with RAG
async function queryKnowledgeBase(query: string, topK: number = 5): Promise<string> {
  try {
    console.log('[RAG Query] Starting query:', query.substring(0, 50) + '...');
    
    // Generate embedding for the query
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryVector = embedding.data[0].embedding;
    console.log('[RAG Query] Generated query vector, size:', queryVector.length);

    // Query similar documents using vector similarity - FIXED pgvector format
    const vectorString = JSON.stringify(queryVector);
    console.log('[RAG Query] Vector string length:', vectorString.length);
    
    const similarDocs = await db
      .select({
        title: kbDocs.title,
        content: kbDocs.content,
        url: kbDocs.url,
      })
      .from(kbDocs)
      .where(sql`embedding IS NOT NULL`)
      .orderBy(sql`embedding <-> ${vectorString}::vector`)
      .limit(topK);

    console.log('[RAG Query] Retrieved', similarDocs.length, 'similar documents');

    if (similarDocs.length === 0) {
      console.log('[RAG Query] No similar documents found, returning empty context');
      return '';
    }

    // Format retrieved documents as context
    const context = similarDocs
      .map((doc) => `${doc.title}: ${doc.content}`)
      .join('\n\n');

    console.log('[RAG Query] ✅ Context prepared, size:', context.length, 'characters');
    return context;
  } catch (error) {
    console.error('[RAG Query] ❌ Knowledge base query error:', {
      error: error instanceof Error ? error.message : String(error),
      query: query.substring(0, 50),
      stack: error instanceof Error ? error.stack?.substring(0, 150) : undefined,
    });
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
  const requestId = `voice_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  console.log(`[${requestId}] POST /api/voice/process - Request received`);
  
  try {
    const { audio, cardId, knowledgeBase, messages } = req.body;
    
    console.log(`[${requestId}] Request body check:`, {
      hasAudio: !!audio,
      audioLength: audio ? audio.length : 0,
      audioPrefix: audio ? audio.substring(0, 30) : 'N/A',
      cardId,
      messagesCount: messages ? messages.length : 0,
    });
    
    if (!audio) {
      console.error(`[${requestId}] ❌ No audio data provided`);
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    console.log(`[${requestId}] Converting base64 audio to buffer...`);
    // Convert base64 audio to buffer
    const base64Data = audio.split(',')[1] || audio;
    const audioBuffer = Buffer.from(base64Data, 'base64');
    console.log(`[${requestId}] Audio buffer created, size: ${audioBuffer.length} bytes`);
    
    if (audioBuffer.length === 0) {
      console.error(`[${requestId}] ❌ Audio buffer is empty`);
      return res.status(400).json({ error: 'Audio buffer is empty' });
    }
    
    // Save temporarily for processing
    const tempPath = path.join('/tmp', `audio_${Date.now()}.webm`);
    fs.writeFileSync(tempPath, audioBuffer);
    console.log(`[${requestId}] Audio saved to temp file: ${tempPath}`);
    
    try {
      // Transcribe audio using OpenAI Whisper
      console.log(`[${requestId}] Starting Whisper transcription...`);
      const audioFile = fs.createReadStream(tempPath);
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });
      
      const userText = transcription.text;
      console.log(`[${requestId}] ✅ Transcription complete: "${userText}"`);
      
      // Query knowledge base for relevant context
      console.log(`[${requestId}] Querying knowledge base...`);
      const kbContext = await queryKnowledgeBase(userText, 5);
      console.log(`[${requestId}] Knowledge base context retrieved, size: ${kbContext.length} characters`);
      
      // Generate AI response based on knowledge base and context
      const systemPrompt = knowledgeBase?.systemPrompt || 
        `You are a helpful AI assistant for a business. Be professional, friendly, and concise.`;
      
      const systemContent = kbContext
        ? `${systemPrompt}\n\nRelevant Knowledge Base Information:\n${kbContext}\n\nUse the provided knowledge base to answer questions accurately.`
        : systemPrompt;
      
      console.log(`[${requestId}] Calling GPT-4o for response generation...`);
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
      console.log(`[${requestId}] ✅ AI response generated: "${aiResponse?.substring(0, 50)}..."`);
      
      // Generate audio response using TTS
      console.log(`[${requestId}] Generating TTS audio...`);
      const audioResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: aiResponse || 'I could not generate a response.',
      });
      
      // Convert audio stream to base64
      const audioArrayBuffer = await audioResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');
      const audioDataUri = `data:audio/mpeg;base64,${audioBase64}`;
      console.log(`[${requestId}] ✅ TTS audio generated, size: ${audioBase64.length} characters`);
      
      console.log(`[${requestId}] ✅ Sending response to frontend`);
      res.json({
        transcript: userText,
        response: aiResponse,
        audioUrl: audioDataUri
      });
      
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        console.log(`[${requestId}] Cleaned up temp file`);
      }
    }
  } catch (error: any) {
    console.error(`[${requestId}] ❌ Voice processing error:`, {
      name: error?.name,
      message: error?.message,
      stack: error?.stack?.substring(0, 200),
      code: error?.code,
    });
    res.status(500).json({ 
      error: 'Voice processing failed', 
      details: error?.message || 'Unknown error',
      requestId,
    });
  }
});

// Text chat endpoint for business card voice assistants - WITH RAG & BENGALI SUPPORT
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message, cardId, knowledgeBase, messages = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Query knowledge base for relevant context
    const kbContext = await queryKnowledgeBase(message, 5);
    
    // System prompt in Bengali for better responses
    const systemPrompt = knowledgeBase?.systemPrompt || 
      `আপনি TalkLink এর একজন সহায়ক AI। বাংলায় বন্ধুত্বপূর্ণ এবং পেশাদার উত্তর প্রদান করুন। সংক্ষিপ্ত এবং স্পষ্ট হন।`;
    
    const systemContent = kbContext
      ? `${systemPrompt}\n\nজ্ঞান ভিত্তি তথ্য:\n${kbContext}\n\nএই তথ্য ব্যবহার করে প্রশ্নের উত্তর দিন।`
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
    
    // Generate audio response using TTS with Bengali-friendly voice
    const audioResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova', // Better for multilingual including Bengali
      input: aiResponse,
    });
    
    // Convert audio stream to base64
    const audioArrayBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');
    const audioDataUri = `data:audio/mpeg;base64,${audioBase64}`;
    
    res.json({
      response: aiResponse,
      audioUrl: audioDataUri,
      transcript: message
    });
    
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Chat failed', 
      details: error.message 
    });
  }
});

// Voice-based lead generation endpoint
router.post('/voice-lead', requireAuth, async (req, res) => {
  try {
    const { audio, conversationHistory = [], leadState = {} } = req.body;
    
    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }
    
    // Convert base64 audio to buffer
    const base64Data = audio.split(',')[1];
    const audioBuffer = Buffer.from(base64Data, 'base64');
    
    // Save temporarily for processing
    const tempPath = path.join('/tmp', `lead_audio_${Date.now()}.webm`);
    fs.writeFileSync(tempPath, audioBuffer);
    
    try {
      // Transcribe audio
      const audioFile = fs.createReadStream(tempPath);
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });
      
      const userText = transcription.text;
      
      // Detect language from transcribed text
      const detectedLanguage = await detectLanguageFromText(userText);
      
      // Get system prompt and TTS voice for detected language
      const systemPrompt = getLeadGenerationPromptForLanguage(detectedLanguage);
      const ttsVoice = languageMap[detectedLanguage]?.ttsVoice || 'nova';
      
      // Query knowledge base if user asks questions
      const kbContext = await queryKnowledgeBase(userText, 3);
      
      // Generate AI response
      const messages = [
        ...conversationHistory,
        { role: 'user' as const, content: userText }
      ];
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: kbContext 
              ? `${systemPrompt}\n\nKnowledge Base:\n${kbContext}`
              : systemPrompt
          },
          ...messages,
          {
            role: 'user',
            content: userText
          }
        ],
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });
      
      const aiMessage = response.choices[0].message.content;
      const parsedResponse = JSON.parse(aiMessage);
      
      // Update lead state
      const updatedLeadState = {
        ...leadState,
        ...Object.fromEntries(
          Object.entries(parsedResponse.lead_state).filter(([, v]) => v !== null)
        )
      };
      
      // Save to database if we have enough info
      if (updatedLeadState.fullName || updatedLeadState.email || updatedLeadState.phone) {
        await db.insert(voiceLeads).values({
          fullName: updatedLeadState.fullName,
          email: updatedLeadState.email,
          phone: updatedLeadState.phone,
          interestedService: updatedLeadState.interestedService,
          budgetRange: updatedLeadState.budgetRange,
          timeline: updatedLeadState.timeline,
          extraNotes: updatedLeadState.extraNotes,
          conversationHistory: [...conversationHistory, { role: 'user', content: userText }, { role: 'assistant', content: aiMessage }]
        });
      }
      
      // Generate TTS for reply in detected language
      const audioResponse = await openai.audio.speech.create({
        model: 'tts-1',
        voice: ttsVoice as any,
        input: parsedResponse.reply,
      });
      
      const audioArrayBuffer = await audioResponse.arrayBuffer();
      const audioBase64 = Buffer.from(audioArrayBuffer).toString('base64');
      const audioDataUri = `data:audio/mpeg;base64,${audioBase64}`;
      
      res.json({
        transcript: userText,
        reply: parsedResponse.reply,
        lead_state: updatedLeadState,
        audioUrl: audioDataUri,
        conversationHistory: [...conversationHistory, { role: 'user', content: userText }, { role: 'assistant', content: aiMessage }]
      });
      
    } finally {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    }
  } catch (error: any) {
    console.error('Voice lead error:', error);
    res.status(500).json({ 
      error: 'Voice lead processing failed', 
      details: error.message 
    });
  }
});

// Learn KB - Save new knowledge to vector database
router.post('/learn-kb', requireAuth, async (req, res) => {
  try {
    const { content, title = 'Auto-learned', url = 'auto' } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    
    // Generate embedding
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    });
    
    const vector = embedding.data[0].embedding;
    
    // Save to knowledge base
    await db.insert(kbDocs).values({
      content,
      title,
      url,
      embedding: vector,
    });
    
    res.json({ success: true, message: 'Knowledge saved successfully' });
  } catch (error: any) {
    console.error('Learn KB error:', error);
    res.status(500).json({ error: 'Failed to save knowledge', details: error.message });
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

// Initialize knowledge base when router is loaded
console.log('[KB Router] Initializing knowledge base on startup...');
initializeKnowledgeBase().catch(err => {
  console.error('[KB Router] Failed to initialize KB:', err);
});

export default router;
