# 💬 Techy Tharun's Chatbox
### *High-Performance, Intelligent AI Chat Application*

<p align="center">
  <img src="public/logo.png" alt="Techy Tharun's Chatbox Logo" width="220" style="border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); margin-bottom: 20px;" />
</p>

<p align="center">
  <a href="https://tharunchatbox.onrender.com" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Techy_Tharun's_Chatbox-6366f1?style=for-the-badge&logo=render&logoColor=white" alt="Live Demo" />
  </a>
</p>

> [!NOTE]
> **Live Demo Cold Start:** Since the demo is hosted on Render's free tier, the initial page load may experience a delay of 50–90 seconds while the web service spins up. Subsequent navigation and API requests will be instantaneous.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.0-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
</p>

---

## 🌟 Overview
**Techy Tharun's Chatbox** is a premium, highly responsive AI conversation platform designed to bring multi-model intelligence directly to users. It integrates robust conversational memory, seamless fallback mechanisms across major LLM providers (Groq, OpenRouter, OpenAI), and a beautiful, modern user interface.

Built as a secure, full-stack Next.js application, it utilizes Server-Sent Events (SSE) for fluid response streaming and a secure Postgres database to keep conversation histories safely stored.

---

## 🚀 Key Features

### 🧠 Intelligent Conversational Core
* **⚡ Live Streaming Responses:** Employs Server-Sent Events (SSE) to deliver instant, typewriter-style text generation (mirroring ChatGPT and Gemini).
* **🔄 Multi-Provider Fallback Logic:** A custom token-aware Key Manager that automatically load-balances API keys and instantly rotates across Groq, OpenRouter, and OpenAI to prevent rate limits.
* **🎭 Context-Aware Chat Modes:** Quickly toggle between customized AI Personas (e.g., Code Assistant, Document Analyzer, Resume Reviewer).

### 📁 Advanced User Interactions
* **💬 Persistent Chat Memory:** Saves all chat sessions in real-time to a PostgreSQL database, enabling flawless retrieval of previous conversations.
* **📝 Markdown & Code Rendering:** Beautiful syntax-highlighted code blocks, tables, and rich-text parsing.
* **📎 Intelligent File Context:** Upload documents directly into the chat stream for the AI to analyze and reference in its responses.

### 🛡️ Security & Account Management
* **🔐 Google OAuth Integration:** Secure, one-click sign-in powered by NextAuth (Auth.js) v5.
* **⚙️ Appearance Controls:** Full system-aware Light and Dark mode toggles with a sleek, glassmorphic UI.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, React 18, Tailwind CSS, Radix UI, Framer Motion, Lucide | Highly responsive, Server-Side Rendered (SSR) components with smooth micro-animations. |
| **Backend** | Next.js API Routes (`app/api`), TypeScript | Serverless-ready REST APIs capable of handling persistent streaming connections. |
| **Database** | PostgreSQL (Neon DB), Prisma ORM | Relational database schema holding all user data, sessions, and chat interactions. |
| **Authentication**| NextAuth.js v5 (Auth.js) | Advanced OAuth and session token verification protocols. |
| **AI Integration** | Groq, OpenRouter, OpenAI APIs | Blazing fast inference bridging multiple open-weight and proprietary models. |

---

## 📐 System Architecture

The application's architecture heavily utilizes Next.js Server Components and Serverless APIs.

```mermaid
graph TD
    Client[Next.js Client Components] -->|SSE Stream / POST| API[Next.js API Routes]
    API -->|Prisma Queries| DB[(Neon PostgreSQL DB)]
    API -->|Load Balanced Fetch| KeyManager[Key & Token Manager]
    KeyManager -->|Primary API| Groq[Groq Inference]
    KeyManager -->|Fallback API| OpenRouter[OpenRouter AI]
    KeyManager -->|Ultimate Fallback| OpenAI[OpenAI API]
    Client -->|NextAuth OAuth| Google[Google Identity Provider]
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory based on the following configurations:

```env
# ==========================================
# Database / Prisma (REQUIRED)
# ==========================================
DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
DIRECT_URL="postgresql://user:password@hostname/dbname?sslmode=require"

# ==========================================
# NextAuth / Security Configurations
# ==========================================
AUTH_SECRET="your-secure-random-auth-secret"
NEXTAUTH_SECRET="your-secure-random-nextauth-secret"
AUTH_TRUST_HOST="true"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ==========================================
# Google Single Sign-On (OAuth 2.0)
# ==========================================
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ==========================================
# AI Provider API Keys
# ==========================================
# Note: You can supply comma-separated keys for automatic load balancing.
GROQ_API_KEYS="your-groq-key-1,your-groq-key-2"
OPENROUTER_API_KEYS="your-openrouter-key"
OPENAI_API_KEYS="your-openai-key"

# ==========================================
# Application Metadata
# ==========================================
NEXT_PUBLIC_APP_NAME="Techy Tharun's Chatbox"
NEXT_PUBLIC_CHAT_API_URL="/api/chat"
NEXT_PUBLIC_CHAT_HISTORY_API_URL="/api/chats"
```

---

## 💻 Local Installation & Setup

### Prerequisites
* **Node.js** (v20.0.0 or higher)
* An active **PostgreSQL** database (e.g., Neon serverless)

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Initialization
Generate the Prisma client and push the schema to your remote database:
```bash
npx prisma generate
npx prisma db push
```

### 3. Spin Up Development Server
```bash
npm run dev
```
* Application will be live at: `http://localhost:3000`

### 4. Build for Production
To bundle the Next.js application assets:
```bash
npm run build
npm run start
```

---

## ☁️ Production Deployment on Render

This project is fully optimized and ready for zero-config deployments on **Render** using the provided `render.yaml` configuration file:

1. **Connect Repo**: Create a new **Blueprint** or **Web Service** on Render pointing to your GitHub fork of the project.
2. **Build Settings** (Handled automatically by Blueprint):
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npx prisma generate && npx prisma db push --accept-data-loss && npm run build`
   * **Start Command**: `npm run start`
3. **Configure Envs**: Input credentials (Database URL, Google Client ID, Groq API Keys, etc.) directly into the Render Environment panel.
4. **SSO Whitelisting**: Ensure your Render live domain (e.g. `https://tharunchatbox.onrender.com`) is whitelisted under **Authorized JavaScript origins** and **Authorized redirect URIs** in your Google Cloud Developer Console.
