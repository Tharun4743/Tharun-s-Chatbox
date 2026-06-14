'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Message } from '@/types'
import { formatMessageTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownRenderer } from './markdown-renderer'
import { Copy, Check, Pencil, Trash2, RefreshCw, Volume2, AlertCircle, Sparkle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface MessageBubbleProps {
  message: Message
  isLastAssistant: boolean
  onEdit: (id: string, content: string) => void
  onDelete: (id: string) => void
  onRegenerate: () => void
}

export function MessageBubble({ message, isLastAssistant, onEdit, onDelete, onRegenerate }: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(message.content)
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const isUser = message.role === 'user'
  const isError = message.status === 'error'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ description: 'Copied to clipboard' })
  }

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(message.content)
    speechSynthesis.speak(utterance)
  }

  const handleEdit = () => {
    if (editValue.trim() && editValue.trim() !== message.content) {
      onEdit(message.id, editValue.trim())
    }
    setIsEditing(false)
  }

  if (isError) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 py-2">
        <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
          <AlertCircle className="h-4 w-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3">
            <p className="text-sm text-destructive">{message.errorMessage || 'Something went wrong. Please try again.'}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onRegenerate} className="mt-1 h-7 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 mr-1" />
            Try again
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('group flex gap-3 py-2', isUser && 'flex-row-reverse')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isUser && (
        <div className="h-10 w-10 rounded-2xl bg-foreground text-background flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-foreground/5 rotate-3 hover:rotate-0 transition-transform duration-500">
          <Sparkle className="h-5 w-5" />
        </div>
      )}

      <div className={cn('flex-1 min-w-0 max-w-[85%]', isUser && 'flex flex-col items-end')}>
        {isEditing ? (
          <div className="w-full space-y-2">
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[80px] text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit() }
                if (e.key === 'Escape') setIsEditing(false)
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEdit} className="h-7 text-xs">Save & Submit</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-7 text-xs">Cancel</Button>
            </div>
          </div>
        ) : (
          <div className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted/50 text-foreground rounded-tl-sm'
          )}>
            <MarkdownRenderer
              content={message.content}
              className={cn(isUser && 'text-primary-foreground prose-user')}
            />
          </div>

        <div className={cn('flex items-center gap-2 mt-1 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}>
          {/* Use a simple span for time to avoid hydration mismatch by ensuring it's stable during initial render */}
          <span className="text-xs text-muted-foreground/60" suppressHydrationWarning>
            {formatMessageTime(message.createdAt)}
          </span>
          {message.edited && <span className="text-xs text-muted-foreground/50 italic">edited</span>}
        </div>

        {!isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showActions ? 1 : 0 }}
            className={cn('flex items-center gap-0.5 mt-1 px-1', isUser ? 'flex-row-reverse' : 'flex-row')}
          >
            <Button variant="ghost" size="icon-sm" onClick={handleCopy} className="h-6 w-6 text-muted-foreground hover:text-foreground">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>

            {!isUser && (
              <Button variant="ghost" size="icon-sm" onClick={handleSpeak} className="h-6 w-6 text-muted-foreground hover:text-foreground">
                <Volume2 className="h-3 w-3" />
              </Button>
            )}

            {isUser && (
              <Button variant="ghost" size="icon-sm" onClick={() => setIsEditing(true)} className="h-6 w-6 text-muted-foreground hover:text-foreground">
                <Pencil className="h-3 w-3" />
              </Button>
            )}

            {!isUser && isLastAssistant && (
              <Button variant="ghost" size="icon-sm" onClick={onRegenerate} className="h-6 w-6 text-muted-foreground hover:text-foreground">
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}

            <Button variant="ghost" size="icon-sm" onClick={() => onDelete(message.id)} className="h-6 w-6 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
