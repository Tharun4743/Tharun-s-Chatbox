// ================================================================
// KEY MANAGER — Token-based auto rotation across providers
// ================================================================
// Each API key has a daily token budget. When a key approaches
// its limit, the next available key is used automatically.
// Falls back across providers: Groq → OpenRouter → OpenAI
// ================================================================

type KeyState = {
  key: string
  tokensUsed: number
  dailyLimit: number
  rateLimitedUntil: number
  resetAt: number // midnight reset
}

type Provider = {
  name: string
  url: string
  models: string[]
  keys: KeyState[]
  headers?: Record<string, string>
}

// Daily token limits per key (conservative — actual limits are higher)
const DAILY_TOKEN_LIMITS: Record<string, number> = {
  groq: 500_000,       // Groq free: ~500k tokens/day per key
  openrouter: 200_000, // OpenRouter free tier
  openai: 100_000,     // OpenAI pay-as-you-go safety cap
}

function loadKeys(envVar: string, provider: string): KeyState[] {
  // Support both GROQ_API_KEY (single) and GROQ_API_KEYS (comma-separated)
  const singularVar = envVar.replace(/_KEYS$/, '_KEY')
  const combined = [
    ...(process.env[envVar] || '').split(','),
    ...(process.env[singularVar] || '').split(','),
  ]
  const raw = combined.map(k => k.trim()).filter(Boolean)
  const unique = [...new Set(raw)]
  const limit = DAILY_TOKEN_LIMITS[provider] ?? 100_000
  return unique.map(key => ({
    key,
    tokensUsed: 0,
    dailyLimit: limit,
    rateLimitedUntil: 0,
    resetAt: nextMidnight(),
  }))
}

function nextMidnight(): number {
  const d = new Date()
  d.setHours(24, 0, 0, 0)
  return d.getTime()
}

// In-memory provider state (persists across requests in same process)
const PROVIDERS: Provider[] = [
  {
    name: 'groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    models: ['llama-3.3-70b-versatile', 'llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    keys: loadKeys('GROQ_API_KEYS', 'groq'),
  },
  {
    name: 'openrouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    models: ['meta-llama/llama-3.3-70b-instruct', 'openai/gpt-4o-mini', 'anthropic/claude-3-haiku'],
    keys: loadKeys('OPENROUTER_API_KEYS', 'openrouter'),
    headers: { 'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000' },
  },
  {
    name: 'openai',
    url: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4o-mini', 'gpt-3.5-turbo'],
    keys: loadKeys('OPENAI_API_KEYS', 'openai'),
  },
]

function resetIfNeeded(state: KeyState) {
  if (Date.now() > state.resetAt) {
    state.tokensUsed = 0
    state.rateLimitedUntil = 0
    state.resetAt = nextMidnight()
  }
}

function getAvailableKey(provider: Provider): KeyState | null {
  const now = Date.now()
  for (const state of provider.keys) {
    resetIfNeeded(state)
    const isRateLimited = now < state.rateLimitedUntil
    const isOverLimit = state.tokensUsed >= state.dailyLimit * 0.95 // swap at 95% usage
    if (!isRateLimited && !isOverLimit) return state
  }
  return null
}

export function recordTokenUsage(providerName: string, keyValue: string, tokens: number) {
  const provider = PROVIDERS.find(p => p.name === providerName)
  if (!provider) return
  const state = provider.keys.find(k => k.key === keyValue)
  if (!state) return
  state.tokensUsed += tokens
}

export function markKeyRateLimited(providerName: string, keyValue: string, retryAfterMs = 60_000) {
  const provider = PROVIDERS.find(p => p.name === providerName)
  if (!provider) return
  const state = provider.keys.find(k => k.key === keyValue)
  if (!state) return
  state.rateLimitedUntil = Date.now() + retryAfterMs
}

export function getKeyStats(): Record<string, { key: string; tokensUsed: number; dailyLimit: number; available: boolean }[]> {
  const stats: Record<string, any[]> = {}
  for (const provider of PROVIDERS) {
    stats[provider.name] = provider.keys.map(s => ({
      key: `${s.key.slice(0, 8)}...`,
      tokensUsed: s.tokensUsed,
      dailyLimit: s.dailyLimit,
      available: Date.now() > s.rateLimitedUntil && s.tokensUsed < s.dailyLimit * 0.95,
    }))
  }
  return stats
}

export type FetchResult = {
  response: Response
  model: string
  providerName: string
  keyValue: string
}

export async function fetchWithFallback(
  messages: any[],
  signal: AbortSignal
): Promise<FetchResult | null> {
  for (const provider of PROVIDERS) {
    for (const model of provider.models) {
      const keyState = getAvailableKey(provider)
      if (!keyState) {
        console.warn(`[KeyManager] All keys exhausted for: ${provider.name}`)
        break // try next provider
      }

      const res = await fetch(provider.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${keyState.key}`,
          'Content-Type': 'application/json',
          ...provider.headers,
        },
        body: JSON.stringify({ model, messages, stream: true, temperature: 0.7, max_tokens: 4096 }),
        signal,
      })

      if (res.ok) {
        console.log(`[KeyManager] ✓ ${provider.name}/${model} | tokens used: ${keyState.tokensUsed}/${keyState.dailyLimit}`)
        return { response: res, model, providerName: provider.name, keyValue: keyState.key }
      }

      if (res.status === 429 || res.status === 503 || res.status === 529) {
        const retryAfter = parseInt(res.headers.get('retry-after') || '60') * 1000
        markKeyRateLimited(provider.name, keyState.key, retryAfter)
        console.warn(`[KeyManager] Rate limited: ${provider.name}/${model}. Retry after ${retryAfter / 1000}s`)
        continue
      }

      console.warn(`[KeyManager] Hard error ${res.status} on ${provider.name}/${model}. Skipping model.`)
    }
  }
  return null
}
