export interface MeetingInfo {
  date: Date;
  type: 'Meeting' | 'Practice' | 'Committee' | 'Performance' | 'Special';
  chairperson: string;
  present: string;
  apologies: string;
  minutesBy: string;
}

export interface MeetingSession {
  id: string;
  info: MeetingInfo;
  startTime: Date;
  endTime?: Date;
  transcript: string;
  status: 'setup' | 'recording' | 'stopped' | 'processing' | 'complete';
}