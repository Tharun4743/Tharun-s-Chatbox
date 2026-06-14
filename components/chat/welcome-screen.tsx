'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getWarmGreeting, PROMPT_SUGGESTIONS } from '@/lib/utils'
import { CHAT_MODES } from '@/types'
import { Button } from '@/components/ui/button'
import { Sparkle, ArrowRight } from 'lucide-react'
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:pb-0">
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
            className="flex justify-center mb-8"
          >
            <div className="h-16 w-16 rounded-full overflow-hidden border border-border shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 bg-background flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
            </div>
          </motion.div>

          {/* Greeting */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-5xl font-serif tracking-tight mb-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-foreground"
          >
            {greeting}
            <span className="animate-bounce-slow text-4xl sm:text-inherit">👋</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground/60 max-w-md mx-auto mb-12 text-base md:text-lg font-medium italic"
          >
            "Simply secure • Simply Techy Tharun"
          </motion.p>

          {/* Mode cards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12"
          >
            {Object.entries(CHAT_MODES).slice(0, 4).map(([key, mode]) => (
              <button
                key={key}
                suppressHydrationWarning
                className="flex flex-col items-center gap-3 p-5 rounded-[2rem] bg-secondary/30 border border-transparent hover:border-primary/20 hover:bg-secondary/50 transition-all duration-300 group"
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
                <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-2xl group-hover:scale-110 transition-transform">{mode.icon}</span>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{mode.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Suggestion chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex sm:flex-wrap items-center justify-start sm:justify-center gap-3 overflow-x-auto sm:overflow-x-visible pb-4 sm:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
          >
            {PROMPT_SUGGESTIONS.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion.text}
                suppressHydrationWarning
                className="flex flex-shrink-0 items-center gap-2 px-6 py-3 rounded-full bg-background hover:bg-secondary border border-border/40 hover:border-primary/20 text-xs font-semibold text-muted-foreground hover:text-primary transition-all duration-300 shadow-sm"
                onClick={() => handleSend(suggestion.text)}
              >
                <span>{suggestion.text}</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
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
