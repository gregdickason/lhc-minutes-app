import React from 'react';
import { useMeeting } from '../../../context/MeetingProvider';

const LiveTranscript: React.FC = () => {
  const { state, dispatch } = useMeeting();

  const handleClear = () => {
    dispatch({ type: 'UPDATE_TRANSCRIPT', payload: '' });
  };

  const handleGenerateMinutes = () => {
    if (!state.transcript.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'No transcript available to generate minutes.' });
      return;
    }
    // TODO: Implement AI-powered minutes generation
    console.log('Generate minutes from:', state.transcript);
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-harmony-primary mb-6 flex items-center gap-3">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
        Live Transcript
      </h2>
      
      <div className="min-h-80 border-2 border-gray-200 rounded-lg p-5 bg-gray-50 font-mono text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap mb-5">
        {state.transcript || "Click \"Start Recording\" to begin capturing meeting notes..."}
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={handleClear}
          className="flex-1 py-3 px-6 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-200 text-gray-700 hover:-translate-y-1 hover:shadow-lg"
        >
          Clear
        </button>
        <button
          onClick={handleGenerateMinutes}
          className="flex-1 py-3 px-6 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-r from-harmony-primary to-harmony-secondary text-white hover:-translate-y-1 hover:shadow-lg"
          disabled={!state.transcript.trim()}
        >
          Generate Minutes
        </button>
      </div>
    </div>
  );
};

export default LiveTranscript;