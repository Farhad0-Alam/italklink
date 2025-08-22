import mammoth from 'mammoth';
import * as Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export interface ParsedFile {
  text: string;
  metadata: {
    filename: string;
    format: string;
    pages?: number;
    wordCount: number;
  };
}

/**
 * Extract text from PDF buffer (using existing functionality)
 */
export async function parsePDF(buffer: Buffer, filename: string): Promise<ParsedFile> {
  // Import the existing PDF parser
  const pdfParse = await import('pdf-parse');
  
  try {
    const data = await pdfParse.default(buffer);
    
    return {
      text: data.text,
      metadata: {
        filename,
        format: 'pdf',
        pages: data.numpages,
        wordCount: data.text.split(/\s+/).length
      }
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from DOCX buffer
 */
export async function parseDOCX(buffer: Buffer, filename: string): Promise<ParsedFile> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    return {
      text,
      metadata: {
        filename,
        format: 'docx',
        wordCount: text.split(/\s+/).length
      }
    };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from plain text files (TXT, MD)
 */
export async function parsePlainText(buffer: Buffer, filename: string): Promise<ParsedFile> {
  try {
    const text = buffer.toString('utf-8');
    const extension = path.extname(filename).toLowerCase();
    
    return {
      text,
      metadata: {
        filename,
        format: extension.substring(1) || 'txt',
        wordCount: text.split(/\s+/).length
      }
    };
  } catch (error) {
    console.error('Text parsing error:', error);
    throw new Error(`Failed to parse text file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from CSV files and convert to readable format
 */
export async function parseCSV(buffer: Buffer, filename: string): Promise<ParsedFile> {
  try {
    const csvText = buffer.toString('utf-8');
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            // Convert CSV data to markdown table format for better readability
            const data = results.data as any[];
            
            if (data.length === 0) {
              resolve({
                text: 'Empty CSV file',
                metadata: {
                  filename,
                  format: 'csv',
                  wordCount: 0
                }
              });
              return;
            }
            
            // Get headers
            const headers = Object.keys(data[0]);
            
            // Create markdown table
            let markdownTable = `# CSV Data from ${filename}\n\n`;
            markdownTable += `| ${headers.join(' | ')} |\n`;
            markdownTable += `| ${headers.map(() => '---').join(' | ')} |\n`;
            
            // Add data rows (limit to first 100 rows for performance)
            const limitedData = data.slice(0, 100);
            for (const row of limitedData) {
              const values = headers.map(header => String(row[header] || '').replace(/\|/g, '\\|'));
              markdownTable += `| ${values.join(' | ')} |\n`;
            }
            
            if (data.length > 100) {
              markdownTable += `\n*Note: Showing first 100 rows of ${data.length} total rows*\n`;
            }
            
            resolve({
              text: markdownTable,
              metadata: {
                filename,
                format: 'csv',
                wordCount: markdownTable.split(/\s+/).length
              }
            });
          } catch (error) {
            reject(new Error(`Failed to process CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing failed: ${error.message}`));
        }
      });
    });
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Main function to parse any supported file format
 */
export async function parseFile(buffer: Buffer, filename: string, mimeType?: string): Promise<ParsedFile> {
  const extension = path.extname(filename).toLowerCase();
  
  // Determine parser based on file extension or mime type
  switch (extension) {
    case '.pdf':
      return parsePDF(buffer, filename);
    
    case '.docx':
      return parseDOCX(buffer, filename);
    
    case '.txt':
    case '.md':
    case '.markdown':
    case '.rtf': // Basic RTF support (plain text extraction)
      return parsePlainText(buffer, filename);
    
    case '.csv':
      return parseCSV(buffer, filename);
    
    default:
      // Try to parse as plain text if no specific parser
      if (mimeType?.startsWith('text/')) {
        return parsePlainText(buffer, filename);
      }
      
      throw new Error(`Unsupported file format: ${extension || mimeType || 'unknown'}`);
  }
}

/**
 * Get list of supported file formats
 */
export function getSupportedFormats(): string[] {
  return ['.pdf', '.docx', '.txt', '.md', '.markdown', '.csv', '.rtf'];
}

/**
 * Check if file format is supported
 */
export function isFormatSupported(filename: string, mimeType?: string): boolean {
  const extension = path.extname(filename).toLowerCase();
  const supportedFormats = getSupportedFormats();
  
  if (supportedFormats.includes(extension)) {
    return true;
  }
  
  // Also check mime type for text files
  return mimeType?.startsWith('text/') || false;
}