'use client'

import { useState, useCallback } from 'react'
import type { FileAttachment } from '@/types'
import { toast } from '@/hooks/use-toast'

export function useFileUpload(chatId?: string) {
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = useCallback(
    async (file: File): Promise<FileAttachment | null> => {
      const tempId = `temp-${Date.now()}`
      const tempAttachment: FileAttachment = {
        id: tempId,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        status: 'processing',
      }

      setAttachments((prev) => [...prev, tempAttachment])
      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)
        if (chatId) formData.append('chatId', chatId)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Upload failed')
        }

        const data = await res.json()
        const attachment: FileAttachment = {
          id: data.id || tempId,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          url: data.url,
          extractedText: data.fullText,
          status: 'ready',
        }

        setAttachments((prev) => prev.map((a) => (a.id === tempId ? attachment : a)))
        return attachment
      } catch (err: any) {
        setAttachments((prev) => prev.filter((a) => a.id !== tempId))
        toast({ title: 'Upload failed', description: err.message, variant: 'destructive' })
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [chatId]
  )

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const clearAttachments = useCallback(() => {
    setAttachments([])
  }, [])

  return { attachments, isUploading, uploadFile, removeAttachment, clearAttachments }
}
