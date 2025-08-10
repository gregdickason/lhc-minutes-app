interface MeetingInfo {
  date: string;
  type: string;
  chairperson: string;
  present: string;
  apologies: string;
  minutesBy: string;
}


export interface FormattedMinutes {
  htmlContent: string;
  summary: string;
}

interface MinutesFormattingRequest {
  transcript: string;
  meetingInfo: MeetingInfo;
}

interface MinutesFormattingResponse {
  success: boolean;
  formattedMinutes?: FormattedMinutes;
  error?: string;
}

export class MinutesService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  async formatMinutes(transcript: string, meetingInfo: MeetingInfo): Promise<FormattedMinutes> {
    try {
      // Validate inputs
      if (!transcript || transcript.trim().length === 0) {
        throw new Error('Transcript cannot be empty');
      }

      if (transcript.length > 50000) {
        throw new Error('Transcript too long. Maximum 50,000 characters allowed.');
      }

      // Use direct API key if available (development mode)
      if (this.apiKey && this.apiKey.length > 0) {
        console.log('Using direct OpenAI API for minutes formatting...');
        return await this.formatMinutesDirect(transcript, meetingInfo);
      }

      // Fall back to Edge Function (production mode)
      console.log('Using Edge Function for minutes formatting...');
      return await this.formatMinutesViaEdgeFunction(transcript, meetingInfo);

    } catch (error) {
      console.error('Minutes formatting error:', error);
      
      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Unknown error occurred while formatting minutes');
    }
  }

  private async formatMinutesViaEdgeFunction(transcript: string, meetingInfo: MeetingInfo): Promise<FormattedMinutes> {
    // Prepare request payload
    const requestData: MinutesFormattingRequest = {
      transcript: transcript.trim(),
      meetingInfo
    };

    // Make API call to Edge Function
    const response = await fetch('/api/format-minutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const result: MinutesFormattingResponse = await response.json();

    if (!result.success) {
      console.error('Minutes formatting error:', result.error);
      throw new Error(result.error || 'Failed to format minutes');
    }

    if (!result.formattedMinutes) {
      throw new Error('No formatted minutes received from service');
    }

    return result.formattedMinutes;
  }

  private async formatMinutesDirect(transcript: string, meetingInfo: MeetingInfo): Promise<FormattedMinutes> {
    const { MINUTES_FORMATTING_PROMPT } = await import('../prompts/minutesFormatting');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: MINUTES_FORMATTING_PROMPT
          },
          {
            role: 'user',
            content: `Meeting Information:
Date: ${meetingInfo.date}
Type: ${meetingInfo.type}
Chairperson: ${meetingInfo.chairperson}
Present: ${meetingInfo.present}
Apologies: ${meetingInfo.apologies}
Minutes By: ${meetingInfo.minutesBy}

Transcript:
${transcript}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return {
      htmlContent: content,
      summary: `Meeting minutes generated for ${meetingInfo.type} on ${meetingInfo.date}`
    };
  }

  /**
   * Validate that the formatted minutes contain required structure
   */
  validateFormattedMinutes(minutes: FormattedMinutes): boolean {
    try {
      return (
        typeof minutes.htmlContent === 'string' &&
        minutes.htmlContent.length > 0 &&
        minutes.htmlContent.includes('<div class="agenda-item">') &&
        typeof minutes.summary === 'string' &&
        minutes.summary.length > 0
      );
    } catch {
      return false;
    }
  }

  /**
   * Clean and sanitize formatted minutes
   */
  sanitizeFormattedMinutes(minutes: FormattedMinutes): FormattedMinutes {
    return {
      htmlContent: this.sanitizeHtml(minutes.htmlContent),
      summary: this.sanitizeString(minutes.summary)
    };
  }

  private sanitizeHtml(html: string): string {
    if (!html || typeof html !== 'string') return '';
    
    return html
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
      .replace(/on\w+="[^"]*"/g, '') // Remove event handlers
      .replace(/javascript:/gi, '') // Remove javascript: urls
      .substring(0, 10000); // Limit length for safety
  }

  private sanitizeString(str: string): string {
    if (!str || typeof str !== 'string') return '';
    
    return str
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 1000); // Limit length for safety
  }

  /**
   * Generate a simple fallback format from raw transcript
   * Used when AI formatting fails
   */
  generateFallbackMinutes(transcript: string): FormattedMinutes {
    const sentences = transcript
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 8); // Limit to 8 items for fallback

    // Create basic HTML formatted agenda items
    const htmlContent = sentences
      .map((sentence, index) => 
        `<div class="agenda-item">
<span class="agenda-number">${index + 1}.</span>
${sentence}.
</div>`
      )
      .join('\n\n');

    return {
      htmlContent,
      summary: 'Meeting minutes generated from transcript. Professional formatting was not available.'
    };
  }
}