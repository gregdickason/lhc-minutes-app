import React from 'react';
import { useMeeting } from '../../../context/MeetingProvider';
import type { MeetingInfo } from '../../../types/meeting';
import MeetingInfoForm from './MeetingInfoForm';
import RecordingControls from './RecordingControls';

const MeetingSetup: React.FC = () => {
  const { dispatch } = useMeeting();
  
  const handleMeetingInfoSubmit = (info: MeetingInfo) => {
    dispatch({ type: 'SET_MEETING_INFO', payload: info });
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-harmony-primary mb-6 flex items-center gap-3">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
        </svg>
        Recording Setup
      </h2>
      
      <MeetingInfoForm onSubmit={handleMeetingInfoSubmit} />
      <RecordingControls />
    </div>
  );
};

export default MeetingSetup;