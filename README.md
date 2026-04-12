# ChatBox — Premium AI Assistant

A production-ready, full-stack premium AI chatbot built with Next.js 15, powered by GPT-4o via OpenRouter, with Neon PostgreSQL + Prisma.

## ✨ Features

- **Real-time streaming** responses with stop/regenerate
- **Premium UI** — glassmorphism, dark/light mode, smooth animations
- **Conversation history** grouped by date with pinning
- **File uploads** — PDF, DOCX, images with text extraction
- **Voice input** & text-to-speech
- **Markdown rendering** with syntax-highlighted code blocks
- **Multiple AI modes** — Code, Document, Resume, Interview, Study, Productivity
- **Export** conversations as Markdown or PDF
- **Auth** — Google, GitHub, Guest mode
- **Keyboard shortcuts** — ⌘⇧O new chat, ⌘B toggle sidebar
- **Slash commands** — /code, /doc, /resume, /interview, /study
- **PWA** ready
- **Responsive** — desktop, tablet, mobile

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd chatbox
npm install
```

### 2. Set up Neon PostgreSQL (free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the **Connection string** from the dashboard
4. You'll get two URLs — use the same one for both `DATABASE_URL` and `DIRECT_URL`

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-v1-...
DATABASE_URL=postgresql://neondb_owner:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
DIRECT_URL=postgresql://neondb_owner:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_min_32_chars
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Push database schema

```bash
npm run db:push
```

This creates all tables in your Neon database automatically.

### 5. Set up OAuth

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/api/auth/callback/google` as redirect URI

**GitHub:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Add `http://localhost:3000/api/auth/callback/github` as callback URL

### 6. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo to Vercel and add all environment variables in the Vercel dashboard.

**Important:** Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL.

## 🏗️ Architecture

```
chatbox/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (main)/chat/           # Chat pages
│   │   └── [id]/              # Individual chat
│   ├── api/
│   │   ├── chat/              # Streaming AI endpoint
│   │   ├── chats/             # CRUD for conversations
│   │   ├── upload/            # File upload & extraction
│   │   └── user/              # User preferences
│   └── layout.tsx
├── components/
│   ├── auth/                  # Login page
│   ├── chat/                  # Chat UI components
│   ├── layout/                # App shell
│   ├── modals/                # Settings, Export
│   ├── sidebar/               # Navigation sidebar
│   └── ui/                    # shadcn/ui base components
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities, DB, Auth, Prisma
├── prisma/schema.prisma       # Database schema
└── types/index.ts             # TypeScript types
```

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `DIRECT_URL` | Neon direct connection (same as DATABASE_URL) |
| `NEXTAUTH_URL` | Your app URL |
| `NEXTAUTH_SECRET` | Random secret (min 32 chars) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |

## 🗄️ Database Commands

```bash
npm run db:push      # Push schema to database (no migrations)
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:generate  # Regenerate Prisma client
```

## 📱 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘⇧O` | New chat |
| `⌘B` | Toggle sidebar |
| `Enter` | Send message |
| `Shift+Enter` | New line |

## 🤖 AI Model

Uses `openai/gpt-4o` via OpenRouter with:
- Real-time token streaming
- Abort controller support
- Rate limiting (30 req/min)
- Daily usage limits (20 free / 500 pro)

## 📄 License

MIT
