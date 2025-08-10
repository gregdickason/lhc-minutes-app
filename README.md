# 🎵 LHC Minutes App

**Meeting Minutes Application for Lobethal Harmony Club**

A professional meeting minutes application featuring live audio recording, real-time speech-to-text transcription, AI-powered formatting, and document export capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.0.0-purple.svg)

## ✨ Features

### 🎤 Live Audio Recording
- Real-time speech-to-text transcription using Deepgram API
- Australian English language support
- WebSocket-based live transcription with interim and final results
- Visual recording indicators with animated controls

### 🤖 AI-Powered Minutes Formatting
- OpenAI GPT-4 integration for professional minutes generation
- Automatic agenda item extraction and structuring
- Action item identification with responsible parties
- Decision tracking and next meeting planning
- Club-specific language and formatting

### 📄 Document Export
- **Word Document (.docx)**: Professional club format with headers, tables, and signatures
- **PDF Export**: Multi-page documents with official branding and structured layout
- Automatic filename generation with meeting type and date

### ✏️ Editable Interface
- Real-time editable meeting minutes with large, readable fonts
- Inline editing with automatic save functionality
- Professional template matching official club requirements

### 🔒 Security & Privacy
- Client-side data handling - no sensitive data stored on servers
- Secure API key management with development/production environments
- Rate limiting and input validation
- Australian data residency compliance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Deepgram API key ([Get one here](https://deepgram.com/))
- OpenAI API key ([Get one here](https://openai.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/gregdickason/lhc-minutes-app.git
   cd lhc-minutes-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   # Required for live transcription
   VITE_DEEPGRAM_API_KEY=your_deepgram_api_key_here
   DEEPGRAM_API_KEY=your_deepgram_api_key_here
   DEEPGRAM_PROJECT_ID=your_deepgram_project_id_here
   
   # Required for AI minutes formatting
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 How to Use

### 1. Meeting Setup
- Fill in meeting details (date, type, chairperson, attendees, etc.)
- Select appropriate meeting type (Meeting, Practice, Committee, Performance, Special)

### 2. Recording
- Click the **Record** button to start live transcription
- Speak clearly - the transcript will appear in real-time
- Click **Stop** when the meeting concludes

### 3. Generate Minutes
- Review the live transcript for accuracy
- Click **Generate Minutes** to format with AI
- Edit the generated minutes directly in the text area

### 4. Export & Save
- **Export Word**: Download professional .docx document
- **Export PDF**: Download formatted PDF with signatures
- **Save Minutes**: Store for future reference (coming soon)

## 🏗️ Tech Stack

- **Frontend**: React 19.1.0 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Harmony Club theme
- **Audio Processing**: Deepgram SDK for speech-to-text
- **AI Integration**: OpenAI GPT-4 for minutes formatting
- **Document Generation**: 
  - `docx` library for Word documents
  - `jsPDF` for PDF generation
- **Deployment**: Vercel Edge Functions
- **State Management**: Custom React hooks

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── features/        # Feature-specific components
│   ├── layout/          # Layout components
│   └── HarmonyNotesApp.tsx
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── utils/               # Document generation utilities
├── types/               # TypeScript definitions
├── prompts/             # AI prompt templates
└── styles/              # CSS styling

api/                     # Vercel Edge Functions
├── deepgram-token.ts    # Secure token generation
├── format-minutes.ts    # OpenAI minutes formatting
└── middleware/          # Rate limiting
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Add Environment Variables**
   In your Vercel dashboard, add the same environment variables from `.env.local`

### Other Platforms
The app is built with Vite and can be deployed to any static hosting platform:
- Netlify
- GitHub Pages  
- AWS S3 + CloudFront
- Google Cloud Storage

## 🔧 Development

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # ESLint code checking
```

### Environment Setup
The application uses a dual API approach:
- **Development**: Direct API calls using VITE_ prefixed environment variables
- **Production**: Secure Edge Functions with server-side API keys

## 📋 API Integration

### Deepgram Configuration
- **Model**: Australian English (`en-AU`)
- **Sample Rate**: 16kHz
- **Encoding**: Linear PCM
- **Features**: Interim results, punctuation, profanity filtering

### OpenAI Configuration
- **Model**: GPT-4
- **Temperature**: 0.3 (for consistent, professional output)
- **Max Tokens**: 2000
- **Specialized Prompts**: Club-specific meeting minutes formatting

## 🔒 Security Features

- **API Key Protection**: Server-side storage in production
- **Rate Limiting**: 50 req/hour for Deepgram, 20 req/hour for OpenAI
- **Input Sanitization**: HTML and content validation
- **CORS Protection**: Restricted origins in production
- **No Data Persistence**: Client-side only processing

## 🎨 UI/UX Design

### Harmony Club Theme
- **Primary Colors**: Purple gradient (#667eea to #764ba2)
- **Accent Colors**: Teal (#4ecdc4), Success (#51cf66), Error (#ff6b6b)
- **Typography**: Segoe UI for interface, Times New Roman for documents
- **Responsive**: Mobile-first design with touch-friendly controls

### Professional Output
- Official club header and branding
- Structured meeting details table
- Formatted agenda items and decisions
- Action item tracking with assignees
- Signature sections for approval

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or support:
- Check the comprehensive [CLAUDE.md](CLAUDE.md) documentation
- Create an issue on GitHub
- Review the environment setup in `.env.example`

## 🔮 Roadmap

- [ ] Two-stage processing context for better state management
- [ ] Database integration for meeting history
- [ ] Email sharing and member notifications  
- [ ] Enhanced error handling with retry mechanisms
- [ ] Speaker identification and role assignment
- [ ] Mobile app development
- [ ] Integration with club management systems

---

**Built with ❤️ for Lobethal Harmony Club**

*Powered by React, TypeScript, Deepgram, and OpenAI*