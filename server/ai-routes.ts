import type { Express } from "express";
import OpenAI from 'openai';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import multer from 'multer';
import { requireAuth } from './auth';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Setup multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to extract text from PDF buffer (simplified for now)
async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    // For now, return a placeholder - will implement proper PDF parsing later
    return 'PDF content extraction will be implemented shortly';
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return '';
  }
}

// Helper function to extract text from website
async function extractWebsiteText(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());
    
    // Get text content and clean it up
    const text = document.body.textContent || '';
    return text.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error('Error extracting website text:', error);
    return '';
  }
}

export function setupAIRoutes(app: Express) {
  // AI Chat endpoint
  app.post('/api/ai/chat', requireAuth, async (req, res) => {
    try {
      const { message, knowledgeBase, conversationHistory } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }

      // Build context from knowledge base
      let context = '';
      
      if (knowledgeBase) {
        if (knowledgeBase.textContent) {
          context += `Knowledge Base Content: ${knowledgeBase.textContent}\n\n`;
        }
        
        if (knowledgeBase.websiteUrl) {
          try {
            const websiteText = await extractWebsiteText(knowledgeBase.websiteUrl);
            if (websiteText) {
              context += `Website Content from ${knowledgeBase.websiteUrl}: ${websiteText.slice(0, 2000)}\n\n`;
            }
          } catch (error) {
            console.error('Website extraction failed:', error);
          }
        }
      }

      // Create messages for OpenAI - filter out any null/empty content
      const filteredHistory = (conversationHistory || []).filter(
        (msg: any) => msg && msg.content && msg.content.trim()
      );
      
      const messages = [
        {
          role: 'system' as const,
          content: `You are a helpful AI assistant. You have access to the following knowledge base information:\n\n${context}\n\nPlease use this information to answer questions accurately. If the user asks about something not in the knowledge base, you can use your general knowledge but mention that it's not from the provided knowledge base.`
        },
        ...filteredHistory,
        {
          role: 'user' as const,
          content: message
        }
      ];

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      res.json({ 
        response,
        usage: completion.usage
      });
    } catch (error) {
      console.error('AI Chat error:', error);
      res.status(500).json({ message: 'Failed to process chat request' });
    }
  });

  // Voice transcription endpoint
  app.post('/api/ai/transcribe', requireAuth, upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Audio file is required' });
      }

      // Convert to a supported format - use wav as filename
      const transcription = await openai.audio.transcriptions.create({
        file: new File([req.file.buffer], 'audio.wav', { type: 'audio/wav' }),
        model: 'whisper-1',
      });

      res.json({ text: transcription.text });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ message: 'Failed to transcribe audio' });
    }
  });

  // Text to speech endpoint
  app.post('/api/ai/speak', requireAuth, async (req, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: 'Text is required' });
      }

      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      });
      
      res.send(buffer);
    } catch (error) {
      console.error('Text-to-speech error:', error);
      res.status(500).json({ message: 'Failed to generate speech' });
    }
  });

  // PDF upload and processing endpoint
  app.post('/api/ai/upload-pdf', requireAuth, upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'PDF file is required' });
      }

      const text = await extractPDFText(req.file.buffer);
      
      res.json({ 
        filename: req.file.originalname,
        text: text.slice(0, 5000), // Limit to first 5000 characters
        fullLength: text.length
      });
    } catch (error) {
      console.error('PDF processing error:', error);
      res.status(500).json({ message: 'Failed to process PDF' });
    }
  });
}