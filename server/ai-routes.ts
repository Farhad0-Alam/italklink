import type { Express } from "express";
import OpenAI from 'openai';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import multer from 'multer';
import { requireAuth, requireOwner } from './auth';

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
    console.log('Starting website extraction for URL:', url);
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
        'DNT': '1'
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`HTTP ${response.status} error for ${url}: ${response.statusText}`);
      if (response.status === 403) {
        console.log('Website is blocking requests. This may be due to anti-bot protection.');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log('Received HTML content, length:', html.length);
    
    // FIRST: Extract meta tags directly from raw HTML (before JSDOM processing)
    let metaContent = '';
    
    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      metaContent += `Title: ${titleMatch[1].trim()} `;
      console.log('Found title in raw HTML:', titleMatch[1].trim());
    }
    
    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    if (descMatch) {
      metaContent += `Description: ${descMatch[1].trim()} `;
      console.log('Found meta description in raw HTML:', descMatch[1].substring(0, 100) + '...');
    }
    
    // Extract og:title
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      metaContent += `Social Title: ${ogTitleMatch[1].trim()} `;
      console.log('Found OG title in raw HTML:', ogTitleMatch[1].trim());
    }
    
    // Extract og:description
    const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    if (ogDescMatch) {
      metaContent += `Social Description: ${ogDescMatch[1].trim()} `;
      console.log('Found OG description in raw HTML:', ogDescMatch[1].substring(0, 100) + '...');
    }
    
    // If we found meta content, use it immediately
    if (metaContent.trim()) {
      console.log('Successfully extracted meta content from raw HTML, length:', metaContent.length);
      return metaContent.trim();
    }
    
    console.log('No meta content found in raw HTML, proceeding with DOM extraction...');
    const dom = new JSDOM(html, { runScripts: "dangerously" });
    const document = dom.window.document;
    
    // Debug: Log HTML structure and meta tags
    console.log('HTML title:', document.title);
    console.log('HTML body preview:', document.body?.innerHTML?.substring(0, 500) + '...');
    
    // Debug meta tags
    const metaDesc = document.querySelector('meta[name="description"]');
    const debugOgTitle = document.querySelector('meta[property="og:title"]');
    console.log('Meta description found:', metaDesc?.getAttribute('content')?.substring(0, 100));
    console.log('OG title found:', debugOgTitle?.getAttribute('content'));
    
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style, nav, footer, aside');
    scripts.forEach(script => script.remove());
    
    // Try multiple extraction strategies
    let text = '';
    
    // Strategy 1: Extract from meta tags (title, description, og tags)
    const metaTexts = [];
    const title = document.title || document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    if (title) {
      metaTexts.push(`Title: ${title}`);
    }
    
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') ||
                      document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    if (description) {
      metaTexts.push(`Description: ${description}`);
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content');
    const twitterDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
    
    if (ogTitle && ogTitle !== title) metaTexts.push(`Social Title: ${ogTitle}`);
    if (ogDesc && ogDesc !== description) metaTexts.push(`Social Description: ${ogDesc}`);
    if (twitterTitle && twitterTitle !== title) metaTexts.push(`Twitter Title: ${twitterTitle}`);
    if (twitterDesc && twitterDesc !== description) metaTexts.push(`Twitter Description: ${twitterDesc}`);
    
    if (metaTexts.length > 0) {
      text = metaTexts.join(' ');
      console.log('Extracted from meta tags, parts found:', metaTexts.length);
      console.log('Meta texts:', metaTexts);
    } else {
      console.log('No meta tag content found! Checking what went wrong...');
      console.log('Title check:', title);
      console.log('Description check:', description);
    }
    
    // Strategy 2: Try main content areas
    if (!text.trim()) {
      const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content', '.main-content'];
      for (const selector of mainSelectors) {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          text = element.textContent;
          console.log('Extracted from', selector);
          break;
        }
      }
    }
    
    // Strategy 2: Try body if main content failed
    if (!text.trim() && document.body?.textContent?.trim()) {
      text = document.body.textContent;
      console.log('Extracted from document.body');
    }
    
    // Strategy 3: Try full document as last resort
    if (!text.trim() && document.documentElement?.textContent?.trim()) {
      text = document.documentElement.textContent;
      console.log('Extracted from document.documentElement');
    }
    
    // Strategy 4: Extract from all visible text elements
    if (!text.trim()) {
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div, span, li, td, th');
      const textParts = Array.from(textElements).map(el => el.textContent?.trim()).filter(t => t && t.length > 10);
      text = textParts.join(' ');
      console.log('Extracted from individual elements, parts found:', textParts.length);
    }
    
    // Strategy 5: Extract from Next.js/React JSON data in script tags
    if (!text.trim()) {
      console.log('DOM extraction failed, trying to extract from script tags...');
      const scriptTags = Array.from(document.querySelectorAll('script'));
      
      for (const script of scriptTags) {
        const scriptContent = script.textContent || script.innerHTML;
        
        // Look for Next.js __NEXT_DATA__ 
        if (scriptContent.includes('__NEXT_DATA__')) {
          try {
            const match = scriptContent.match(/window\.__NEXT_DATA__\s*=\s*({.*?});?\s*$/);
            if (match) {
              const data = JSON.parse(match[1]);
              // Extract text from the props/page data
              const jsonText = JSON.stringify(data).replace(/[{}[\]"]/g, ' ').replace(/[:,]/g, ' ');
              text = jsonText.replace(/\s+/g, ' ').trim();
              console.log('Extracted from __NEXT_DATA__, length:', text.length);
              break;
            }
          } catch (e) {
            console.log('Failed to parse __NEXT_DATA__');
          }
        }
        
        // Look for any JSON data in scripts
        if (scriptContent.includes('{') && scriptContent.includes('"')) {
          try {
            // Try to extract any JSON-like data from scripts
            const jsonMatches = scriptContent.match(/\{[^{}]*"[^"]*"[^{}]*\}/g);
            if (jsonMatches) {
              const combinedData = jsonMatches.join(' ');
              const cleanedData = combinedData.replace(/[{}[\]"]/g, ' ').replace(/[:,]/g, ' ');
              if (cleanedData.length > text.length) {
                text = cleanedData.replace(/\s+/g, ' ').trim();
                console.log('Extracted from script JSON data, length:', text.length);
                break;
              }
            }
          } catch (e) {
            // Continue trying other scripts
          }
        }
      }
    }

    // Strategy 6: Last resort - extract from raw HTML with regex  
    if (!text.trim()) {
      console.log('All extraction methods failed, trying raw HTML parsing...');
      // Remove script and style tags from HTML
      const cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
      // Extract text between HTML tags
      const textMatches = cleanHtml.match(/>([^<]+)</g);
      if (textMatches) {
        text = textMatches.map(match => match.slice(1, -1).trim()).filter(t => t.length > 5).join(' ');
        console.log('Extracted from raw HTML, text parts found:', textMatches.length);
      }
    }
    
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    console.log('Extracted text length:', cleanText.length);
    console.log('Text preview:', cleanText.substring(0, 200) + '...');
    
    return cleanText;
  } catch (error) {
    console.error('Error extracting website text from', url, ':', error);
    return '';
  }
}

// AI Template Design endpoint
export function setupAITemplateDesign(app: Express) {
  app.post('/api/admin/ai-design-template', requireOwner, async (req, res) => {
    try {
      const { prompt, currentTemplate } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'Design prompt is required' });
      }

      const systemPrompt = `You are a professional business card designer. Based on the user's description, generate a complete design specification for a business card template.

Current Template Context:
${currentTemplate ? JSON.stringify(currentTemplate, null, 2) : 'No current template provided'}

Respond with JSON in this exact format:
{
  "templateName": "string - creative name for this design",
  "description": "string - brief description of the design concept",
  "colors": {
    "brandColor": "string - primary brand color (hex)",
    "accentColor": "string - accent/highlight color (hex)", 
    "textColor": "string - main text color (hex)",
    "backgroundColor": "string - background color (hex)",
    "headingColor": "string - heading text color (hex)",
    "paragraphColor": "string - paragraph text color (hex)",
    "secondaryColor": "string - secondary element color (hex)",
    "tertiaryColor": "string - tertiary element color (hex)"
  },
  "layout": {
    "template": "minimal|bold|photo|dark - choose template type",
    "headerDesign": "cover-logo|split-design|profile-center - choose header layout"
  },
  "typography": {
    "fontSize": "number - base font size in pixels (14-18)",
    "fontWeight": "number - font weight (300-700)",
    "fontFamily": "string - font family name"
  },
  "reasoning": "string - explain your design choices and why they work well"
}

Design Guidelines:
- Consider modern business card trends and professional aesthetics
- Ensure good contrast and readability
- Choose colors that work well together
- Make typography choices that enhance professionalism
- Explain your reasoning for the design decisions`;

      const response = await openai.chat.completions.create({
        model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const designData = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate the response structure
      if (!designData.colors || !designData.layout || !designData.typography) {
        throw new Error('Invalid AI response format');
      }

      res.json(designData);

    } catch (error) {
      console.error('AI template design failed:', error);
      res.status(500).json({ 
        error: 'Failed to generate design',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
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
      let hasTextKnowledge = false;
      let hasWebsiteKnowledge = false;
      
      console.log('Processing knowledge base:', JSON.stringify(knowledgeBase, null, 2));
      console.log('Knowledge base websiteUrl check:', knowledgeBase?.websiteUrl);
      
      if (knowledgeBase) {
        if (knowledgeBase.textContent) {
          context += `TEXT KNOWLEDGE BASE:\n${knowledgeBase.textContent}\n\n`;
          hasTextKnowledge = true;
          console.log('Added text knowledge:', knowledgeBase.textContent.substring(0, 100) + '...');
        }
        
        if (knowledgeBase.websiteUrl) {
          try {
            console.log('Extracting website data from:', knowledgeBase.websiteUrl);
            const websiteText = await extractWebsiteText(knowledgeBase.websiteUrl);
            if (websiteText && websiteText.trim().length > 0) {
              context += `WEBSITE KNOWLEDGE BASE from ${knowledgeBase.websiteUrl}:\n${websiteText.slice(0, 2000)}\n\n`;
              hasWebsiteKnowledge = true;
              console.log('Successfully extracted website content:', websiteText.substring(0, 100) + '...');
            } else {
              console.log('No website content extracted or content was empty');
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
          content: `You are a helpful AI assistant. You have access to knowledge from multiple sources:

${context}

IMPORTANT: When answering questions, always specify your source:
- If information comes from TEXT KNOWLEDGE BASE, say "According to the text knowledge base provided..."
- If information comes from WEBSITE KNOWLEDGE BASE, say "According to the website data from [URL]..."
- If using general knowledge, say "From my general knowledge (not from provided sources)..."
- If combining sources, mention all relevant sources used

Available sources for this conversation:
${hasTextKnowledge ? '✓ Text Knowledge Base' : '✗ No Text Knowledge Base'}
${hasWebsiteKnowledge ? '✓ Website Knowledge Base' : '✗ No Website Knowledge Base'}

Use the provided information accurately and cite your sources clearly.`
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

      console.log('Received audio file:', {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.buffer.length
      });

      // Use original mimetype for better compatibility
      const transcription = await openai.audio.transcriptions.create({
        file: new File([req.file.buffer], req.file.originalname || 'audio.mp4', { type: req.file.mimetype }),
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
      console.log('TTS request body:', req.body);
      const { text } = req.body;
      
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        console.log('Invalid text parameter:', { text, type: typeof text });
        return res.status(400).json({ message: 'Text is required' });
      }

      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: text.trim(),
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