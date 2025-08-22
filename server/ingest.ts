import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import OpenAI from 'openai';
import crypto from 'crypto';
import { db, pool } from './db';
import type { InsertKbDoc } from '@shared/schema';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const EMBED_MODEL = process.env.EMBED_MODEL || 'text-embedding-3-small';
const CHUNK_SIZE = 4000; // characters
const CHUNK_OVERLAP = 600; // characters

export interface IngestResult {
  ok: boolean;
  url: string;
  title: string;
  chunks: number;
  error?: string;
}

// Extract content from HTML using multiple methods
function extractMetaContent(html: string): { title: string; content: string } {
  // Extract meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const metaDesc = metaDescMatch?.[1] || '';
  
  // Extract OG title and description
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  
  const ogTitle = ogTitleMatch?.[1] || '';
  const ogDesc = ogDescMatch?.[1] || '';
  
  // Extract title tag
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch?.[1] || ogTitle || 'Extracted Content';
  
  // Combine all extracted content
  const content = [metaDesc, ogDesc].filter(Boolean).join(' ');
  
  console.log('Found meta description in raw HTML:', metaDesc);
  console.log('Found OG title in raw HTML:', ogTitle);
  console.log('Found OG description in raw HTML:', ogDesc);
  console.log('Successfully extracted meta content from raw HTML, length:', content.length);
  
  return { title: title.trim(), content: content.trim() };
}

// Extract readable content from URL using Readability with fallbacks
export async function fetchReadable(url: string): Promise<{ title: string; content: string } | null> {
  try {
    console.log('Starting website extraction for URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error(`HTTP ${response.status}: ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    console.log('Received HTML content, length:', html.length);

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    // Try Readability first
    if (article && article.textContent && article.textContent.length >= 100) {
      const content = article.textContent.replace(/\s+/g, ' ').trim();
      console.log('Successfully extracted via Readability, length:', content.length);
      return {
        title: article.title || new URL(url).hostname,
        content,
      };
    }

    console.log('Readability failed to parse content');
    
    // Fallback: Extract meta tags and structured data
    const metaContent = extractMetaContent(html);
    
    if (metaContent.content.length >= 50) {
      console.log('Successfully extracted website content:', `Description: ${metaContent.content.substring(0, 100)}...`);
      return {
        title: metaContent.title,
        content: metaContent.content,
      };
    }

    // Final fallback: Extract text from common content areas
    const document = dom.window.document;
    const contentSelectors = [
      'main', 'article', '.content', '#content', 
      '.post-content', '.entry-content', '.page-content',
      'p', 'div'
    ];
    
    let fallbackContent = '';
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      const text = Array.from(elements)
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 20)
        .join(' ');
      
      if (text.length > fallbackContent.length) {
        fallbackContent = text;
      }
      
      if (fallbackContent.length >= 200) break;
    }
    
    if (fallbackContent.length >= 50) {
      const cleanContent = fallbackContent.replace(/\s+/g, ' ').trim();
      console.log('Extracted via fallback method, length:', cleanContent.length);
      return {
        title: metaContent.title || new URL(url).hostname,
        content: cleanContent,
      };
    }

    console.error('All extraction methods failed - insufficient content');
    return null;

  } catch (error) {
    console.error('Error fetching readable content:', error);
    return null;
  }
}

// Stub for future crawler API integration
export async function fetchViaCrawler(url: string): Promise<{ title: string; content: string } | null> {
  if (!process.env.CRAWLER_API) {
    throw new Error('CRAWLER_API not configured');
  }
  
  // TODO: Implement third-party crawler API integration
  // Example: FireCrawl, ScrapingBee, etc.
  console.log('Crawler API not implemented yet for:', url);
  return null;
}

// Split text into chunks with overlap
export function chunkText(text: string, chunkSize: number = CHUNK_SIZE, overlap: number = CHUNK_OVERLAP): string[] {
  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);

    // Try to end at a sentence boundary
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastNewline = chunk.lastIndexOf('\n');
      const boundary = Math.max(lastPeriod, lastNewline);
      
      if (boundary > start + chunkSize * 0.7) {
        chunk = text.slice(start, start + boundary + 1);
      }
    }

    chunks.push(chunk.trim());
    
    // Move start position with overlap
    start += chunk.length - overlap;
    if (start >= text.length) break;
  }

  return chunks.filter(chunk => chunk.length > 50); // Filter out tiny chunks
}

// Generate embeddings for text chunks
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    console.log('Generating embeddings for', texts.length, 'chunks');
    
    const response = await openai.embeddings.create({
      model: EMBED_MODEL,
      input: texts,
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

// Convert embedding array to pgvector literal format
export function embeddingToVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

// Compute content hash for deduplication
export function computeContentHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

// Check if content already exists
export async function contentExists(url: string, contentHash: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT 1 FROM kb_docs WHERE url = $1 AND meta->>'hash' = $2 LIMIT 1`,
      [url, contentHash]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking content existence:', error);
    return false;
  }
}

// Ingest URL content into knowledge base
export async function ingestUrl(url: string): Promise<IngestResult> {
  try {
    // 1. Extract readable content
    let extracted = await fetchReadable(url);
    
    if (!extracted) {
      // Try crawler API if available
      if (process.env.CRAWLER_API) {
        try {
          extracted = await fetchViaCrawler(url);
        } catch (error) {
          console.error('Crawler API failed:', error);
        }
      }
      
      if (!extracted) {
        return {
          ok: false,
          url,
          title: '',
          chunks: 0,
          error: 'Not enough readable text. Try crawler.',
        };
      }
    }

    const { title, content } = extracted;
    const contentHash = computeContentHash(content);

    // 2. Check for duplicates
    if (await contentExists(url, contentHash)) {
      console.log('Content already exists, skipping ingestion');
      const existingChunks = await pool.query(
        `SELECT COUNT(*) as count FROM kb_docs WHERE url = $1`,
        [url]
      );
      const count = Number(existingChunks.rows[0]?.count || 0);
      
      return {
        ok: true,
        url,
        title,
        chunks: count,
      };
    }

    // 3. Delete existing chunks for this URL (refresh)
    await pool.query(`DELETE FROM kb_docs WHERE url = $1`, [url]);

    // 4. Split into chunks
    const chunks = chunkText(content);
    console.log('Split into', chunks.length, 'chunks');

    // 5. Generate embeddings
    const embeddings = await generateEmbeddings(chunks);

    // 6. Insert chunks with embeddings
    for (let i = 0; i < chunks.length; i++) {
      const chunkData: Omit<InsertKbDoc, 'id' | 'createdAt'> = {
        url,
        title,
        content: chunks[i],
        contentTokens: Math.ceil(chunks[i].length / 4), // Rough token estimate
        meta: {
          chunkIndex: i,
          hash: contentHash,
        },
      };

      await pool.query(
        `INSERT INTO kb_docs (url, title, content, content_tokens, meta, embedding) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          chunkData.url,
          chunkData.title,
          chunkData.content,
          chunkData.contentTokens,
          JSON.stringify(chunkData.meta),
          embeddingToVector(embeddings[i]),
        ]
      );
    }

    console.log('Successfully ingested', chunks.length, 'chunks for', url);

    return {
      ok: true,
      url,
      title,
      chunks: chunks.length,
    };
  } catch (error) {
    console.error('Error ingesting URL:', error);
    return {
      ok: false,
      url,
      title: '',
      chunks: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Retrieve similar content for RAG
export interface RetrievalResult {
  id: number;
  url: string;
  title: string | null;
  content: string;
  score: number;
}

export async function retrieveSimilarContent(
  query: string, 
  topK: number = 5
): Promise<RetrievalResult[]> {
  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbeddings([query]);
    const queryVector = embeddingToVector(queryEmbedding[0]);

    // Perform similarity search with relaxed threshold
    const result = await pool.query(`
      SELECT id, url, title, content, 
             1 - (embedding <=> $1::vector) as score
      FROM kb_docs 
      WHERE (1 - (embedding <=> $1::vector)) > 0.1
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `, [queryVector, topK]);

    console.log('Vector search found', result.rows.length, 'documents with threshold > 0.1');
    
    // If no results with threshold, try without threshold
    if (result.rows.length === 0) {
      console.log('No documents above threshold, trying without threshold...');
      const fallbackResult = await pool.query(`
        SELECT id, url, title, content, 
               1 - (embedding <=> $1::vector) as score
        FROM kb_docs 
        ORDER BY embedding <=> $1::vector
        LIMIT $2
      `, [queryVector, topK]);
      
      console.log('Fallback search found', fallbackResult.rows.length, 'documents');
      return fallbackResult.rows.map((row: any) => ({
        id: Number(row.id),
        url: row.url,
        title: row.title,
        content: row.content,
        score: Number(row.score),
      }));
    }

    return result.rows.map((row: any) => ({
      id: Number(row.id),
      url: row.url,
      title: row.title,
      content: row.content,
      score: Number(row.score),
    }));
  } catch (error) {
    console.error('Error retrieving similar content:', error);
    throw error;
  }
}