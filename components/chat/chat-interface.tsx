'use client'

import { useEffect, useState } from 'react'
import type { Chat, Message } from '@/types'
import { useChat } from '@/hooks/use-chat'
import { ChatMessages } from './chat-messages'
import { ChatInput } from './chat-input'
import { ChatHeader } from './chat-header'
import { useAutoScroll } from '@/hooks/use-auto-scroll'

interface ChatInterfaceProps {
  initialChat: Chat
  initialMessages: Message[]
  userId: string
  initialMessage?: string
}

export function ChatInterface({ initialChat, initialMessages, userId, initialMessage }: ChatInterfaceProps) {
  const [mode, setMode] = useState(initialChat.mode)
  const {
    messages,
    isStreaming,
    isThinking,
    streamingContent,
    currentTokens,
    sendMessage,
    stopStreaming,
    regenerateLastResponse,
    editMessage,
    deleteMessage,
    loadMessages,
  } = useChat({
    chatId: initialChat.id,
    userId,
    mode,
  })

  const { bottomRef, containerRef } = useAutoScroll(
    [messages, streamingContent],
    true
  )

  useEffect(() => {
    loadMessages(initialMessages)
    if (initialMessage) {
      sendMessage(initialMessage)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialChat.id])

  return (
    <div className="flex flex-col h-full">
      <ChatHeader chat={initialChat} tokensUsed={currentTokens} />

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <ChatMessages
          messages={messages}
          isThinking={isThinking}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onEdit={editMessage}
          onDelete={deleteMessage}
          onRegenerate={regenerateLastResponse}
        />
        <div ref={bottomRef} className="h-4" />
      </div>

      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        onModeChange={setMode}
        isStreaming={isStreaming}
        isThinking={isThinking}
        chatId={initialChat.id}
        mode={mode}
      />
    </div>
  )
}
