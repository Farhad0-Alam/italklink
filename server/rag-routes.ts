import express from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import { ingestUrl, ingestText, retrieveSimilarContent } from './ingest';

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

// POST /api/ingest - Ingest URL content
router.post('/ingest', async (req, res) => {
  try {
    const { url } = ingestRequestSchema.parse(req.body);
    
    console.log('Ingesting URL:', url);
    const result = await ingestUrl(url);
    
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

// POST /api/ingest-text - Ingest raw text content
router.post('/ingest-text', async (req, res) => {
  try {
    const { text, title } = ingestTextRequestSchema.parse(req.body);
    
    console.log('Ingesting text:', title);
    const result = await ingestText(text, title);
    
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

// POST /api/chat - RAG-powered chat
router.post('/chat', async (req, res) => {
  try {
    const { query, topK } = chatRequestSchema.parse(req.body);
    
    console.log('RAG chat query:', query);
    
    // 1. Retrieve similar content
    const similarDocs = await retrieveSimilarContent(query, topK);
    console.log('Found', similarDocs.length, 'similar documents');
    
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

export default router;