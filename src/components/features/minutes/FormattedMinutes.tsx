import React from 'react';
import { useMeeting } from '../../../context/MeetingProvider';
import MinutesTemplate from './MinutesTemplate';
import ExportControls from './ExportControls';

const FormattedMinutes: React.FC = () => {
  const { state } = useMeeting();

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
      <h2 className="text-2xl font-bold text-harmony-primary mb-6 flex items-center gap-3">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        Formatted Meeting Minutes
      </h2>
      
      <MinutesTemplate 
        meetingInfo={state.session?.info}
        formattedMinutes={state.formattedMinutes}
      />
      
      <ExportControls />
    </div>
  );
};

export default FormattedMinutes;