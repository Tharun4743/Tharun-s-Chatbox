'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ChatMode, FileAttachment } from '@/types'
import { SLASH_COMMANDS } from '@/lib/utils'
import { useFileUpload } from '@/hooks/use-file-upload'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Send, Square, Paperclip, Mic, MicOff, X,
} from 'lucide-react'
import { cn, formatFileSize, getFileIcon } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

interface ChatInputProps {
  onSend: (content: string, attachments?: FileAttachment[]) => void
  onStop: () => void
  onModeChange?: (mode: ChatMode) => void
  isStreaming: boolean
  isThinking: boolean
  chatId: string
  mode: ChatMode
}

export function ChatInput({ onSend, onStop, onModeChange, isStreaming, isThinking, chatId, mode }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashFilter, setSlashFilter] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  const { attachments, isUploading, uploadFile, removeAttachment, clearAttachments } = useFileUpload(chatId)

  const isDisabled = isStreaming || isThinking || isUploading

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }, [input])

  // Slash command detection
  useEffect(() => {
    if (input.startsWith('/')) {
      const query = input.slice(1).toLowerCase()
      setSlashFilter(query)
      setShowSlashMenu(true)
    } else {
      setShowSlashMenu(false)
    }
  }, [input])

  const handleSend = useCallback(() => {
    if (!input.trim() || isDisabled) return
    onSend(input.trim(), attachments.length > 0 ? attachments : undefined)
    setInput('')
    clearAttachments()
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [input, isDisabled, attachments, onSend, clearAttachments])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (showSlashMenu) return
      handleSend()
    }
    if (e.key === 'Escape') setShowSlashMenu(false)
  }

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      await uploadFile(file)
    }
  }, [uploadFile])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      await handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({ description: 'Voice input not supported in this browser', variant: 'destructive' })
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('')
      setInput(transcript)
    }

    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const filteredCommands = SLASH_COMMANDS.filter(
    (cmd) => !slashFilter || cmd.command.slice(1).includes(slashFilter) || cmd.description.toLowerCase().includes(slashFilter)
  )

  return (
    <div className="sticky bottom-0 z-20 pb-20 md:pb-6 px-4 bg-gradient-to-t from-background via-background to-transparent pt-4">
      <div className="max-w-3xl mx-auto">
        {/* Slash command menu */}
        <AnimatePresence>
          {showSlashMenu && filteredCommands.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mb-2 glass rounded-2xl border border-border/50 shadow-xl overflow-hidden"
            >
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.command}
                  suppressHydrationWarning
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent/50 transition-colors text-left"
                  onClick={() => {
                    if (cmd.command === '/clear') {
                      setInput('')
                      setShowSlashMenu(false)
                      return
                    }
                    if (cmd.mode && onModeChange) {
                      onModeChange(cmd.mode as ChatMode)
                      toast({ description: `Switched to ${cmd.description}` })
                    }
                    setInput('')
                    setShowSlashMenu(false)
                  }}
                >
                  <span className="text-base">{cmd.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{cmd.command}</p>
                    <p className="text-xs text-muted-foreground">{cmd.description}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachments preview */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex flex-wrap gap-2"
            >
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2 text-xs"
                >
                  <span>{getFileIcon(attachment.mimeType)}</span>
                  <span className="max-w-[120px] truncate font-medium">{attachment.name}</span>
                  <span className="text-muted-foreground">{formatFileSize(attachment.size)}</span>
                  {attachment.status === 'processing' && (
                    <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  )}
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    suppressHydrationWarning
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main input area */}
        <div
          className={cn(
            'relative glass rounded-2xl border border-border/50 shadow-lg transition-all duration-200',
            isDragging && 'border-primary/50 bg-primary/5',
            isListening && 'border-red-400/50'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-primary/5 z-10">
              <p className="text-sm font-medium text-primary">Drop files here</p>
            </div>
          )}

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? '🎤 Listening...' : "Message Techy Tharun's Chatbox... (/ for commands)"}
            className="min-h-[52px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3.5 pr-32 text-sm placeholder:text-muted-foreground/60"
            disabled={isDisabled && !isStreaming}
          />

          {/* Action buttons */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.md,.csv"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleVoiceInput}
              className={cn(
                'h-8 w-8',
                isListening
                  ? 'text-red-500 hover:text-red-600 animate-pulse-soft'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            {isStreaming || isThinking ? (
              <Button
                size="icon-sm"
                onClick={onStop}
                className="h-8 w-8 bg-foreground text-background hover:bg-foreground/90 rounded-xl"
              >
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                size="icon-sm"
                onClick={handleSend}
                disabled={!input.trim() || isUploading}
                className={cn(
                  'h-8 w-8 rounded-xl transition-all duration-200',
                  input.trim()
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-2">
          Techy Tharun's Chatbox can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  )
}
