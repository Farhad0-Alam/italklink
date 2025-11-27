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
const MAX_CONTENT_SIZE = 50000; // Maximum content size to prevent memory issues
const MAX_EMBEDDING_BATCH_SIZE = 10; // Process embeddings in batches
const MAX_CHUNKS_PER_URL = 50; // Maximum chunks per URL to prevent excessive memory usage

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
    
    // Prevent memory issues with very large HTML content
    if (html.length > 500000) {
      console.log('HTML content too large, truncating to prevent memory issues');
    }

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    // Try Readability first
    if (article && article.textContent && article.textContent.length >= 100) {
      let content = article.textContent.replace(/\s+/g, ' ').trim();
      
      // Limit content size to prevent memory issues
      if (content.length > MAX_CONTENT_SIZE) {
        console.log(`Content too large (${content.length} chars), truncating to ${MAX_CONTENT_SIZE} chars`);
        content = content.substring(0, MAX_CONTENT_SIZE) + '...';
      }
      
      console.log('Successfully extracted via Readability, length:', content.length);
      return {
        title: article.title || new URL(url).hostname,
        content,
      };
    }

    console.log('Readability failed to parse content');
    
    // Fallback: Extract meta tags and structured data
    const metaContent = extractMetaContent(html);
    
    // Enhanced extraction: Also try to get text content from common elements
    const document = dom.window.document;
    
    // Extract headings and key content
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 5)
      .join('. ');
    
    // Extract paragraph content  
    const paragraphs = Array.from(document.querySelectorAll('p'))
      .map(el => el.textContent?.trim())
      .filter(text => text && text.length > 20)
      .join(' ');
    
    // Combine meta content with extracted text
    let enhancedContent = [metaContent.content, headings, paragraphs]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit content size to prevent memory issues
    if (enhancedContent.length > MAX_CONTENT_SIZE) {
      console.log(`Enhanced content too large (${enhancedContent.length} chars), truncating to ${MAX_CONTENT_SIZE} chars`);
      enhancedContent = enhancedContent.substring(0, MAX_CONTENT_SIZE) + '...';
    }
    
    if (enhancedContent.length >= 50) {
      console.log('Successfully extracted enhanced website content:', `Description: ${enhancedContent.substring(0, 150)}...`);
      return {
        title: metaContent.title,
        content: enhancedContent,
      };
    }

    // Final fallback: Extract text from common content areas
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

// Add userId to document metadata before ingestion
function addUserToDoc(meta: Record<string, any>, userId: string): Record<string, any> {
  return { ...meta, userId };
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

// Generate embeddings for text chunks in batches to prevent memory issues
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    console.log('Generating embeddings for', texts.length, 'chunks');
    
    // Process embeddings in batches to prevent memory issues
    const allEmbeddings: number[][] = [];
    
    for (let i = 0; i < texts.length; i += MAX_EMBEDDING_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_EMBEDDING_BATCH_SIZE);
      console.log(`Processing embedding batch ${Math.floor(i / MAX_EMBEDDING_BATCH_SIZE) + 1}/${Math.ceil(texts.length / MAX_EMBEDDING_BATCH_SIZE)}`);
      
      const response = await openai.embeddings.create({
        model: EMBED_MODEL,
        input: batch,
      });
      
      const batchEmbeddings = response.data.map(item => item.embedding);
      allEmbeddings.push(...batchEmbeddings);
      
      // Small delay between batches to prevent rate limiting
      if (i + MAX_EMBEDDING_BATCH_SIZE < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allEmbeddings;
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

// Check if content already exists for a user
export async function contentExists(userId: string, url: string, contentHash: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT 1 FROM kb_docs WHERE user_id = $1 AND url = $2 AND meta->>'hash' = $3 LIMIT 1`,
      [userId, url, contentHash]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking content existence:', error);
    return false;
  }
}

// Ingest raw text into knowledge base - ISOLATED PER USER
export async function ingestText(userId: string, text: string, title: string = 'Manual Text Entry'): Promise<IngestResult> {
  try {
    if (!text || text.trim().length < 10) {
      return {
        ok: false,
        url: 'text://manual',
        title,
        chunks: 0,
        error: 'Text too short. Please provide at least 10 characters.',
      };
    }

    const content = text.trim();
    const contentHash = computeContentHash(content);
    const identifier = `text://${contentHash.substring(0, 12)}`;

    // 1. Check for duplicates for this user only
    if (await contentExists(userId, identifier, contentHash)) {
      console.log('Text content already exists for user, skipping ingestion');
      const existingChunks = await pool.query(
        `SELECT COUNT(*) as count FROM kb_docs WHERE user_id = $1 AND url = $2`,
        [userId, identifier]
      );
      const count = Number(existingChunks.rows[0]?.count || 0);
      
      return {
        ok: true,
        url: identifier,
        title,
        chunks: count,
      };
    }

    // 2. Delete existing chunks for this user and identifier (refresh)
    await pool.query(`DELETE FROM kb_docs WHERE user_id = $1 AND url = $2`, [userId, identifier]);

    // 3. Split into chunks
    let chunks = chunkText(content);
    console.log('Split text into', chunks.length, 'chunks');
    
    // Limit chunks to prevent memory issues
    if (chunks.length > MAX_CHUNKS_PER_URL) {
      console.log(`Too many chunks (${chunks.length}), limiting to ${MAX_CHUNKS_PER_URL} to prevent memory issues`);
      chunks = chunks.slice(0, MAX_CHUNKS_PER_URL);
    }

    // 4. Generate embeddings
    const embeddings = await generateEmbeddings(chunks);

    // 5. Insert chunks with embeddings - tagged with userId
    for (let i = 0; i < chunks.length; i++) {
      const chunkData = {
        userId,
        url: identifier,
        title,
        content: chunks[i],
        contentTokens: Math.ceil(chunks[i].length / 4),
        meta: {
          chunkIndex: i,
          hash: contentHash,
          sourceType: 'manual_text',
        },
      };

      await pool.query(
        `INSERT INTO kb_docs (user_id, url, title, content, content_tokens, meta, embedding) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          chunkData.userId,
          chunkData.url,
          chunkData.title,
          chunkData.content,
          chunkData.contentTokens,
          JSON.stringify(chunkData.meta),
          embeddingToVector(embeddings[i]),
        ]
      );
    }

    console.log('Successfully ingested', chunks.length, 'text chunks');

    return {
      ok: true,
      url: identifier,
      title,
      chunks: chunks.length,
    };
  } catch (error) {
    console.error('Error ingesting text:', error);
    return {
      ok: false,
      url: 'text://manual',
      title,
      chunks: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Ingest URL content into knowledge base - ISOLATED PER USER
export async function ingestUrl(userId: string, url: string): Promise<IngestResult> {
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
    let chunks = chunkText(content);
    console.log('Split into', chunks.length, 'chunks');
    
    // Limit chunks to prevent memory issues
    if (chunks.length > MAX_CHUNKS_PER_URL) {
      console.log(`Too many chunks (${chunks.length}), limiting to ${MAX_CHUNKS_PER_URL} to prevent memory issues`);
      chunks = chunks.slice(0, MAX_CHUNKS_PER_URL);
    }

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

// Retrieve similar content for RAG - FILTERED BY USER
export interface RetrievalResult {
  id: number;
  url: string;
  title: string | null;
  content: string;
  score: number;
}

export async function retrieveSimilarContent(
  userId: string,
  query: string, 
  topK: number = 5
): Promise<RetrievalResult[]> {
  try {
    // Generate query embedding
    const queryEmbedding = await generateEmbeddings([query]);
    const queryVector = embeddingToVector(queryEmbedding[0]);

    // Perform similarity search with relaxed threshold - FILTERED BY USER
    const result = await pool.query(`
      SELECT id, url, title, content, 
             1 - (embedding <=> $1::vector) as score
      FROM kb_docs 
      WHERE user_id = $2 AND (1 - (embedding <=> $1::vector)) > 0.05
      ORDER BY embedding <=> $1::vector
      LIMIT $3
    `, [queryVector, userId, topK]);

    console.log('Vector search found', result.rows.length, 'documents for user', userId);
    
    // If no results with threshold, try without threshold
    if (result.rows.length === 0) {
      console.log('No documents above threshold for user, trying without threshold...');
      const fallbackResult = await pool.query(`
        SELECT id, url, title, content, 
               1 - (embedding <=> $1::vector) as score
        FROM kb_docs 
        WHERE user_id = $2
        ORDER BY embedding <=> $1::vector
        LIMIT $3
      `, [queryVector, userId, topK]);
      
      console.log('Fallback search found', fallbackResult.rows.length, 'documents for user');
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