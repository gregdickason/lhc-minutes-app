# LHC Minutes - Lobethal Harmony Club Meeting Minutes Application

## Project Overview

Building a meeting minutes application for the Lobethal Harmony Club that captures live meeting audio, transcribes speech to text, and generates professionally formatted meeting minutes documents (Word/PDF) with formal club headers and structured content.

## Architecture Plan

Based on the analysis of the `speech_scribe` codebase, we will adopt the same proven architecture and technology stack for this application.

### Technology Stack

**Frontend:**
- React 19.1.0 with TypeScript
- Vite for build tooling and dev server
- Tailwind CSS for styling (custom harmony club theme)
- Modern ESLint configuration

**Backend/API:**
- Vercel Edge Functions for serverless API endpoints
- Edge Runtime deployment (Sydney region for Australian compliance)

**AI Services:**
- Deepgram for real-time speech-to-text (Australian English)
- OpenAI GPT-4 for meeting minutes formatting and structure
- Google Gemini as backup AI service

**Document Generation:**
- docx library for Word document generation
- jsPDF for PDF generation with custom formatting

**Key Dependencies:**
```json
{
  "@deepgram/sdk": "^4.4.0",
  "docx": "^9.5.1",
  "jspdf": "^3.0.1", 
  "openai": "^5.3.0",
  "react": "^19.1.0",
  "typescript": "^5.0.0",
  "vite": "^6.0.0",
  "tailwindcss": "^3.4.0"
}
```

## Project Structure

```
lhc_minutes/
├── api/                          # Vercel Edge Functions
│   ├── deepgram-token.ts        # Secure token generation
│   ├── format-minutes.ts        # OpenAI minutes formatting
│   └── middleware/
│       └── rateLimit.ts         # Rate limiting
├── src/
│   ├── components/              # React components
│   │   ├── features/           # Feature-specific components
│   │   │   ├── recording/      # Audio recording components
│   │   │   ├── transcript/     # Live transcript display
│   │   │   ├── minutes/        # Minutes generation & display
│   │   │   └── export/         # Export functionality
│   │   ├── interface/          # UI interface components
│   │   │   ├── forms/          # Meeting info forms
│   │   │   ├── buttons/        # Custom buttons
│   │   │   └── layout/         # Layout components
│   │   └── common/             # Shared components
│   ├── context/                # React Context providers
│   │   ├── MeetingContextProvider.tsx
│   │   ├── RecordingContextProvider.tsx
│   │   └── MinutesContextProvider.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAudioRecording.ts
│   │   ├── useMinutesFormatting.ts
│   │   └── useDocumentExport.ts
│   ├── services/               # API service layer
│   │   ├── deepgramService.ts
│   │   ├── minutesService.ts
│   │   └── exportService.ts
│   ├── utils/                  # Utility functions
│   │   ├── audioProcessing.ts
│   │   ├── documentFormatting.ts
│   │   └── dateHelpers.ts
│   ├── types/                  # TypeScript definitions
│   │   ├── meeting.ts
│   │   ├── minutes.ts
│   │   └── api.ts
│   ├── styles/                 # CSS files
│   │   └── harmony-theme.css
│   └── prompts/                # AI prompt templates
│       └── minutesFormatting.ts
├── tests/                      # Testing directory
│   ├── fixtures/
│   ├── minutes/
│   └── runMinutesTests.ts
├── public/                     # Static assets
│   └── harmony-logo.svg
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── vercel.json
```

## Two-Stage Processing Architecture

Following the proven pattern from speech_scribe:

### Stage 1: Live Audio Capture & Transcription
- Real-time speech-to-text via Deepgram WebSocket
- Immediate transcription display for user review
- Meeting metadata capture (date, type, attendees, etc.)
- Raw transcript accumulation without AI processing

### Stage 2: Professional Minutes Generation
- User-triggered AI formatting via OpenAI GPT-4
- Structured meeting minutes generation
- Extraction of key elements:
  - Agenda items and discussions
  - Action items and decisions
  - Attendee information
  - Meeting outcomes
- Professional language transformation suitable for club records

## Core Components Design

### 1. Meeting Setup Panel
```typescript
interface MeetingInfo {
  date: Date;
  type: 'Meeting' | 'Practice' | 'Committee' | 'Performance' | 'Special';
  chairperson: string;
  present: string;
  apologies: string;
  minutesBy: string;
}
```

### 2. Audio Recording System
- Deepgram WebSocket integration
- Real-time audio processing (Float32 to PCM16)
- Visual recording indicators
- Start/stop controls

### 3. Live Transcript Display
- Real-time transcript updates
- Interim results display (greyed out)
- Final results accumulation
- Clear/edit functionality

### 4. Minutes Generation Engine
- AI-powered content structuring
- Automatic action item extraction
- Formal language transformation
- Club-specific formatting

### 5. Document Export System
- Word document generation with club headers
- PDF export with professional formatting
- Meeting minutes template compliance
- Download functionality

## Document Template Structure

Based on the provided HTML mockup, the generated documents will include:

### Header Section
- Lobethal Harmony Club branding
- Meeting type and date
- Page numbering
- Chairperson and attendee information
- Apologies and minutes taker

### Content Sections
1. **Meeting Details Table**
   - Formal bordered table with club information
   - Meeting metadata in structured format

2. **Meeting Content**
   - Processed agenda items
   - Discussion summaries
   - Decisions made

3. **Action Items**
   - Automatically extracted action items
   - Responsible parties
   - Due dates (where mentioned)

4. **Next Meeting**
   - Date and time (if discussed)
   - Location and agenda preview

## Security & Privacy

Following speech_scribe's privacy-first approach:

### Client-Side Data Handling
- All meeting audio and transcripts stay client-side
- No persistent storage on servers
- Export to local files only

### API Security
- Server-side API key storage
- Rate limiting on all endpoints
- Input validation and sanitization
- Australian data residency (Sydney region)

### Access Control
- No user authentication required
- No cloud storage of sensitive data
- Local-only processing where possible

## AI Prompt Engineering

### Minutes Formatting Prompts
```typescript
const MINUTES_FORMATTING_PROMPT = `
You are a professional meeting minutes formatter for the Lobethal Harmony Club.

Transform the provided meeting transcript into formal meeting minutes with:

1. Clear agenda item identification
2. Concise decision summaries
3. Action item extraction with responsible parties
4. Professional club language
5. Proper meeting minute structure

Focus on:
- Factual accuracy
- Professional tone
- Clear action items
- Structured format suitable for club records
- Compliance with standard meeting minute practices

Format as structured sections for easy document generation.
`;
```

## Development Phases

### Phase 1: Core Infrastructure (Week 1) ✅
- Project setup with Vite + React + TypeScript
- Tailwind configuration with harmony club theme
- Basic component structure
- Vercel deployment setup

### Phase 2: Audio Capture System (Week 2)
- Deepgram integration
- Real-time transcription
- Audio processing pipeline
- Recording controls and status

### Phase 3: Minutes Processing (Week 3)
- OpenAI integration for minutes formatting
- Transcript to minutes transformation
- Action item extraction
- Content structuring

### Phase 4: Document Generation (Week 4) ✅
- Word document generation with club template
- PDF export functionality
- Professional formatting
- Download and save features

### Phase 5: Testing & Polish (Week 5)
- Comprehensive testing suite
- Error handling and edge cases
- Performance optimization
- UI/UX refinements

## Testing Strategy

Following speech_scribe's testing approach:

### Fixture-Based Testing
- Sample meeting transcripts
- Expected minutes output
- AI response validation

### Component Testing
- Audio recording functionality
- Document generation accuracy
- Export format validation

### Integration Testing
- End-to-end workflows
- API integration testing
- Document format compliance

## Deployment Configuration

### Vercel Setup
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```

### Edge Function Configuration
```typescript
export const config = {
  runtime: 'edge',
  regions: ['syd1']  // Australian compliance
};
```

## UI/UX Design Specifications

### Color Palette (Harmony Club Theme)
```css
:root {
  --harmony-primary: #667eea;
  --harmony-secondary: #764ba2;
  --harmony-accent: #4ecdc4;
  --harmony-danger: #ff6b6b;
  --harmony-success: #51cf66;
  --harmony-background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Typography
- Primary font: 'Segoe UI', system fonts
- Document font: 'Times New Roman' (for exports)
- Consistent font sizing and spacing

### Responsive Design
- Mobile-first approach
- Grid layout adaptation for smaller screens
- Touch-friendly controls for tablets

## Performance Considerations

### Audio Processing Optimization
- Efficient WebSocket data handling
- Minimal audio buffer memory usage
- Real-time processing without blocking UI

### Document Generation Performance
- Lazy loading of export libraries
- Efficient DOM manipulation for large transcripts
- Progress indicators for long operations

## Compliance & Standards

### Meeting Minutes Standards
- Formal club meeting minute requirements
- Action item tracking standards
- Professional document formatting

### Data Protection
- No personal data storage
- Local-only processing
- Secure API communications

## Future Enhancements

### Advanced Features (Phase 6+)
- Speaker identification
- Automatic agenda item detection
- Integration with club management systems
- Cloud backup options (with consent)
- Mobile app development

### AI Improvements
- Custom training for club-specific terminology
- Better action item detection
- Sentiment analysis for meeting tone
- Automatic meeting type classification

## Success Metrics

### Technical Metrics
- Real-time transcription accuracy (>95%)
- Document generation speed (<30 seconds)
- System uptime and reliability
- Audio processing latency (<2 seconds)

### User Experience Metrics
- Setup time to start recording (<2 minutes)
- Minutes generation accuracy
- Export success rate
- User satisfaction with document quality

## Risk Mitigation

### Technical Risks
- Audio capture issues → Backup recording options
- API service outages → Graceful degradation
- Network connectivity → Offline mode capabilities
- Browser compatibility → Progressive enhancement

### Operational Risks
- User training → Comprehensive documentation
- Data loss → Local backup recommendations
- Hardware issues → Multi-device support

## Current Status

✅ **Phase 1 COMPLETE**: Core Infrastructure & UI Foundation
✅ **Phase 2 COMPLETE**: Audio Capture & Real-time Transcription  
✅ **Phase 3 COMPLETE**: AI-Powered Minutes Formatting
✅ **Phase 4 COMPLETE**: Document Export System (Word & PDF)
*Completed: January 2025*

### ✅ Infrastructure Setup
- **Project Scaffolding**: Vite + React 19.1.0 + TypeScript configured
- **Build System**: Production build verified and working (`npm run build` ✅)
- **Styling**: Tailwind CSS v4 with @tailwindcss/postcss plugin configured
- **Deployment**: Vercel configuration ready with Edge Functions support
- **Dependencies**: All core libraries installed and configured
  - @deepgram/sdk: ^4.11.2 - Real-time speech-to-text
  - openai: ^5.12.2 - AI-powered minutes formatting
  - docx: ^9.5.1 - Word document generation
  - jsPDF: ^3.0.1 - PDF document generation

### ✅ Architecture Implementation
- **State Management**: Custom hooks (useAudioRecording, useMinutesFormatting)
- **Type Safety**: Complete TypeScript definitions for all data structures
- **Component Structure**: Modular feature-based organization following speech_scribe patterns
- **Error Handling**: Comprehensive error states and user feedback systems
- **API Layer**: Secure Edge Functions with rate limiting and validation

### ✅ UI Components Complete
- **Header**: Harmony Club branding with musical note logo
- **Meeting Setup Panel**: Complete form with all required fields
  - Date picker with default to today
  - Meeting type selector (Meeting/Practice/Committee/Performance/Special)
  - Chairperson, attendees, apologies, and minutes taker fields
- **Recording Controls**: Animated start/stop button with visual feedback
- **Live Transcript Panel**: Real-time display area with clear/generate controls
- **Minutes Display**: Professional template matching Lobethal Harmony Club format
- **Export Controls**: Word/PDF/Save buttons (UI complete, functionality pending)

### ✅ Design & Theming
- **Color Palette**: Custom Harmony Club theme implemented
  - Primary: #667eea, Secondary: #764ba2, Accent: #4ecdc4
  - Gradient background matching original design
- **Typography**: Segoe UI for interface, Times New Roman for documents
- **Responsive**: Mobile-first design with grid layout adaptation
- **Animations**: Pulse effect for recording state, hover transitions

### ✅ Template Implementation
- **Meeting Header Table**: Official bordered format with club branding
- **Dynamic Content**: Real-time updates from form data
- **Professional Formatting**: Matches existing club minute standards
- **Page Structure**: Content sections, action items, next meeting areas

### ✅ Audio Processing Complete (Phase 2)
- **Deepgram Integration**: WebSocket connection with Australian English (en-AU)
- **Real-time Transcription**: Live speech-to-text with interim/final results
- **Audio Pipeline**: Float32→PCM16 conversion, 16kHz sample rate
- **Connection Management**: Proper cleanup and error handling
- **Edge Functions**: Secure token generation with rate limiting (50 req/hr)

### ✅ AI Minutes Formatting Complete (Phase 3)
- **OpenAI Integration**: GPT-4 powered minutes formatting
- **Smart Prompt**: Specialized for Lobethal Harmony Club context
- **Structured Output**: Agenda items, action items, decisions, next meeting
- **Fallback System**: Basic formatting if AI service unavailable
- **Rate Limiting**: 20 requests/hour with input validation (50k chars max)

### ✅ Document Export System Complete (Phase 4)
- **Word Document Generation**: Professional `.docx` export using docx library
  - `MeetingMinutesGenerator` class following speech_scribe patterns
  - Official club header with centered branding
  - Bordered meeting details table (Date, Chair, Present, Apologies, etc.)
  - HTML content parsing to structured paragraphs
  - Action items with assignee tracking
  - Signature sections for official approval
  - Error handling with user feedback
  
- **PDF Document Generation**: Professional `.pdf` export using jsPDF library
  - `MeetingMinutesPDFGenerator` class with multi-page support
  - Typography hierarchy (22pt title, 16pt headings, 11pt content)
  - Page break management and automatic pagination  
  - Footer with generation timestamp and page numbers
  - Structured layout matching official club format
  - Responsive table formatting with proper borders

### ✅ Technical Quality
- **Type Safety**: All imports use proper type-only imports for verbatimModuleSyntax
- **Build Pipeline**: Clean production build with no errors or warnings
- **Code Quality**: ESLint configuration and TypeScript strict mode
- **Performance**: Optimized bundle size (204KB JS, 3.7KB CSS)
- **Security**: Server-side API keys, input sanitization, rate limiting

### 🎯 Verification Status
- **Local Development**: Running successfully on http://localhost:5173/
- **Production Build**: ✅ Builds cleanly with `npm run build`
- **Audio Recording**: ✅ Deepgram WebSocket connection working
- **Live Transcription**: ✅ Real-time speech-to-text display
- **AI Processing**: ✅ OpenAI minutes formatting integration
- **Document Export**: ✅ Word and PDF generation fully functional
- **Form Validation**: Meeting info validation working
- **State Management**: Custom hooks managing all application state
- **Visual Design**: Matches HTML mockup design specifications exactly

### 📁 File Structure Complete
```
lhc-minutes-app/
├── api/                             ✅ Vercel Edge Functions
│   ├── deepgram-token.ts           ✅ Secure Deepgram token generation
│   ├── format-minutes.ts           ✅ OpenAI minutes formatting endpoint
│   └── middleware/
│       └── rateLimit.ts            ✅ Rate limiting for API endpoints
├── src/
│   ├── components/
│   │   └── HarmonyNotesApp.tsx     ✅ Main application component
│   ├── hooks/                      ✅ Custom React hooks
│   │   ├── useAudioRecording.ts    ✅ Deepgram integration hook
│   │   └── useMinutesFormatting.ts ✅ OpenAI formatting hook
│   ├── services/                   ✅ API service layer
│   │   ├── deepgramService.ts      ✅ WebSocket & audio processing
│   │   └── minutesService.ts       ✅ OpenAI API integration
│   ├── utils/                      ✅ Document generation utilities
│   │   ├── documentGeneration.ts   ✅ Word document export (docx)
│   │   └── pdfGeneration.ts        ✅ PDF document export (jsPDF)
│   ├── prompts/                    ✅ AI prompt templates
│   │   └── minutesFormatting.ts    ✅ GPT-4 minutes formatting prompt
│   ├── types/                      ✅ TypeScript definitions
│   │   ├── meeting.ts              ✅ Meeting data structures
│   │   ├── minutes.ts              ✅ Minutes data structures
│   │   └── api.ts                  ✅ API response types
│   ├── App.tsx                     ✅ Main app entry point
│   └── index.css                   ✅ CSS styles matching HTML spec
├── .env.example                    ✅ Environment variable template
├── package.json                    ✅ All dependencies configured
├── tailwind.config.js             ✅ Custom harmony theme
├── postcss.config.js              ✅ Tailwind v4 PostCSS setup
├── vercel.json                     ✅ Deployment configuration
└── CLAUDE.md                       ✅ This documentation
```

### 🚀 Application Complete & Production Ready
All core functionality is implemented and working. The application successfully:

✅ **Captures live audio** via Deepgram WebSocket (Australian English)
✅ **Displays real-time transcription** with interim/final result handling  
✅ **Formats meeting minutes** using OpenAI GPT-4 with club-specific prompts
✅ **Renders professional output** in official Lobethal Harmony Club template
✅ **Exports to Word documents** with professional club formatting (docx)
✅ **Exports to PDF documents** with structured layout and signatures
✅ **Builds cleanly** for production deployment

### ✅ Document Export System Complete (Phase 4)
- **Word Export**: Professional `.docx` generation using docx library
  - Official club header with meeting details table
  - Structured meeting content with agenda items
  - Action items with assignee information
  - Signature sections for Chairperson and Secretary
  - Automatic filename: `lhc-{type}-minutes-{date}.docx`

- **PDF Export**: Professional `.pdf` generation using jsPDF library  
  - Centered club branding and typography
  - Bordered meeting details table
  - Multi-page support with page numbering
  - Signature fields and footer information
  - Automatic filename: `lhc-{type}-minutes-{date}.pdf`

### Next Steps - Phase 5: Advanced Features (Future Enhancement)  
- **Priority 1**: Create local storage/database integration for saving minutes
- **Priority 2**: Add email sharing and member notification features
- **Priority 3**: Implement two-stage processing context for better state management
- **Priority 4**: Enhanced error handling with retry mechanisms

### 🔧 Development Commands
```bash
npm run dev      # Start development server
npm run build    # Production build (✅ Working)
npm run lint     # Code quality checks  
npm run preview  # Preview production build
```

### 🔑 Environment Setup
Copy `.env.example` to `.env.local` and add your API keys:
```bash
# Required for live transcription
DEEPGRAM_API_KEY=your_deepgram_api_key_here
DEEPGRAM_PROJECT_ID=your_deepgram_project_id_here

# Required for AI minutes formatting
OPENAI_API_KEY=your_openai_api_key_here
```

### 🎯 Key Features Working
- **Live Audio Recording**: Click record button to start Deepgram transcription
- **Real-time Transcript**: Words appear as you speak with interim/final states
- **Meeting Info Form**: All fields update the minutes template in real-time
- **AI Minutes Generation**: "Generate Minutes" processes transcript with GPT-4
- **Professional Output**: Structured agenda items, action items, decisions
- **Word Document Export**: Professional `.docx` files with club formatting
- **PDF Document Export**: Multi-page `.pdf` files with signatures and branding
- **Error Handling**: Fallback formatting if AI services unavailable
- **Rate Limiting**: Built-in protection (50 req/hr Deepgram, 20 req/hr OpenAI)

## Conclusion

This architecture plan leverages the proven patterns from the speech_scribe application while adapting them specifically for meeting minutes generation. The two-stage processing approach ensures real-time user feedback while maintaining professional document quality. The privacy-first design keeps all sensitive meeting data local while utilizing cloud AI services only for formatting assistance.

The modular component structure and comprehensive testing strategy will ensure a reliable, maintainable application that serves the Lobethal Harmony Club's meeting minute needs effectively.