'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getWarmGreeting } from '@/lib/utils'
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3 font-serif">
              {greeting}
              <span className="animate-bounce-slow text-4xl sm:text-inherit">👋</span>
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground mt-3 font-medium tracking-wide">
              Welcome to Techy Tharun's Chatbox
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground/50 max-w-md mx-auto mb-12 text-xs md:text-sm font-semibold tracking-widest uppercase italic"
          >
            Simply Secure • Simply Techy Tharun
          </motion.p>
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
