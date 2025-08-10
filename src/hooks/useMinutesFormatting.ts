import { useState, useCallback } from 'react';
import { MinutesService } from '../services/minutesService';
import type { FormattedMinutes } from '../services/minutesService';

interface MeetingInfo {
  date: string;
  type: string;
  chairperson: string;
  present: string;
  apologies: string;
  minutesBy: string;
}

interface MinutesFormattingState {
  formattedMinutes: FormattedMinutes | null;
  isFormatting: boolean;
  error: string | null;
}

interface MinutesFormattingActions {
  formatMinutes: (transcript: string, meetingInfo: MeetingInfo) => Promise<void>;
  updateMinutes: (updatedMinutes: FormattedMinutes) => void;
  clearMinutes: () => void;
  clearError: () => void;
}

export function useMinutesFormatting(): MinutesFormattingState & MinutesFormattingActions {
  const [state, setState] = useState<MinutesFormattingState>({
    formattedMinutes: null,
    isFormatting: false,
    error: null,
  });

  // Initialize service with API key (following speech_scribe pattern)
  const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const minutesService = new MinutesService(openaiApiKey);

  const formatMinutes = useCallback(async (transcript: string, meetingInfo: MeetingInfo) => {
    setState(prev => ({ ...prev, isFormatting: true, error: null }));

    try {
      // Validate inputs
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('No transcript available to format');
      }

      if (!meetingInfo.chairperson || !meetingInfo.minutesBy) {
        throw new Error('Meeting chairperson and minutes taker are required');
      }

      // Attempt AI formatting
      let formattedMinutes: FormattedMinutes;
      
      try {
        formattedMinutes = await minutesService.formatMinutes(transcript, meetingInfo);
        
        // Validate the response
        if (!minutesService.validateFormattedMinutes(formattedMinutes)) {
          throw new Error('Invalid response format from AI service');
        }

        // Sanitize the response
        formattedMinutes = minutesService.sanitizeFormattedMinutes(formattedMinutes);

      } catch (aiError) {
        console.warn('AI formatting failed, using fallback:', aiError);
        
        // Use fallback formatting if AI fails
        formattedMinutes = minutesService.generateFallbackMinutes(transcript);
        
        // Set a warning rather than error for fallback
        setState(prev => ({
          ...prev,
          error: 'AI formatting unavailable. Generated basic format from transcript.',
        }));
      }

      setState(prev => ({
        ...prev,
        formattedMinutes,
        isFormatting: false,
      }));

    } catch (error) {
      console.error('Minutes formatting failed:', error);
      
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to format minutes',
        isFormatting: false,
        formattedMinutes: null,
      }));
    }
  }, []);

  const updateMinutes = useCallback((updatedMinutes: FormattedMinutes) => {
    setState(prev => ({
      ...prev,
      formattedMinutes: updatedMinutes,
    }));
  }, []);

  const clearMinutes = useCallback(() => {
    setState(prev => ({
      ...prev,
      formattedMinutes: null,
      error: null,
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
    formatMinutes,
    updateMinutes,
    clearMinutes,
    clearError,
  };
}