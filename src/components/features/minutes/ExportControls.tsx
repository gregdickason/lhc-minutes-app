import React from 'react';
import { useMeeting } from '../../../context/MeetingProvider';

const ExportControls: React.FC = () => {
  const { state } = useMeeting();

  const handleExportWord = () => {
    // TODO: Implement Word export using docx library
    console.log('Export to Word');
  };

  const handleExportPdf = () => {
    // TODO: Implement PDF export using jsPDF
    console.log('Export to PDF');
  };

  const handleSave = () => {
    // TODO: Implement save functionality (local storage or download)
    console.log('Save minutes');
  };

  const isExportDisabled = !state.session || (!state.formattedMinutes && !state.transcript);

  return (
    <div className="flex gap-4">
      <button
        onClick={handleExportWord}
        disabled={isExportDisabled}
        className="flex-1 py-3 px-6 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-200 text-gray-700 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
      >
        Export Word
      </button>
      <button
        onClick={handleExportPdf}
        disabled={isExportDisabled}
        className="flex-1 py-3 px-6 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-gray-200 text-gray-700 hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
      >
        Export PDF
      </button>
      <button
        onClick={handleSave}
        disabled={isExportDisabled}
        className="flex-1 py-3 px-6 border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-r from-harmony-primary to-harmony-secondary text-white hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
      >
        Save Minutes
      </button>
    </div>
  );
};

export default ExportControls;