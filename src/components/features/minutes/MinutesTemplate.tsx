import React from 'react';
import type { MeetingInfo } from '../../../types/meeting';
import type { FormattedMinutes } from '../../../types/minutes';

interface MinutesTemplateProps {
  meetingInfo?: MeetingInfo;
  formattedMinutes?: FormattedMinutes | null;
}

const MinutesTemplate: React.FC<MinutesTemplateProps> = ({ 
  meetingInfo, 
  formattedMinutes 
}) => {
  const formatDate = (date?: Date) => {
    if (!date) return 'Select date above';
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg p-8 min-h-96 border border-gray-200 font-serif leading-relaxed mb-6">
      <div className="text-center border-b-2 border-black pb-5 mb-8">
        <table className="w-full border-collapse border-2 border-black mb-8">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold text-blue-900">Meeting</td>
              <td className="border border-black p-2 text-base font-bold text-blue-900">
                {meetingInfo?.type || 'Meeting'}
              </td>
              <td className="border border-black p-2 text-center w-32">
                <strong>Page:</strong> 1 of 1
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="border border-black p-4 text-center text-3xl font-bold text-blue-900">
                Lobethal Harmony Club
              </td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold text-blue-900">Date:</td>
              <td className="border border-black p-2">{formatDate(meetingInfo?.date)}</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold text-blue-900">Chair:</td>
              <td className="border border-black p-2">{meetingInfo?.chairperson || 'To be filled'}</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold text-blue-900">Present:</td>
              <td className="border border-black p-2">{meetingInfo?.present || 'To be filled'}</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold text-blue-900">Apologies:</td>
              <td className="border border-black p-2">{meetingInfo?.apologies || 'To be filled'}</td>
              <td className="border border-black p-2"></td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold text-blue-900">Minutes:</td>
              <td className="border border-black p-2">{meetingInfo?.minutesBy || 'To be filled'}</td>
              <td className="border border-black p-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="mb-6">
        <h3 className="text-black border-b border-gray-400 pb-1 mb-4 font-semibold">Meeting Content</h3>
        <div>
          {formattedMinutes?.htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: formattedMinutes.htmlContent }} />
          ) : (
            <p>Meeting notes will be processed and formatted here...</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-black border-b border-gray-400 pb-1 mb-4 font-semibold">Action Items</h3>
        <div>
          {formattedMinutes?.actionItems?.length ? (
            formattedMinutes.actionItems.map((item) => (
              <p key={item.id} className="mb-2">
                • {item.description}
                {item.assignee && <span className="font-semibold"> ({item.assignee})</span>}
              </p>
            ))
          ) : (
            <p>Action items will be extracted automatically...</p>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-black border-b border-gray-400 pb-1 mb-4 font-semibold">Next Meeting</h3>
        <p>
          {formattedMinutes?.nextMeeting || 'To be determined'}
        </p>
      </div>
    </div>
  );
};

export default MinutesTemplate;