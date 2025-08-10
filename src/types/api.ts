export interface DeepgramTokenResponse {
  token: string;
  expires: string;
}

export interface MinutesFormattingRequest {
  transcript: string;
  meetingInfo: {
    date: string;
    type: string;
    chairperson: string;
    present: string;
    apologies: string;
    minutesBy: string;
  };
}

export interface MinutesFormattingResponse {
  success: boolean;
  formattedMinutes?: {
    agendaItems: Array<{
      title: string;
      discussion: string;
      decision?: string;
    }>;
    actionItems: Array<{
      description: string;
      assignee?: string;
    }>;
    nextMeeting?: {
      date?: string;
      location?: string;
    };
  };
  error?: string;
}

export interface APIError {
  message: string;
  status: number;
  code?: string;
}