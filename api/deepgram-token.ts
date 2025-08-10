import { NextRequest, NextResponse } from 'next/server';
import { deepgramLimiter } from './middleware/rateLimit';

export const config = {
  runtime: 'edge',
  regions: ['syd1'] // Australian region for compliance
};

interface DeepgramTokenResponse {
  key: string;
  expires: string;
}

interface DeepgramErrorResponse {
  error: string;
  message?: string;
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    // Rate limiting
    const rateLimitResult = deepgramLimiter.check(req);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
          }
        }
      );
    }

    // Validate environment variables
    const apiKey = process.env.DEEPGRAM_API_KEY;
    const projectId = process.env.DEEPGRAM_PROJECT_ID;

    if (!apiKey || !projectId) {
      console.error('Missing Deepgram configuration');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const duration = Math.min(body.duration || 1800, 3600); // Default 30 minutes, max 1 hour

    // Generate Deepgram token
    const deepgramResponse = await fetch(
      `https://api.deepgram.com/v1/projects/${projectId}/keys`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: 'Temporary token for LHC meeting minutes transcription',
          scopes: ['usage:write'],
          tags: ['temporary', 'lhc-minutes', 'frontend'],
          time_to_live_in_seconds: duration
        })
      }
    );

    if (!deepgramResponse.ok) {
      const errorData = await deepgramResponse.text();
      console.error('Deepgram API error:', {
        status: deepgramResponse.status,
        statusText: deepgramResponse.statusText,
        body: errorData
      });

      return NextResponse.json({
        success: false,
        error: 'Failed to generate transcription token'
      }, { status: 503 });
    }

    const tokenData: DeepgramTokenResponse = await deepgramResponse.json();

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + duration * 1000);

    return NextResponse.json({
      success: true,
      apiKey: tokenData.key,
      expiresAt: expiresAt.toISOString()
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      }
    });

  } catch (error) {
    console.error('Edge function error:', error);
    
    // Sanitize error for client
    const errorMessage = error instanceof Error 
      ? 'Internal server error' 
      : 'Unknown error occurred';

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}