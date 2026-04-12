'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Chat } from '@/types'
import { toast } from '@/hooks/use-toast'

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchChats = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true)
    try {
      const res = await fetch('/api/chats')
      if (!res.ok) throw new Error('Failed to fetch chats')
      const data = await res.json()
      setChats(data.chats || [])
    } catch {
      toast({ title: 'Error', description: 'Failed to load conversations', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  const createChat = useCallback(async (title?: string, mode?: string): Promise<Chat | null> => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'New Chat', mode: mode || 'normal' }),
      })
      if (!res.ok) throw new Error('Failed to create chat')
      const data = await res.json()
      setChats((prev) => [data.chat, ...prev])
      return data.chat
    } catch {
      toast({ title: 'Error', description: 'Failed to create chat', variant: 'destructive' })
      return null
    }
  }, [])

  const updateChat = useCallback(async (chatId: string, updates: Partial<Chat>) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, ...updates } : c)))
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
    } catch {
      fetchChats() // Revert on error
    }
  }, [fetchChats])

  const deleteChat = useCallback(async (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    try {
      await fetch(`/api/chats/${chatId}`, { method: 'DELETE' })
    } catch {
      fetchChats()
    }
  }, [fetchChats])

  const pinChat = useCallback(
    (chatId: string, pinned: boolean) => updateChat(chatId, { pinned }),
    [updateChat]
  )

  const renameChat = useCallback(
    (chatId: string, title: string) => updateChat(chatId, { title }),
    [updateChat]
  )

  return { chats, isLoading, createChat, updateChat, deleteChat, pinChat, renameChat, refetch: () => fetchChats(true) }
}
