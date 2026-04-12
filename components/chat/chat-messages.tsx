'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { Message } from '@/types'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'
import { StreamingMessage } from './streaming-message'

interface ChatMessagesProps {
  messages: Message[]
  isThinking: boolean
  isStreaming: boolean
  streamingContent: string
  onEdit: (id: string, content: string) => void
  onDelete: (id: string) => void
  onRegenerate: () => void
}

export function ChatMessages({
  messages,
  isThinking,
  isStreaming,
  streamingContent,
  onEdit,
  onDelete,
  onRegenerate,
}: ChatMessagesProps) {
  const lastAssistantIndex = [...messages].reverse().findIndex((m) => m.role === 'assistant')
  const lastAssistantId = lastAssistantIndex !== -1
    ? messages[messages.length - 1 - lastAssistantIndex]?.id
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-1 pb-32 md:pb-6">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            isLastAssistant={message.id === lastAssistantId}
            onEdit={onEdit}
            onDelete={onDelete}
            onRegenerate={onRegenerate}
          />
        ))}
      </AnimatePresence>

      {(isThinking || (isStreaming && !streamingContent)) && <TypingIndicator />}

      {isStreaming && streamingContent && (
        <StreamingMessage content={streamingContent} />
      )}
    </div>
  )
}
