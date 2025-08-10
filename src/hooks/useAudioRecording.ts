import { useCallback, useRef, useState } from 'react';
import { DeepgramService } from '../services/deepgramService';

interface AudioRecordingState {
  isRecording: boolean;
  transcript: string;
  error: string | null;
  isConnecting: boolean;
}

interface AudioRecordingActions {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  clearTranscript: () => void;
  clearError: () => void;
}

export function useAudioRecording(): AudioRecordingState & AudioRecordingActions {
  const [state, setState] = useState<AudioRecordingState>({
    isRecording: false,
    transcript: '',
    error: null,
    isConnecting: false,
  });

  const deepgramServiceRef = useRef<DeepgramService | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Initialize Deepgram service with API key (following speech_scribe pattern)
      if (!deepgramServiceRef.current) {
        const deepgramApiKey = import.meta.env.VITE_DEEPGRAM_API_KEY;
        deepgramServiceRef.current = new DeepgramService(deepgramApiKey);
      }

      // Start recording with transcription callback
      await deepgramServiceRef.current.startRecording((result) => {
        setState(prev => {
          if (result.isFinal) {
            // Replace interim text with final result
            const cleanedTranscript = prev.transcript.replace(/\[INTERIM\].*$/, '');
            return {
              ...prev,
              transcript: cleanedTranscript + result.text + ' ',
            };
          } else {
            // Add interim text
            const cleanedTranscript = prev.transcript.replace(/\[INTERIM\].*$/, '');
            return {
              ...prev,
              transcript: cleanedTranscript + '[INTERIM]' + result.text,
            };
          }
        });
      });

      setState(prev => ({ 
        ...prev, 
        isRecording: true, 
        isConnecting: false 
      }));

    } catch (error) {
      console.error('Failed to start recording:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start recording',
        isRecording: false,
        isConnecting: false,
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (deepgramServiceRef.current) {
      deepgramServiceRef.current.stopRecording();
    }

    setState(prev => ({
      ...prev,
      isRecording: false,
      isConnecting: false,
      // Clean up any interim text when stopping
      transcript: prev.transcript.replace(/\[INTERIM\].*$/, '').trim(),
    }));
  }, []);

  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    clearTranscript,
    clearError,
  };
}