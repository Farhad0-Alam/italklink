interface RealtimeAPIOptions {
  apiKey: string;
  model?: string;
  voice?: string;
}

interface RealtimeAPIConfig {
  type: 'session.update';
  session: {
    model: string;
    modalities: string[];
    voice: string;
    input_audio_format: string;
    output_audio_format: string;
    input_audio_transcription?: {
      model: string;
    };
  };
}

export class RealtimeAPIClient {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private model: string;
  private voice: string;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private mediaStream: MediaStream | null = null;
  private isConnected = false;

  constructor(options: RealtimeAPIOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model || 'gpt-4o-realtime-preview-2024-10-01';
    this.voice = options.voice || 'alloy';
  }

  async connect(
    onAudioData: (audioData: ArrayBuffer) => void,
    onTranscript: (transcript: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get microphone stream
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        console.log('[RealtimeAPI] Microphone access granted');

        // Setup Web Audio API
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        const sampleRate = this.audioContext.sampleRate;

        // Create ScriptProcessor for audio capture
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);

        // Connect to local voice WebSocket server (proxies to OpenAI)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/voice/realtime`;
        console.log('[RealtimeAPI] Connecting to:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          console.log('[RealtimeAPI] Connected');
          this.isConnected = true;

          // Send session configuration
          const config: RealtimeAPIConfig = {
            type: 'session.update',
            session: {
              model: this.model,
              modalities: ['text', 'audio'],
              voice: this.voice,
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1',
              },
            },
          };

          this.ws!.send(JSON.stringify(config));
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            if (event.data instanceof ArrayBuffer) {
              // Handle binary audio data
              onAudioData(event.data);
            } else {
              const message = JSON.parse(event.data);
              console.log('[RealtimeAPI] Message:', message.type);

              if (message.type === 'response.audio.delta') {
                if (message.delta) {
                  const audioBytes = atob(message.delta);
                  const bytes = new Uint8Array(audioBytes.length);
                  for (let i = 0; i < audioBytes.length; i++) {
                    bytes[i] = audioBytes.charCodeAt(i);
                  }
                  onAudioData(bytes.buffer);
                }
              } else if (message.type === 'response.text.delta') {
                if (message.delta) {
                  onTranscript(message.delta);
                }
              } else if (message.type === 'input_audio_buffer.speech_started') {
                console.log('[RealtimeAPI] Speech detected');
              } else if (message.type === 'error') {
                onError(message.error?.message || 'Unknown error');
              }
            }
          } catch (error) {
            console.error('[RealtimeAPI] Message parsing error:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[RealtimeAPI] WebSocket error:', error);
          onError('Connection error');
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[RealtimeAPI] Disconnected');
          this.isConnected = false;
        };

        // Send audio from microphone
        this.processor.onaudioprocess = (event) => {
          const inputData = event.inputBuffer.getChannelData(0);
          const pcm16 = this.floatTo16BitPCM(inputData);

          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const message = {
              type: 'input_audio_buffer.append',
              audio: this.arrayBufferToBase64(pcm16),
            };
            this.ws.send(JSON.stringify(message));
          }
        };
      } catch (error) {
        console.error('[RealtimeAPI] Connection error:', error);
        reject(error);
      }
    });
  }

  async sendAudio(audioData: Uint8Array): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'input_audio_buffer.append',
        audio: this.arrayBufferToBase64(audioData),
      };
      this.ws.send(JSON.stringify(message));
    }
  }

  commitAudio(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'input_audio_buffer.commit',
        })
      );
    }
  }

  createResponse(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'response.create',
        })
      );
    }
  }

  disconnect(): void {
    if (this.processor) {
      this.processor.disconnect();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    if (this.ws) {
      this.ws.close();
    }

    this.isConnected = false;
  }

  private floatTo16BitPCM(floatArray: Float32Array): Uint8Array {
    const samples = new Int16Array(floatArray.length);
    for (let i = 0; i < floatArray.length; i++) {
      let sample = floatArray[i];
      sample = Math.max(-1, Math.min(1, sample)); // Clamp
      samples[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return new Uint8Array(samples.buffer);
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  }

  isConnectedToAPI(): boolean {
    return this.isConnected;
  }
}
