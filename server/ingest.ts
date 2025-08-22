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

// Extract readable content from URL using Readability
export async function fetchReadable(url: string): Promise<{ title: string; content: string } | null> {
  try {
    console.log('Fetching URL:', url);
    
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
    console.log('HTML received, length:', html.length);

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      console.error('Readability failed to parse content');
      return null;
    }

    const content = article.textContent?.replace(/\s+/g, ' ').trim() || '';
    
    if (content.length < 200) {
      console.error('Content too short:', content.length, 'characters');
      return null;
    }

    console.log('Extracted content:', content.length, 'characters');
    return {
      title: article.title || new URL(url).hostname,
      content,
    };
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

    // Perform similarity search
    const result = await pool.query(`
      SELECT id, url, title, content, 
             1 - (embedding <=> $1::vector) as score
      FROM kb_docs 
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `, [queryVector, topK]);

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