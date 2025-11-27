import express from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import { ingestUrl, ingestText, retrieveSimilarContent } from './ingest';
import { requireAuth } from './auth';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const CHAT_MODEL = process.env.CHAT_MODEL || 'gpt-4o';

// Request schemas
const ingestRequestSchema = z.object({
  url: z.string().url('Valid URL required'),
});

const ingestTextRequestSchema = z.object({
  text: z.string().min(10, 'Text must be at least 10 characters'),
  title: z.string().optional().default('Manual Text Entry'),
});

const chatRequestSchema = z.object({
  query: z.string().min(1, 'Query required'),
  topK: z.number().min(1).max(20).optional().default(5),
});

// POST /api/ingest - Ingest URL content (PER-USER)
router.post('/ingest', requireAuth, async (req, res) => {
  try {
    const { url } = ingestRequestSchema.parse(req.body);
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('Ingesting URL for user', userId, ':', url);
    const result = await ingestUrl(userId, url);
    
    if (result.ok) {
      res.json({
        ok: true,
        url: result.url,
        title: result.title,
        chunks: result.chunks,
      });
    } else {
      res.status(422).json({
        error: result.error || 'Failed to ingest content',
      });
    }
  } catch (error) {
    console.error('Ingest error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/ingest-text - Ingest raw text content (PER-USER)
router.post('/ingest-text', requireAuth, async (req, res) => {
  try {
    const { text, title } = ingestTextRequestSchema.parse(req.body);
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('Ingesting text for user', userId, ':', title);
    const result = await ingestText(userId, text, title);
    
    if (result.ok) {
      res.json({
        ok: true,
        url: result.url,
        title: result.title,
        chunks: result.chunks,
      });
    } else {
      res.status(422).json({
        error: result.error || 'Failed to ingest text',
      });
    }
  } catch (error) {
    console.error('Ingest text error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/chat - RAG-powered chat (PER-USER)
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { query, topK } = chatRequestSchema.parse(req.body);
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('RAG chat query for user', userId, ':', query);
    
    // 1. Retrieve similar content - USER-SPECIFIC
    const similarDocs = await retrieveSimilarContent(userId, query, topK);
    console.log('Found', similarDocs.length, 'similar documents for user', userId);
    
    if (similarDocs.length === 0) {
      return res.json({
        answer: "I don't have any information in my knowledge base to answer that question. Please try asking about content that has been ingested.",
        sources: [],
      });
    }
    
    // 2. Build context with numbered brackets
    const context = similarDocs
      .map((doc, index) => `[#${index + 1}] ${doc.content}`)
      .join('\n\n');
    
    // 3. Generate answer using chat model
    const systemPrompt = `You are a helpful AI assistant. Answer the user's question based on the provided context below. Use the context to provide a helpful answer, and if the context provides relevant information, elaborate appropriately. Always include short citations like [#1] when referencing specific information. 

When answering about companies or brands, be flexible with name variations (e.g., "TalkLink", "TalkLink", "2talklink" all refer to the same company). If the context doesn't contain enough information to answer the question, say you don't have sufficient information.

Context:
${context}`;

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });
    
    const answer = completion.choices[0]?.message?.content || 'No response generated';
    
    // 4. Build sources array
    const sources = similarDocs.map((doc, index) => ({
      id: `#${index + 1}`,
      url: doc.url,
      title: doc.title || new URL(doc.url).hostname,
      score: Math.round(doc.score * 100) / 100,
    }));
    
    console.log('Generated answer with', sources.length, 'sources');
    
    res.json({
      answer,
      sources,
    });
  } catch (error) {
    console.error('Chat error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/rag/tts - Convert text to speech (AUTHENTICATED)
router.post('/tts', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!text) {
      return res.status(400).json({ error: 'Text required' });
    }

    console.log('TTS request for user', userId, ':', { textLength: text.length });

    // Generate speech using OpenAI
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());
    
    // Create data URL for audio
    const base64Audio = buffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

    res.json({
      audioUrl,
      success: true,
    });
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
});

// POST /api/rag/stt - Convert speech to text (AUTHENTICATED - using Realtime API for chat)
router.post('/stt', requireAuth, async (req, res) => {
  try {
    const { audio } = req.body;
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!audio) {
      return res.status(400).json({ error: 'Audio data required' });
    }

    console.log('STT request for user', userId);

    // Convert base64 audio to buffer
    const base64Data = audio.split(',')[1] || audio;
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Transcribe using OpenAI Whisper
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-1',
      language: 'en',
    });

    console.log('Transcription:', transcriptionResponse.text);

    res.json({
      transcript: transcriptionResponse.text,
      success: true,
    });
  } catch (error) {
    console.error('STT error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

export default router;