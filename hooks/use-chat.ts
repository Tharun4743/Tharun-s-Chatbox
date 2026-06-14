'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { Message, FileAttachment } from '@/types'
import { toast } from '@/hooks/use-toast'

interface UseChatOptions {
  chatId: string | null
  userId: string
  mode?: string
}

export function useChat({ chatId, userId, mode = 'normal' }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [currentTokens, setCurrentTokens] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<Message[]>([])
  const isStreamingRef = useRef(false)

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { isStreamingRef.current = isStreaming }, [isStreaming])

  const sendMessage = useCallback(
    async (content: string, attachments?: FileAttachment[], saveUserMessage = true) => {
      if (!content.trim() || isStreamingRef.current) return

      let attachmentContext = ''
      if (attachments?.length) {
        attachmentContext = attachments
          .filter((a) => a.extractedText)
          .map((a) => `[File: ${a.name}]\n${a.extractedText}`)
          .join('\n\n')
      }

      let finalContent = content
      if (attachments?.length) {
        const attachmentLinks = attachments
          .map((a) => {
            if (a.mimeType.startsWith('image/')) {
              return `\n\n![${a.name}](${a.url || ''})`
            } else {
              return `\n\n📁 [${a.name}](${a.url || ''})`
            }
          })
          .join('')
        finalContent += attachmentLinks
      }

      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId: chatId || '',
        userId,
        role: 'user',
        content: finalContent,
        model: null,
        tokensUsed: 0,
        cost: 0,
        status: 'complete',
        errorMessage: null,
        edited: false,
        originalContent: null,
        hasAttachments: !!attachments?.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments,
      }

      // Capture BEFORE state update to avoid duplicates
      const previousMessages = messagesRef.current

      setMessages((prev) => [...prev, userMessage])
      setIsThinking(true)
      setStreamingContent('')

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        const messagesToSend = [...previousMessages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messagesToSend, chatId, mode, attachmentContext, saveUserMessage }),
          signal: abortController.signal,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to send message')
        }

        setIsThinking(false)
        setIsStreaming(true)

        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''
        let totalTokens = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const lines = decoder.decode(value, { stream: true }).split('\n')
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulated += parsed.content
                setStreamingContent(accumulated)
              }
              if (parsed.done) {
                setCurrentTokens(parsed.tokens || 0)
                totalTokens = parsed.tokens || 0
              }
              if (parsed.error) throw new Error(parsed.error)
            } catch {
              // skip parse errors
            }
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            chatId: chatId || '',
            userId,
            role: 'assistant',
            content: accumulated,
            model: 'openai/gpt-4o',
            tokensUsed: totalTokens,
            cost: 0,
            status: 'complete',
            errorMessage: null,
            edited: false,
            originalContent: null,
            hasAttachments: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        setStreamingContent('')
      } catch (err: any) {
        setIsThinking(false)
        if (err.name !== 'AbortError') {
          toast({
            title: 'Error',
            description: err.message || 'Something went wrong. Please try again.',
            variant: 'destructive',
          })
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              chatId: chatId || '',
              userId,
              role: 'assistant',
              content: '',
              model: null,
              tokensUsed: 0,
              cost: 0,
              status: 'error',
              errorMessage: err.message,
              edited: false,
              originalContent: null,
              hasAttachments: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ])
        }
      } finally {
        setIsStreaming(false)
        setIsThinking(false)
        abortControllerRef.current = null
      }
    },
    [chatId, userId, mode]
  )

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsStreaming(false)
    setIsThinking(false)
    const current = streamingContent
    if (current) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          chatId: chatId || '',
          userId,
          role: 'assistant',
          content: current + ' _(stopped)_',
          model: 'openai/gpt-4o',
          tokensUsed: 0,
          cost: 0,
          status: 'complete',
          errorMessage: null,
          edited: false,
          originalContent: null,
          hasAttachments: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ])
      setStreamingContent('')
    }
  }, [chatId, userId, streamingContent])

  const regenerateLastResponse = useCallback(async () => {
    const current = messagesRef.current
    const lastUserIdx = [...current].reverse().findIndex((m) => m.role === 'user')
    if (lastUserIdx === -1) return

    const actualIdx = current.length - 1 - lastUserIdx
    const lastUserMsg = current[actualIdx]
    const history = current.slice(0, actualIdx)

    messagesRef.current = history
    setMessages(history)
    await sendMessage(lastUserMsg.content, undefined, false)
  }, [sendMessage])

  const editMessage = useCallback(
    async (messageId: string, newContent: string) => {
      const current = messagesRef.current
      const msgIndex = current.findIndex((m) => m.id === messageId)
      if (msgIndex === -1) return

      const history = current.slice(0, msgIndex)
      messagesRef.current = history
      setMessages(history)
      await sendMessage(newContent, undefined, false)
    },
    [sendMessage]
  )

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId))
  }, [])

  const loadMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs)
  }, [])

  return {
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
  }
}
