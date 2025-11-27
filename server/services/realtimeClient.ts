import { WebSocket } from 'ws';
import { getRagContext } from './ragService';

export interface RealtimeMessage {
  type: string;
  [key: string]: any;
}

export class OpenAIRealtimeClient {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private model: string = 'gpt-4o-realtime-preview-2024-10-01';
  private isConnected = false;

  private onTranscript: ((text: string, isFinal: boolean) => void) | null = null;
  private onAssistantMessage: ((text: string) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private onAudioDelta: ((audioData: Buffer) => void) | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async connect(
    onTranscript?: (text: string, isFinal: boolean) => void,
    onAssistantMessage?: (text: string) => void,
    onError?: (error: string) => void,
    onAudioDelta?: (audioData: Buffer) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.onTranscript = onTranscript || null;
        this.onAssistantMessage = onAssistantMessage || null;
        this.onError = onError || null;
        this.onAudioDelta = onAudioDelta || null;

        const wsUrl = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(this.model)}`;
        this.ws = new WebSocket(wsUrl, ['realtime', `rnxt-api-key.${this.apiKey}`]);

        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('[RealtimeAPI] Connected');
          this.isConnected = true;

          // Send session configuration
          this.sendMessage({
            type: 'session.update',
            session: {
              model: this.model,
              modalities: ['text', 'audio'],
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              max_response_output_tokens: 1024,
              tools: [
                {
                  type: 'function',
                  name: 'get_knowledge_context',
                  description: 'Search the knowledge base for relevant information',
                  parameters: {
                    type: 'object',
                    properties: {
                      question: {
                        type: 'string',
                        description: 'The question to search for',
                      },
                    },
                    required: ['question'],
                  },
                },
              ],
              system_prompt: `You are Talklink AI Voice Assistant. You are helpful, friendly, and knowledgeable.
When users ask about services, products, or business information, you MUST call the get_knowledge_context tool to search for relevant information.
Always provide accurate, helpful responses based on the knowledge base.
Keep responses concise and natural for voice conversation.`,
            },
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            if (event.data instanceof ArrayBuffer) {
              if (this.onAudioDelta) {
                this.onAudioDelta(Buffer.from(event.data));
              }
            } else {
              const message = JSON.parse(event.data);
              this.handleMessage(message);
            }
          } catch (error) {
            console.error('[RealtimeAPI] Message error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[RealtimeAPI] WebSocket error:', error);
          if (this.onError) {
            this.onError('Connection error');
          }
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[RealtimeAPI] Disconnected');
          this.isConnected = false;
        };
      } catch (error) {
        console.error('[RealtimeAPI] Connection error:', error);
        reject(error);
      }
    });
  }

  private handleMessage(message: RealtimeMessage) {
    const type = message.type;

    switch (type) {
      case 'input_audio_buffer.speech_started':
        console.log('[RealtimeAPI] Speech detected');
        break;

      case 'conversation.item.input_audio_transcription.completed':
        if (message.transcript && this.onTranscript) {
          this.onTranscript(message.transcript, true);
        }
        break;

      case 'response.text.delta':
        if (message.text && this.onAssistantMessage) {
          this.onAssistantMessage(message.text);
        }
        break;

      case 'response.text.done':
        console.log('[RealtimeAPI] Response complete');
        break;

      case 'response.audio.delta':
        if (message.delta && this.onAudioDelta) {
          const audioBytes = Buffer.from(message.delta, 'base64');
          this.onAudioDelta(audioBytes);
        }
        break;

      case 'response.function_call_arguments.done':
        if (message.name === 'get_knowledge_context') {
          this.currentToolCallId = message.call_id || '';
          this.handleKnowledgeContextCall(message.arguments, message.call_id);
        }
        break;

      case 'error':
        if (this.onError) {
          this.onError(message.error?.message || 'Unknown error');
        }
        break;

      default:
        console.log('[RealtimeAPI] Message type:', type);
    }
  }

  private currentToolCallId: string = '';

  private async handleKnowledgeContextCall(args: string, callId?: string) {
    try {
      const parsed = JSON.parse(args);
      const question = parsed.question || '';

      console.log('[RAG] Knowledge context call with question:', question);

      const context = await getRagContext(question, 3);
      
      console.log('[RAG] Retrieved', context.sources.length, 'sources for voice response');

      // Send tool result back with proper call_id
      this.sendMessage({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_result',
          call_id: callId || this.currentToolCallId || 'call_' + Date.now(),
          result: JSON.stringify({
            context: context.context.substring(0, 2000), // Limit context size for voice
            sources: context.sources.map((s) => ({ title: s.title, url: s.url })),
          }),
        },
      });

      // Trigger response creation
      this.sendMessage({
        type: 'response.create',
      });
    } catch (error) {
      console.error('[RAG] Error handling knowledge context call:', error);
    }
  }

  sendAudio(audioData: Buffer | Uint8Array): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const base64Audio = Buffer.isBuffer(audioData)
        ? audioData.toString('base64')
        : Buffer.from(audioData).toString('base64');

      this.sendMessage({
        type: 'input_audio_buffer.append',
        audio: base64Audio,
      });
    }
  }

  commitAudio(): void {
    this.sendMessage({
      type: 'input_audio_buffer.commit',
    });
  }

  createResponse(): void {
    this.sendMessage({
      type: 'response.create',
    });
  }

  sendMessage(message: RealtimeMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  isConnectedToAPI(): boolean {
    return this.isConnected;
  }
}
