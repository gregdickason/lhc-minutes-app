import OpenAI from 'openai';

export const config = {
  runtime: 'edge'
};

interface MinutesFormattingRequest {
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

interface MinutesFormattingResponse {
  success: boolean;
  formattedMinutes?: {
    htmlContent: string;
    summary: string;
  };
  error?: string;
}

const MINUTES_FORMATTING_PROMPT = `You are a professional meeting minutes formatter for the Lobethal Harmony Club, a community music organization.

Transform the provided meeting transcript into formal meeting minutes that match the official club template format.

## TASK: Format Meeting Minutes
Extract and organize the meeting content into numbered agenda items suitable for the official Lobethal Harmony Club minutes template.

## OUTPUT FORMAT:
Respond with HTML content formatted as numbered agenda items:

<div class="agenda-item">
<span class="agenda-number">1.</span>
[Meeting content with key information highlighted]
</div>

## FORMATTING RULES:
1. **Numbered Items**: Each agenda item must be numbered sequentially (1., 2., 3., etc.)
2. **HTML Structure**: Wrap each item in <div class="agenda-item"> with <span class="agenda-number">
3. **Highlighting**: Wrap important names, dates, decisions, and key information in <span class="highlight">
4. **Content Flow**: Write in complete sentences, not bullet points
5. **Professional Tone**: Formal but friendly language appropriate for club minutes

## HIGHLIGHTING GUIDELINES:
- **Names**: People mentioned (John Smith, Mary Jones)
- **Dates**: Specific dates and times (19th August, 14th September)  
- **Decisions**: Important resolutions or outcomes
- **Actions**: Specific responsibilities or tasks assigned
- **Events**: Concerts, meetings, special occasions
- **Numbers**: Member counts, financial amounts
- **Key Information**: Important announcements or updates

## EXAMPLES OF CORRECT FORMAT:

<div class="agenda-item">
<span class="agenda-number">1.</span>
John welcomed all and apologies as noted above. We are <span class="highlight">pleased to see Luke back with us</span>. He has joined Mount Barker Oil and Batteries. We wished Luke well in this new work opportunity.
</div>

<div class="agenda-item">
<span class="agenda-number">2.</span>
In Alex' absence, <span class="highlight">Peter Dickinson directed the choir</span>.
</div>

<div class="agenda-item">
<span class="agenda-number">3.</span>
The <span class="highlight">soup team for 19th August is John Wittwer and Kim Furler</span>.
</div>

<div class="agenda-item">
<span class="agenda-number">4.</span>
The concert at <span class="highlight">Valley of Praise will possibly be on 14th September</span>. The <span class="highlight">Strathalbyn concert will take place on 21st September</span>.
</div>

## CONTENT GUIDELINES:
1. **Accuracy**: Only include information actually discussed in the transcript
2. **Completeness**: Capture all significant discussions, decisions, and announcements
3. **Organization**: Present information in logical order as discussed
4. **Club Context**: This is a community choir/harmony group covering performances, rehearsals, membership, social events, administrative matters
5. **Sentence Structure**: Use proper grammar and complete sentences

Process the transcript and generate the HTML content for the meeting minutes template.`;

// Simple rate limiting (use same pattern as Deepgram)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('Missing OpenAI API key');
      return new Response(
        JSON.stringify({ success: false, error: 'Service configuration error' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse and validate request body
    let body: MinutesFormattingRequest;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { transcript, meetingInfo } = body;

    // Validate required fields
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Transcript is required and cannot be empty' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (transcript.length > 50000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Transcript too long. Maximum 50,000 characters.' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Prepare the full prompt with meeting context
    const fullPrompt = `${MINUTES_FORMATTING_PROMPT}

## MEETING CONTEXT:
- Date: ${meetingInfo.date}
- Type: ${meetingInfo.type}
- Chair: ${meetingInfo.chairperson}
- Present: ${meetingInfo.present}
- Apologies: ${meetingInfo.apologies}
- Minutes by: ${meetingInfo.minutesBy}

## TRANSCRIPT:
${transcript.trim()}

Please format this transcript into meeting minutes as specified above.`;

    // Make OpenAI API call
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent formatting
      max_tokens: 2000,
    });

    const htmlContent = completion.choices[0]?.message?.content;
    if (!htmlContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'No response from AI service' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate that we received HTML content with proper structure
    if (!htmlContent.includes('<div class="agenda-item">')) {
      console.error('AI response does not contain expected HTML structure:', htmlContent);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid response format from AI service' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a summary from the content (extract first sentence of first item)
    const summaryMatch = htmlContent.match(/<span class="agenda-number">\d+\.<\/span>\s*([^<]+)/);
    const summary = summaryMatch 
      ? `Meeting minutes processed successfully. ${summaryMatch[1].trim().substring(0, 100)}...`
      : 'Meeting minutes processed successfully.';

    const formattedMinutes = {
      htmlContent: htmlContent.trim(),
      summary: summary
    };

    return new Response(
      JSON.stringify({
        success: true,
        formattedMinutes
      } as MinutesFormattingResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    
    // Handle OpenAI API errors specifically
    if (error instanceof Error && error.message.includes('API key')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Service authentication error' }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}