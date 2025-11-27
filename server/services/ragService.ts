import { db } from '../db';
import { kbDocs } from '../../shared/schema';
import { OpenAI } from 'openai';
import { sql } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RagSource {
  id: string;
  title: string | null;
  content: string;
  url: string;
}

export interface RagContext {
  context: string;
  sources: RagSource[];
}

/**
 * Get embedding for a given text using OpenAI
 */
async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.substring(0, 8000),
    dimensions: 1536,
  });
  return response.data[0].embedding;
}

/**
 * Retrieve RAG context for a question - PER USER
 * Uses vector similarity search to find relevant documents
 */
export async function getRagContext(
  userId: string,
  question: string,
  limit: number = 5
): Promise<RagContext> {
  try {
    // Get embedding for the question
    const questionEmbedding = await getEmbedding(question);

    // Vector similarity search using pgvector - FILTERED BY USER
    const docs = await db.execute(
      sql`
        SELECT id, title, content, url
        FROM kb_docs
        WHERE user_id = ${userId} AND embedding IS NOT NULL
        ORDER BY embedding <-> ${sql.raw(`'[${questionEmbedding.join(',')}]'`)}
        LIMIT ${limit}
      `
    );

    const sources = (docs.rows || []) as RagSource[];

    // Concatenate documents into context
    const context = sources
      .map((doc) => `Title: ${doc.title || 'Untitled'}\nSource: ${doc.url}\n\n${doc.content}`)
      .join('\n\n---\n\n');

    return {
      context: context || 'No relevant documents found in knowledge base.',
      sources,
    };
  } catch (error) {
    console.error('[RAG] Error retrieving context:', error);
    return {
      context: 'Unable to retrieve knowledge base context.',
      sources: [],
    };
  }
}

/**
 * Add a document to the knowledge base - PER USER
 */
export async function addKbDoc(
  userId: string,
  url: string,
  title: string,
  content: string,
  meta?: Record<string, any>
): Promise<{ id: string }> {
  try {
    const embedding = await getEmbedding(content);
    const contentTokens = Math.ceil(content.length / 4);

    const result = await db
      .insert(kbDocs)
      .values({
        userId,
        url,
        title,
        content,
        embedding,
        contentTokens,
        meta: meta || {},
      })
      .returning({ id: kbDocs.id });

    return result[0];
  } catch (error) {
    console.error('[RAG] Error adding document:', error);
    throw error;
  }
}
