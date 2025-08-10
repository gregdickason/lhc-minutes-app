import React, { useState } from 'react';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useMinutesFormatting } from '../hooks/useMinutesFormatting';
import { MeetingMinutesGenerator } from '../utils/documentGeneration';
import { MeetingMinutesPDFGenerator } from '../utils/pdfGeneration';

const HarmonyNotesApp: React.FC = () => {
  const {
    isRecording,
    transcript,
    error: recordingError,
    isConnecting,
    startRecording,
    stopRecording,
    clearTranscript,
    clearError: clearRecordingError
  } = useAudioRecording();

  const {
    formattedMinutes,
    isFormatting,
    error: formattingError,
    formatMinutes,
    updateMinutes,
    clearMinutes,
    clearError: clearFormattingError
  } = useMinutesFormatting();

  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingType, setMeetingType] = useState('Meeting');
  const [chairperson, setChairperson] = useState('');
  const [present, setPresent] = useState('');
  const [apologies, setApologies] = useState('');
  const [minutesBy, setMinutesBy] = useState('');

  // Editing state
  const [editedContent, setEditedContent] = useState('');

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleClearTranscript = () => {
    clearTranscript();
    clearRecordingError();
    clearMinutes();
    clearFormattingError();
    setEditedContent('');
  };

  const generateMinutes = async () => {
    if (!transcript || transcript.trim() === '') {
      alert('No transcript available to generate minutes.');
      return;
    }

    if (!chairperson.trim() || !minutesBy.trim()) {
      alert('Please fill in the chairperson and minutes taker fields before generating minutes.');
      return;
    }

    const meetingInfo = {
      date: meetingDate,
      type: meetingType,
      chairperson: chairperson.trim(),
      present: present.trim(),
      apologies: apologies.trim(),
      minutesBy: minutesBy.trim(),
    };

    await formatMinutes(transcript, meetingInfo);
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const exportToWord = async () => {
    if (!formattedMinutes) {
      alert('No meeting minutes to export. Please generate minutes first.');
      return;
    }
    
    try {
      const meetingInfo = {
        date: new Date(meetingDate),
        type: meetingType as 'Meeting' | 'Practice' | 'Committee' | 'Performance' | 'Special',
        chairperson,
        present,
        apologies,
        minutesBy
      };
      
      const generator = new MeetingMinutesGenerator();
      await generator.generateAndDownloadDocument(meetingInfo, formattedMinutes);
    } catch (error) {
      console.error('Failed to export Word document:', error);
      alert('Failed to export Word document. Please try again.');
    }
  };

  const exportToPdf = async () => {
    if (!formattedMinutes) {
      alert('No meeting minutes to export. Please generate minutes first.');
      return;
    }
    
    try {
      const meetingInfo = {
        date: new Date(meetingDate),
        type: meetingType as 'Meeting' | 'Practice' | 'Committee' | 'Performance' | 'Special',
        chairperson,
        present,
        apologies,
        minutesBy
      };
      
      const generator = new MeetingMinutesPDFGenerator();
      generator.downloadMeetingMinutesPDF(meetingInfo, formattedMinutes);
    } catch (error) {
      console.error('Failed to export PDF document:', error);
      alert('Failed to export PDF document. Please try again.');
    }
  };

  const saveMinutes = () => {
    alert('Save to database functionality would be implemented here.');
  };

  // Initialize editable content when minutes are generated
  React.useEffect(() => {
    if (formattedMinutes?.htmlContent && !editedContent) {
      // Convert HTML to plain text for editing with proper formatting
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = formattedMinutes.htmlContent;
      const rawText = tempDiv.textContent || tempDiv.innerText || '';
      
      // Clean up the text to have numbers inline and remove excess spacing
      const cleanedText = rawText
        .replace(/(\d+)\.\s*\n\s*/g, '$1. ') // Put numbers inline with text
        .replace(/\n\s*\n+/g, '\n') // Remove multiple line breaks
        .trim();
      
      setEditedContent(cleanedText);
    }
  }, [formattedMinutes?.htmlContent]);

  const saveEdits = () => {
    if (formattedMinutes && editedContent.trim()) {
      // Convert plain text back to HTML format for consistency
      const formattedContent = editedContent
        .split('\n')
        .filter(line => line.trim())
        .map((line, index) => `<div class="agenda-item"><span class="agenda-number">${index + 1}.</span>${line.trim()}</div>`)
        .join('\n');

      // Update the formatted minutes using the hook
      const updatedMinutes = {
        ...formattedMinutes,
        htmlContent: formattedContent
      };
      
      updateMinutes(updatedMinutes);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="logo">🎵</div>
        <h1>Harmony Notes</h1>
        <p>Digital Meeting Minutes for Lobethal Harmony Club</p>
      </div>

      <div className="main-content">
        <div className="panel recording-panel">
          <h2>
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
            Recording Setup
          </h2>
          
          <div className="meeting-info">
            <label htmlFor="meetingDate">Meeting Date:</label>
            <input 
              type="date" 
              id="meetingDate" 
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
            />
            
            <label htmlFor="meetingType">Meeting Type:</label>
            <select 
              id="meetingType"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
            >
              <option value="Meeting">Meeting</option>
              <option value="Practice">Practice</option>
              <option value="Committee">Committee</option>
              <option value="Performance">Performance</option>
              <option value="Special">Special</option>
            </select>
            
            <label htmlFor="chairperson">Chair:</label>
            <input 
              type="text" 
              id="chairperson" 
              placeholder="Meeting chairperson"
              value={chairperson}
              onChange={(e) => setChairperson(e.target.value)}
            />
            
            <label htmlFor="present">Present:</label>
            <input 
              type="text" 
              id="present" 
              placeholder="Number of members present"
              value={present}
              onChange={(e) => setPresent(e.target.value)}
            />
            
            <label htmlFor="apologies">Apologies:</label>
            <input 
              type="text" 
              id="apologies" 
              placeholder="Members who sent apologies"
              value={apologies}
              onChange={(e) => setApologies(e.target.value)}
            />
            
            <label htmlFor="minutes">Minutes by:</label>
            <input 
              type="text" 
              id="minutes" 
              placeholder="Person taking minutes"
              value={minutesBy}
              onChange={(e) => setMinutesBy(e.target.value)}
            />
          </div>

          <button 
            className={`record-button ${isRecording ? 'recording' : ''}`}
            onClick={toggleRecording}
            disabled={isConnecting}
          >
            <svg className="icon" viewBox="0 0 24 24">
              {isRecording ? (
                <rect x="6" y="6" width="12" height="12"/>
              ) : (
                <circle cx="12" cy="12" r="10"/>
              )}
            </svg>
          </button>
          
          <div className="status">
            {isConnecting ? 'Connecting...' : isRecording ? 'Recording...' : 'Ready to record'}
          </div>

          {recordingError && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '10px',
              color: '#c33',
              fontSize: '14px'
            }}>
              {recordingError}
              <button 
                onClick={clearRecordingError}
                style={{
                  marginLeft: '10px',
                  padding: '2px 8px',
                  backgroundColor: 'transparent',
                  border: '1px solid #c33',
                  borderRadius: '4px',
                  color: '#c33',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="panel transcript-panel">
          <h2>
            <svg className="icon" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Live Transcript
          </h2>
          
          <div className="transcript-area">
            {transcript || "Click \"Start Recording\" to begin capturing meeting notes..."}
          </div>
          
          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={handleClearTranscript}>Clear</button>
            <button 
              className="btn btn-primary" 
              onClick={generateMinutes}
              disabled={isFormatting || !transcript?.trim()}
            >
              {isFormatting ? 'Generating...' : 'Generate Minutes'}
            </button>
          </div>

          {formattingError && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '10px',
              color: '#856404',
              fontSize: '14px'
            }}>
              {formattingError}
              <button 
                onClick={clearFormattingError}
                style={{
                  marginLeft: '10px',
                  padding: '2px 8px',
                  backgroundColor: 'transparent',
                  border: '1px solid #856404',
                  borderRadius: '4px',
                  color: '#856404',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="minutes-output">
        <h2>
          <svg className="icon" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          Formatted Meeting Minutes
        </h2>
        
        <div className="minutes-content">
          <div className="minutes-header">
            <table style={{width: '100%', borderCollapse: 'collapse', border: '2px solid #333', marginBottom: '30px'}}>
              <tbody>
                <tr>
                  <td style={{border: '1px solid #333', padding: '8px', fontWeight: 'bold', color: '#1a365d'}}>Meeting</td>
                  <td style={{border: '1px solid #333', padding: '8px', fontSize: '16px', fontWeight: 'bold', color: '#1a365d'}}>
                    {meetingType}
                  </td>
                  <td style={{border: '1px solid #333', padding: '8px', textAlign: 'center', width: '120px'}}>
                    <strong>Page:</strong> 1 of 1
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} style={{border: '1px solid #333', padding: '15px', textAlign: 'center', fontSize: '28px', fontWeight: 'bold', color: '#1a365d'}}>
                    Lobethal Harmony Club
                  </td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #333', padding: '8px', fontWeight: 'bold', color: '#1a365d'}}>Date:</td>
                  <td style={{border: '1px solid #333', padding: '8px'}}>{formatDisplayDate(meetingDate)}</td>
                  <td style={{border: '1px solid #333', padding: '8px'}}></td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #333', padding: '8px', fontWeight: 'bold', color: '#1a365d'}}>Chair:</td>
                  <td style={{border: '1px solid #333', padding: '8px'}}>{chairperson || 'To be filled'}</td>
                  <td style={{border: '1px solid #333', padding: '8px'}}></td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #333', padding: '8px', fontWeight: 'bold', color: '#1a365d'}}>Present:</td>
                  <td style={{border: '1px solid #333', padding: '8px'}}>{present || 'To be filled'}</td>
                  <td style={{border: '1px solid #333', padding: '8px'}}></td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #333', padding: '8px', fontWeight: 'bold', color: '#1a365d'}}>Apologies:</td>
                  <td style={{border: '1px solid #333', padding: '8px'}}>{apologies || 'To be filled'}</td>
                  <td style={{border: '1px solid #333', padding: '8px'}}></td>
                </tr>
                <tr>
                  <td style={{border: '1px solid #333', padding: '8px', fontWeight: 'bold', color: '#1a365d'}}>Minutes:</td>
                  <td style={{border: '1px solid #333', padding: '8px'}}>{minutesBy || 'To be filled'}</td>
                  <td style={{border: '1px solid #333', padding: '8px'}}></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="minutes-section">
            <h3>Meeting Content</h3>
            
            {formattedMinutes?.htmlContent ? (
              <div>
                <textarea
                  className="edit-textarea"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  onBlur={saveEdits}
                  placeholder="Meeting notes will appear here for editing..."
                />
              </div>
            ) : (
              <p>Meeting notes will be processed and formatted here...</p>
            )}
          </div>

          {formattedMinutes?.summary && (
            <div className="minutes-section">
              <h3>Meeting Summary</h3>
              <p style={{ fontStyle: 'italic' }}>{formattedMinutes.summary}</p>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn btn-secondary" 
            onClick={exportToWord}
            disabled={!formattedMinutes && !transcript?.trim()}
          >
            Export Word
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={exportToPdf}
            disabled={!formattedMinutes && !transcript?.trim()}
          >
            Export PDF
          </button>
          <button 
            className="btn btn-primary" 
            onClick={saveMinutes}
            disabled={!formattedMinutes && !transcript?.trim()}
          >
            Save Minutes
          </button>
        </div>
      </div>

      <div className="footer">
        <p>&copy; 2025 Lobethal Harmony Club - Harmony Notes App</p>
      </div>
    </div>
  );
};

export default HarmonyNotesApp;