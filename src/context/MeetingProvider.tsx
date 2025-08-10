import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { MeetingInfo, MeetingSession } from '../types/meeting';
import type { FormattedMinutes } from '../types/minutes';

interface MeetingState {
  session: MeetingSession | null;
  transcript: string;
  isRecording: boolean;
  formattedMinutes: FormattedMinutes | null;
  error: string | null;
}

type MeetingAction = 
  | { type: 'SET_MEETING_INFO'; payload: MeetingInfo }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'UPDATE_TRANSCRIPT'; payload: string }
  | { type: 'SET_FORMATTED_MINUTES'; payload: FormattedMinutes }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_SESSION' };

const initialState: MeetingState = {
  session: null,
  transcript: '',
  isRecording: false,
  formattedMinutes: null,
  error: null,
};

function meetingReducer(state: MeetingState, action: MeetingAction): MeetingState {
  switch (action.type) {
    case 'SET_MEETING_INFO':
      return {
        ...state,
        session: {
          id: Date.now().toString(),
          info: action.payload,
          startTime: new Date(),
          transcript: '',
          status: 'setup',
        },
      };
    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
        session: state.session ? { ...state.session, status: 'recording' } : null,
      };
    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false,
        session: state.session 
          ? { ...state.session, status: 'stopped', endTime: new Date() } 
          : null,
      };
    case 'UPDATE_TRANSCRIPT':
      return {
        ...state,
        transcript: action.payload,
        session: state.session 
          ? { ...state.session, transcript: action.payload } 
          : null,
      };
    case 'SET_FORMATTED_MINUTES':
      return {
        ...state,
        formattedMinutes: action.payload,
        session: state.session ? { ...state.session, status: 'complete' } : null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'RESET_SESSION':
      return initialState;
    default:
      return state;
  }
}

interface MeetingContextValue {
  state: MeetingState;
  dispatch: React.Dispatch<MeetingAction>;
}

const MeetingContext = createContext<MeetingContextValue | undefined>(undefined);

interface MeetingProviderProps {
  children: ReactNode;
}

export function MeetingProvider({ children }: MeetingProviderProps) {
  const [state, dispatch] = useReducer(meetingReducer, initialState);

  return (
    <MeetingContext.Provider value={{ state, dispatch }}>
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
}