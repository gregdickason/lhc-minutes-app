interface DeepgramTokenResponse {
  success: boolean;
  apiKey?: string;
  expiresAt?: string;
  error?: string;
}

interface TranscriptionResult {
  text: string;
  isFinal: boolean;
  confidence?: number;
}

export class DeepgramService {
  private wsRef: WebSocket | null = null;
  private audioContextRef: AudioContext | null = null;
  private processorRef: ScriptProcessorNode | null = null;
  private microphoneStreamRef: MediaStream | null = null;
  private apiKey: string;
  private tokenRef: string | null = null;
  private tokenExpiryRef: Date | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  // Get a valid API key, following speech_scribe pattern
  private async getValidApiKey(): Promise<string> {
    // If we have a direct API key, use it (development mode)
    if (this.apiKey && this.apiKey.length > 0) {
      return this.apiKey;
    }

    // Check if we have a valid cached token
    if (this.tokenRef && !this.isTokenExpired()) {
      return this.tokenRef;
    }

    // Fetch a new token from the Edge Function (production mode)
    console.log('Fetching new Deepgram token from Edge Function...');
    const response = await this.getTokenFromEdgeFunction();
    
    if (!response.success || !response.apiKey) {
      throw new Error(response.error || 'Failed to get Deepgram authentication token');
    }

    this.tokenRef = response.apiKey;
    this.tokenExpiryRef = response.expiresAt ? new Date(response.expiresAt) : null;

    return response.apiKey;
  }

  private async getTokenFromEdgeFunction(): Promise<DeepgramTokenResponse> {
    try {
      const response = await fetch('/api/deepgram-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get Deepgram token from Edge Function:', error);
      return {
        success: false,
        error: 'Failed to get authentication token from server',
      };
    }
  }

  isTokenExpired(): boolean {
    if (!this.tokenExpiryRef) return true;
    // Add 5-minute buffer for safety
    return Date.now() > (this.tokenExpiryRef.getTime() - 5 * 60 * 1000);
  }

  async ensureValidToken(): Promise<string> {
    return await this.getValidApiKey();
  }

  buildWebSocketUrl(): string {
    const params = new URLSearchParams({
      model: 'nova-2-general',
      language: 'en-AU', // Australian English for LHC
      punctuate: 'true',
      interim_results: 'true',
      encoding: 'linear16',
      sample_rate: '16000',
      channels: '1',
    });

    return `wss://api.deepgram.com/v1/listen?${params.toString()}`;
  }

  float32ToPCM16(float32Array: Float32Array): Int16Array {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const sample = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = sample * 0x7FFF;
    }
    return pcm16;
  }

  processTranscription(data: any): TranscriptionResult {
    if (!data.channel?.alternatives?.[0]) {
      return { text: '', isFinal: false };
    }

    const alternative = data.channel.alternatives[0];
    return {
      text: alternative.transcript || '',
      isFinal: data.is_final || false,
      confidence: alternative.confidence
    };
  }

  async startRecording(onTranscription: (result: TranscriptionResult) => void): Promise<void> {
    try {
      // Get fresh token
      const token = await this.ensureValidToken();

      // Setup audio context
      this.audioContextRef = new AudioContext({ sampleRate: 16000 });
      
      // Get microphone access
      this.microphoneStreamRef = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Connect microphone to audio processing
      const source = this.audioContextRef.createMediaStreamSource(this.microphoneStreamRef);
      this.processorRef = this.audioContextRef.createScriptProcessor(4096, 1, 1);
      
      source.connect(this.processorRef);
      this.processorRef.connect(this.audioContextRef.destination);

      // Setup WebSocket connection
      const wsUrl = this.buildWebSocketUrl();
      const protocols = ['token', token];
      this.wsRef = new WebSocket(wsUrl, protocols);

      this.wsRef.onopen = () => {
        console.log('Deepgram WebSocket connected');
      };

      this.wsRef.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const transcription = this.processTranscription(data);
          
          if (transcription.text) {
            onTranscription(transcription);
          }
        } catch (error) {
          console.error('Error processing transcription:', error);
        }
      };

      this.wsRef.onerror = (error) => {
        console.error('Deepgram WebSocket error:', error);
      };

      this.wsRef.onclose = (event) => {
        console.log('Deepgram WebSocket closed:', event.code, event.reason);
      };

      // Setup audio processing
      this.processorRef.onaudioprocess = (event) => {
        if (this.wsRef && this.wsRef.readyState === WebSocket.OPEN) {
          const inputData = event.inputBuffer.getChannelData(0);
          const pcm16 = this.float32ToPCM16(inputData);
          this.wsRef.send(pcm16.buffer);
        }
      };

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.stopRecording();
      throw error;
    }
  }

  stopRecording(): void {
    // Clean up WebSocket
    if (this.wsRef) {
      if (this.wsRef.readyState === WebSocket.OPEN) {
        this.wsRef.close();
      }
      this.wsRef = null;
    }

    // Clean up audio processing
    if (this.processorRef) {
      this.processorRef.disconnect();
      this.processorRef.onaudioprocess = null;
      this.processorRef = null;
    }

    // Clean up audio context
    if (this.audioContextRef && this.audioContextRef.state !== 'closed') {
      this.audioContextRef.close();
      this.audioContextRef = null;
    }

    // Clean up microphone stream
    if (this.microphoneStreamRef) {
      this.microphoneStreamRef.getTracks().forEach(track => {
        track.stop();
      });
      this.microphoneStreamRef = null;
    }

    console.log('Recording stopped and resources cleaned up');
  }
}