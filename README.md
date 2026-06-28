# Techy Tharun's Chatbox

A modern, high-performance, and feature-rich AI chat application built with Next.js 15, React 18, and Tailwind CSS. The app features robust conversational memory, intelligent API key rotation, load balancing across multiple LLM providers (Groq, OpenRouter, OpenAI), and seamless deployment integration with Render.

## Features

- **Multi-Provider Fallback**: Seamlessly switches between Groq, OpenRouter, and OpenAI keys when limits are reached or services are down.
- **Smart Key Manager**: Load-balances requests across comma-separated keys stored in your `.env` to prevent rate limiting (HTTP 429 errors).
- **Persistent Memory**: Saves all conversations and messages to a secure PostgreSQL database using Prisma ORM.
- **Streaming UI**: Uses Server-Sent Events (SSE) to stream AI responses dynamically just like ChatGPT/Gemini.
- **Chat Modes**: Includes different context-aware modes (Code Assistant, Resume Reviewer, Document Analyzer, etc.) via pre-configured system prompts.
- **Responsive & Premium Design**: Implemented with Radix UI, Framer Motion, and Tailwind CSS for a beautiful user experience with Dark/Light mode support.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Neon Serverless) / Prisma ORM
- **Authentication**: NextAuth.js (Auth.js) v5
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **Components**: Radix UI
- **Deployment**: Configured for immediate deployment on Render (`render.yaml` included).

## Deployment (Render)

This project is pre-configured for automated deployment on [Render](https://render.com/). It uses a `render.yaml` blueprint to define the environment.

1. Connect your GitHub repository to Render.
2. Select **Blueprint** and use the provided `render.yaml`.
3. Provide the required Environment Variables (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_SECRET`, `GROQ_API_KEYS`, etc.).
4. The blueprint handles the build step (`npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build`) and starts the server automatically.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
