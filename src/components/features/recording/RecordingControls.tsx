import React from 'react';
import { useMeeting } from '../../../context/MeetingProvider';

const RecordingControls: React.FC = () => {
  const { state, dispatch } = useMeeting();

  const handleStartRecording = () => {
    if (!state.session) {
      dispatch({ type: 'SET_ERROR', payload: 'Please fill in meeting information first' });
      return;
    }
    dispatch({ type: 'START_RECORDING' });
  };

  const handleStopRecording = () => {
    dispatch({ type: 'STOP_RECORDING' });
  };

  const getStatusText = () => {
    if (!state.session) return 'Ready to record';
    if (state.isRecording) return 'Recording...';
    if (state.session.status === 'stopped') return 'Recording stopped';
    return 'Ready to record';
  };

  const getButtonContent = () => {
    if (state.isRecording) {
      return (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="1"/>
        </svg>
      );
    }
    
    return (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="8"/>
      </svg>
    );
  };

  return (
    <div className="text-center">
      <button
        onClick={state.isRecording ? handleStopRecording : handleStartRecording}
        className={`
          w-32 h-32 rounded-full border-none text-white text-2xl cursor-pointer
          transition-all duration-300 shadow-lg mx-auto mb-4
          hover:scale-105
          ${state.isRecording 
            ? 'bg-gradient-to-br from-harmony-accent to-green-500 animate-pulse' 
            : 'bg-gradient-to-br from-harmony-danger to-red-500'
          }
          ${state.isRecording ? 'shadow-harmony-accent/30' : 'shadow-harmony-danger/30'}
        `}
        disabled={!state.session && !state.isRecording}
      >
        {getButtonContent()}
      </button>
      
      <div className="text-center font-semibold text-gray-600">
        {getStatusText()}
      </div>

      {state.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
          {state.error}
        </div>
      )}
    </div>
  );
};

export default RecordingControls;