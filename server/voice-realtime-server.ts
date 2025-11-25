import { WebSocket, WebSocketServer } from 'ws';
import { OpenAIRealtimeClient } from './services/realtimeClient';
import { IncomingMessage } from 'http';

interface VoiceSession {
  realtimeClient: OpenAIRealtimeClient;
  ws: WebSocket;
  transcript: string;
  assistantResponse: string;
}

const sessions = new Map<string, VoiceSession>();

export function setupVoiceWebSocketServer(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request: IncomingMessage, socket, head) => {
    if (request.url?.startsWith('/api/voice/realtime')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (ws: WebSocket, request: IncomingMessage) => {
    const sessionId = Math.random().toString(36).substring(7);
    console.log(`[Voice] New connection: ${sessionId}`);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      ws.send(
        JSON.stringify({
          type: 'error',
          error: 'API key not configured',
        })
      );
      ws.close();
      return;
    }

    const realtimeClient = new OpenAIRealtimeClient(apiKey);

    try {
      await realtimeClient.connect(
        (text, isFinal) => {
          ws.send(
            JSON.stringify({
              type: 'transcript',
              text,
              isFinal,
            })
          );
        },
        (text) => {
          ws.send(
            JSON.stringify({
              type: 'assistant_message',
              text,
            })
          );
        },
        (error) => {
          ws.send(
            JSON.stringify({
              type: 'error',
              error,
            })
          );
        },
        (audioData) => {
          ws.send(
            JSON.stringify({
              type: 'audio_delta',
              audio: audioData.toString('base64'),
            })
          );
        }
      );

      const session: VoiceSession = {
        realtimeClient,
        ws,
        transcript: '',
        assistantResponse: '',
      };

      sessions.set(sessionId, session);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());

          if (message.type === 'audio_chunk') {
            const audioBuffer = Buffer.from(message.audio, 'base64');
            realtimeClient.sendAudio(audioBuffer);
          } else if (message.type === 'commit_audio') {
            realtimeClient.commitAudio();
            realtimeClient.createResponse();
          } else if (message.type === 'stop') {
            realtimeClient.disconnect();
            ws.close();
          }
        } catch (error) {
          console.error(`[Voice] Message error (${sessionId}):`, error);
        }
      });

      ws.on('close', () => {
        console.log(`[Voice] Connection closed: ${sessionId}`);
        realtimeClient.disconnect();
        sessions.delete(sessionId);
      });

      ws.on('error', (error) => {
        console.error(`[Voice] WebSocket error (${sessionId}):`, error);
      });
    } catch (error) {
      console.error(`[Voice] Connection setup error (${sessionId}):`, error);
      ws.send(
        JSON.stringify({
          type: 'error',
          error: 'Failed to initialize voice connection',
        })
      );
      ws.close();
    }
  });

  console.log('[Voice] WebSocket server setup complete');
}
