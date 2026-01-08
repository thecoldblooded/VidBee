# VidBee Web

A modern web interface for video downloading built with React, TypeScript, and Supabase.

## Features

- User authentication with email/password
- Add videos to download queue
- Real-time download progress tracking
- Download history with detailed information
- Modern, responsive UI
- Video and audio format selection
- Quality selection options

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and update with your Supabase credentials:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Database Schema

The application uses two main tables:

- `downloads` - Active and queued downloads
- `download_history` - Completed download records

Both tables have Row Level Security enabled to ensure users can only access their own data.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS 4
- Supabase (Auth + Database)
- Lucide React (Icons)
