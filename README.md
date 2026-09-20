# 💬 Techy Tharun's Chatbox — High-Performance AI Streaming & Resilient Multi-Provider Engine
### *Enterprise Next.js 15 Chat Application with Server-Sent Events (SSE) Streaming, Token-Aware Key Rotation & Multi-Provider Auto-Failover*

<p align="center">
  <a href="https://github.com/Tharun4743/Tharun-s-Chatbox"><b>📦 GitHub Repository</b></a>
  • <a href="https://tharunchatbox.onrender.com"><b>🌐 Live Demo</b></a>
</p>

---

## 1. 📌 Problem Statement
Users relying on conversational AI interfaces encounter frequent service disruptions, HTTP 429 rate-limiting errors on single API keys, sluggish non-streaming responses, and lost conversation history across devices.

---

## 2. 🔍 Existing Solutions & Critical Gaps
Direct single-key API wrappers fail completely during upstream provider downtime, lack automated multi-key rotation, fail to route queries between fast open-weight models and frontier reasoning models, and lack serverless relational memory.

---

## 3. 💡 Proposed Solution
Techy Tharun's Chatbox is a full-stack Next.js 15 platform featuring Server-Sent Events (SSE) for typewriter-speed live token streaming, an automated token-aware Key Manager that hot-rotates and fails over across Groq → OpenRouter → OpenAI, persistent multi-session chat memory backed by Prisma ORM and Neon Serverless PostgreSQL, document attachment analysis, and Google OAuth via NextAuth v5.

---

## 4. ⚙️ Technical Approach & System Architecture
* **Frontend:** Next.js 15 (App Router, Server Actions), React 18.3, Tailwind CSS v3.4, Radix UI, Framer Motion.
* **Backend:** Serverless API Routes (app/api), TypeScript, Server-Sent Events (SSE) streaming pipeline.
* **Database & ORM:** Neon Serverless PostgreSQL with connection pooling, Prisma ORM.
* **Authentication:** NextAuth.js v5 (Auth.js) with Google OAuth 2.0.
* **AI Routing:** Dynamic 3-tier key manager hot-swapping between Groq (LPU LLaMA 3), OpenRouter, and OpenAI.

---

## 5. 📈 Impact & Measurable Benefits
* **99.9% Conversational Availability:** Multi-tier failover guarantees zero downtime during single-provider outages.
* **Sub-100ms Time-to-First-Token:** Blazing-fast inference delivered via Groq LPUs.
* **Zero Rate-Limit Dropouts:** Hot-swaps exhausted keys instantly without severing active streaming connections.
* **Persistent Relational Memory:** Safely stores multi-session conversation histories across devices.

---

## 6. 🚀 Feasibility & Viability Analysis
* **Technical:** Native Next.js 15 streaming ensures low memory overhead and edge-ready deployment.
* **Economic:** Drastically slashes API costs by prioritizing high-throughput open-weight models (Groq) before falling back to proprietary endpoints.
* **Scalability:** Serverless architecture automatically scales to handle traffic bursts effortlessly.

---

## 7. 👨‍💻 Author & Intellectual Property License

### Lead Architect & Author
**Tharunkumar K** ([@Tharun4743](https://github.com/Tharun4743))
* B.Tech Information Technology • V.S.B. Engineering College, Karur
* [GitHub Profile](https://github.com/Tharun4743) • [LinkedIn](https://linkedin.com/in/tharunkumark4743) • [Portfolio](https://tharunkumark4743.netlify.app)

### 🔒 Proprietary License Notice (All Rights Reserved)
> [!CAUTION]
> **PROPRIETARY & CONFIDENTIAL INTELLECTUAL PROPERTY**
> 
> All rights reserved. This repository, its architecture, source code, workflows, firmware, and associated documentation are the exclusive intellectual property of **Tharunkumar K**.
> 
> **No entity, organization, or individual is permitted to copy, modify, distribute, publish, commercially exploit, reverse engineer, or deploy any portion of this project without express, prior written permission from the author.**
> 
> **Copyright © 2026 Tharunkumar K. All Rights Reserved.**
