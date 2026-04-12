'use client'

import { useState } from 'react'
import type { Chat } from '@/types'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MoreHorizontal, Pin, PinOff, Pencil, Trash2, Check, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CHAT_MODES } from '@/types'
import { cn } from '@/lib/utils'

interface ChatItemProps {
  chat: Chat
  onDelete: (id: string) => void
  onPin: (id: string, pinned: boolean) => void
  onRename: (id: string, title: string) => void
}

export function ChatItem({ chat, onDelete, onPin, onRename }: ChatItemProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isActive = pathname === `/chat/${chat.id}`
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(chat.title)

  const modeIcon = CHAT_MODES[chat.mode]?.icon || '💬'

  const handleRename = () => {
    if (renameValue.trim() && renameValue !== chat.title) {
      onRename(chat.id, renameValue.trim())
    }
    setIsRenaming(false)
  }

  const handleDelete = () => {
    onDelete(chat.id)
    if (isActive) router.push('/chat')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className={cn(
        'group relative flex items-center gap-2 px-2 py-2 rounded-xl cursor-pointer transition-all duration-150',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent/50 text-sidebar-foreground'
      )}
    >
      {isRenaming ? (
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename()
              if (e.key === 'Escape') setIsRenaming(false)
            }}
            className="h-7 text-xs px-2 flex-1"
            autoFocus
          />
          <Button size="icon-sm" variant="ghost" onClick={handleRename} className="h-6 w-6 flex-shrink-0">
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setIsRenaming(false)} className="h-6 w-6 flex-shrink-0">
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <Link href={`/chat/${chat.id}`} className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm flex-shrink-0">{modeIcon}</span>
            <span className="text-xs truncate font-medium">{chat.title}</span>
            {chat.pinned && <Pin className="h-2.5 w-2.5 flex-shrink-0 text-primary" />}
          </Link>

          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPin(chat.id, !chat.pinned)}>
                  {chat.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  {chat.pinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </motion.div>
  )
}

