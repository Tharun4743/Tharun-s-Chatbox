import { createMessage, getChatById, updateChat, getUser, incrementUserUsage } from '@/lib/db'
import { generateChatTitle, calculateCost } from '@/lib/utils'
import { CHAT_MODES } from '@/types'
import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { fetchWithFallback, recordTokenUsage } from '@/lib/key-manager'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'
export const maxDuration = 60

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
    
    // High-Resolution Image Generation (Stable Descriptive Mode)
    const randomSeed = Math.floor(Math.random() * 1000000);
    systemContent += `\n\n[IMAGE GENERATION MODE]:
You can generate high-quality images.
- DO NOT use words like "generate", "image", "drawing" or "create" INSIDE the brackets of the prompt URL.
- Use only descriptive, comma-separated keywords for the [PROMPT].
- FORMAT: ![image](https://image.pollinations.ai/prompt/[PROMPT]?width=1024&height=1024&nologo=true&seed=${randomSeed})
Example for "generate bird image":
![image](https://image.pollinations.ai/prompt/majestic%20tropical%20parrot%20on%20branch%20vibrant%20colors%204k?width=1024&height=1024&nologo=true&seed=${randomSeed})`

    if (user?.memorySummary && user.memoryEnabled) {
      systemContent += `\n\nUser context from previous conversations: ${user.memorySummary}`
    }
    
    if (attachmentContext) {
      systemContent += `\n\n[HIGH-PRIORITY DOCUMENT CONTEXT]:
The user has provided the following file content. You MUST use this to answer their questions.
---
${attachmentContext}
---
DO NOT claim you cannot read files. The content is provided above.`
    }

    const formatMessageContent = async (content: string) => {
      // Regex to match markdown images with base64 data URLs OR /api/upload?id=...
      const regex = /!\[(.*?)\]\((data:image\/[a-zA-Z+-]+;base64,[a-zA-Z0-9+/=]+|(\/api\/upload\?id=([^)]+)))\)/g
      
      let match
      const parts: any[] = []
      let lastIndex = 0
      
      while ((match = regex.exec(content)) !== null) {
        const textBefore = content.substring(lastIndex, match.index).trim()
        if (textBefore) {
          parts.push({ type: 'text', text: textBefore })
        }
        
        let imageUrl = match[2]
        const fileId = match[4]
        
        if (fileId) {
          try {
            const record = await prisma.fileUpload.findUnique({
              where: { id: fileId }
            })
            if (record && record.url) {
              imageUrl = record.url
            }
          } catch (err) {
            console.error('Error fetching image for chat:', err)
          }
        }
        
        parts.push({
          type: 'image_url',
          image_url: {
            url: imageUrl,
          },
        })
        lastIndex = regex.lastIndex
      }
      
      const textAfter = content.substring(lastIndex).trim()
      if (textAfter) {
        parts.push({ type: 'text', text: textAfter })
      }
      
      return parts.length > 0 ? parts : content
    }

    const openRouterMessages = [
      { role: 'system', content: systemContent },
      ...await Promise.all(messages.slice(-20).map(async (m: any) => ({
        role: m.role,
        content: m.role === 'user' ? await formatMessageContent(m.content) : m.content
      }))),
    ]

    const abortController = new AbortController()

    // Persist user message
    let savedUserMessage: any = null
    if (chatId && saveUserMessage && messages[messages.length - 1]?.role === 'user') {
      savedUserMessage = await createMessage({ chatId, userId, role: 'user', content: messages[messages.length - 1].content })
    }

    // Multi-provider fallback fetch with token-based key rotation
    const result = await fetchWithFallback(openRouterMessages, abortController.signal)

    if (!result) {
      return new Response(JSON.stringify({ error: 'All AI providers are currently unavailable. Please try again shortly.' }), { status: 503 })
    }

    const { response: groqResponse, model: usedModel, providerName, keyValue } = result

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
            // Record token usage against the key that was used — triggers auto-swap next request if near limit
            recordTokenUsage(providerName, keyValue, totalTokens)
            await createMessage({ chatId, userId, role: 'assistant', content: fullContent, model: usedModel, tokensUsed: totalTokens, cost, status: 'complete' })
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
