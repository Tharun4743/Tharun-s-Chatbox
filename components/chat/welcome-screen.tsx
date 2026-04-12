'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getWarmGreeting, PROMPT_SUGGESTIONS } from '@/lib/utils'
import { CHAT_MODES } from '@/types'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ChatInput } from './chat-input'
import type { FileAttachment } from '@/types'
import { toast } from '@/hooks/use-toast'

interface WelcomeScreenProps {
  user?: any
}

export function WelcomeScreen({ user }: WelcomeScreenProps) {
  const router = useRouter()
  const [greeting, setGreeting] = useState('')
  
  useEffect(() => {
    setGreeting(getWarmGreeting(user?.name))
  }, [user?.name])


  const handleSend = async (content: string, attachments?: FileAttachment[]) => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: content.slice(0, 50) }),
      })
      if (!res.ok) throw new Error('Failed to create chat')
      const data = await res.json()
      if (data.chat) {
        router.push(`/chat/${data.chat.id}?message=${encodeURIComponent(content)}`)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to start chat. Please try again.', variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32 md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl w-full"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex justify-center mb-6"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/25">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </motion.div>

          {/* Greeting */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold mb-2 flex flex-col sm:flex-row items-center justify-center gap-2"
          >
            {greeting}
            <span className="animate-bounce-slow text-3xl sm:text-inherit">👋</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mb-8"
          >
            I'm your AI assistant. Ask me anything, or pick a mode below.
          </motion.p>

          {/* Mode cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8"
          >
            {Object.entries(CHAT_MODES).slice(0, 4).map(([key, mode]) => (
              <button
                key={key}
                suppressHydrationWarning
                className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/chats', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: `${mode.label} Chat`, mode: key }),
                    })
                    if (!res.ok) throw new Error('Failed to create chat')
                    const data = await res.json()
                    if (data.chat) router.push(`/chat/${data.chat.id}`)
                  } catch {
                    toast({ title: 'Error', description: 'Failed to start chat. Please try again.', variant: 'destructive' })
                  }
                }}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{mode.icon}</span>
                <span className="text-xs font-medium">{mode.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Suggestion chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex sm:flex-wrap items-center justify-start sm:justify-center gap-2 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {PROMPT_SUGGESTIONS.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion.text}
                suppressHydrationWarning
                className="flex flex-shrink-0 items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-muted/40 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-all duration-200 border border-border/30 hover:border-border whitespace-nowrap"
                onClick={() => handleSend(suggestion.text)}
              >
                <span className="text-base">{suggestion.icon}</span>
                <span>{suggestion.text}</span>
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <ChatInput
        onSend={handleSend}
        onStop={() => {}}
        isStreaming={false}
        isThinking={false}
        chatId=""
        mode="normal"
      />
    </div>
  )
}
