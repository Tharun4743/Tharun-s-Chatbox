'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Chat } from '@/types'
import { CHAT_MODES } from '@/types'
import { formatTokenCount } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Zap, Trash2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ExportModal } from '@/components/modals/export-modal'

interface ChatHeaderProps {
  chat: Chat
  tokensUsed?: number
}

export function ChatHeader({ chat, tokensUsed = 0 }: ChatHeaderProps) {
  const router = useRouter()
  const [exportOpen, setExportOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const modeConfig = CHAT_MODES[chat.mode] || CHAT_MODES.normal

  const handleDelete = async () => {
    if (isDeleting) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/chats/${chat.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete chat')
      router.push('/chat')
      router.refresh()
    } catch {
      toast({ description: 'Failed to delete chat', variant: 'destructive' })
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 glass sticky top-0 z-10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-lg">{modeConfig.icon}</span>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold truncate">{chat.title}</h1>
            <p className="text-xs text-muted-foreground">{modeConfig.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tokensUsed > 0 && (
            <Badge variant="secondary" className="text-xs gap-1 hidden sm:flex">
              <Zap className="h-3 w-3" />
              {formatTokenCount(tokensUsed)} tokens
            </Badge>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setExportOpen(true)}>
                Export conversation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete chat'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} chat={chat} />
    </>
  )
}
