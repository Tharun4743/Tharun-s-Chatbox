import { createMessage, getChatById, updateChat, getUser, incrementUserUsage } from '@/lib/db'
import { generateChatTitle, calculateCost } from '@/lib/utils'
import { CHAT_MODES } from '@/types'
import { NextRequest } from 'next/server'

import { auth } from '@/auth'

export const runtime = 'nodejs'
export const maxDuration = 60

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(userId)
  if (!limit || now > limit.resetAt) {
    rateLimitMap.delete(userId)
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 })
    return true
  }
  if (limit.count >= 30) return false
  limit.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    if (!checkRateLimit(userId)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { messages, chatId, mode = 'normal', attachmentContext, saveUserMessage = true } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid messages' }), { status: 400 })
    }

    // Start DB lookups and AI request preparation in parallel
    const [modeConfig, user] = await Promise.all([
      Promise.resolve(CHAT_MODES[mode as keyof typeof CHAT_MODES] || CHAT_MODES.normal),
      getUser(userId)
    ])

    let systemContent = modeConfig.systemPrompt
    
    // Enhanced Image Generation Capability (SILENT MODE)
    const randomSeed = Math.floor(Math.random() * 1000000);
    systemContent += `\n\n[IMAGE GENERATION MODE]:
You can generate professional-grade images. 
- DO NOT explain your process. 
- DO NOT mention "Internal Prompt Engine" or "Sanitization" to the user.
- INSTANTLY produce the image using this exact Markdown:
![image](https://pollinations.ai/p/[PROMPT]?width=1024&height=1024&seed=${randomSeed})
Replace [PROMPT] with a descriptive, alphanumeric English prompt. Use %20 for spaces.`

    if (user?.memorySummary && user.memoryEnabled) {
      systemContent += `\n\nUser context from previous conversations: ${user.memorySummary}`
    }
    
    if (attachmentContext) {
      systemContent += `\n\n[CRITICAL] DOCUMENT AWARENESS ENABLED:
The user has uploaded files. You HAVE been provided with the full extracted text below. 
DO NOT claim you cannot read files. Instead, use the following content to answer the user's questions:

--- DOCUMENT CONTEXT START ---
${attachmentContext}
--- DOCUMENT CONTEXT END ---`
    }

    const openRouterMessages = [
      { role: 'system', content: systemContent },
      ...messages.slice(-20).map((m: any) => ({ role: m.role, content: m.content })),
    ]

    const abortController = new AbortController()

    // Start AI fetch and User Message persistence in parallel
    const [groqResponse, savedUserMessage] = await Promise.all([
      fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          messages: openRouterMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 4096,
        }),
        signal: abortController.signal,
      }),
      chatId && saveUserMessage && messages[messages.length - 1]?.role === 'user'
        ? createMessage({ chatId, userId, role: 'user', content: messages[messages.length - 1].content })
        : Promise.resolve(null)
    ])

    const savedUserMessageId = savedUserMessage?.id

    // Background title update (don't await)
    if (chatId && savedUserMessage && !messages.find((m: any) => m.role === 'assistant')) {
      getChatById(chatId, userId).then(chat => {
        if (chat && (chat.title === 'New Chat' || !chat.title)) {
          updateChat(chatId, userId, { title: generateChatTitle(messages[messages.length - 1].content) })
        }
      })
    }

    if (!groqResponse.ok) {
      const errText = await groqResponse.text()
      let errorMessage = 'AI service temporarily unavailable.'
      try {
        const errorData = JSON.parse(errText)
        errorMessage = errorData.error?.message || errorMessage
      } catch (e) {
        console.error('Error parsing Groq error response:', e)
      }
      console.error('Groq error:', groqResponse.status, errText)
      return new Response(JSON.stringify({ error: errorMessage }), { status: groqResponse.status })
    }

    let fullContent = ''
    let totalTokens = 0

    const stream = new ReadableStream({
      async start(controller) {
        const reader = groqResponse.body!.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const lines = decoder.decode(value, { stream: true }).split('\n')
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                const delta = parsed.choices?.[0]?.delta?.content
                if (delta) {
                  fullContent += delta
                  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
                }
                if (parsed.usage) totalTokens = parsed.usage.total_tokens || 0
              } catch {}
            }
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`))
          }
          abortController.abort()
        } finally {
          if (chatId && fullContent) {
            const cost = calculateCost(totalTokens)
            await createMessage({ chatId, userId, role: 'assistant', content: fullContent, model: MODEL, tokensUsed: totalTokens, cost, status: 'complete' })
            await incrementUserUsage(userId, totalTokens)
          }
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, tokens: totalTokens, messageId: savedUserMessageId })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (err: any) {
    if (err.name === 'AbortError') return new Response(JSON.stringify({ error: 'Request cancelled' }), { status: 499 })
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}
