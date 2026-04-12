'use client'

import { useState, useMemo } from 'react'
import type { Chat } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, PanelLeftClose, PanelLeft, Sparkle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatItem } from './chat-item'
import { UserMenu } from './user-menu'
import { groupChatsByDate, cn } from '@/lib/utils'

interface SidebarProps {
  chats: Chat[]
  isLoading: boolean
  collapsed: boolean
  onCollapse: () => void
  onNewChat: () => void
  onUpdateChat: (id: string, updates: Partial<Chat>) => void
  onDeleteChat: (id: string) => void
  onPinChat: (id: string, pinned: boolean) => void
  onRenameChat: (id: string, title: string) => void
  className?: string
}

export function Sidebar({
  chats,
  isLoading,
  collapsed,
  onCollapse,
  onNewChat,
  onUpdateChat,
  onDeleteChat,
  onPinChat,
  onRenameChat,
  className,
}: SidebarProps) {
  const [search, setSearch] = useState('')

  const filteredChats = useMemo(() => {
    if (!search.trim()) return chats
    return chats.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
  }, [chats, search])

  const chatGroups = useMemo(() => groupChatsByDate(filteredChats), [filteredChats])

  if (collapsed) {
    return (
      <div className={cn('flex flex-col items-center py-4 gap-2 border-r border-border/50 bg-sidebar', className)}>
        <Button variant="ghost" size="icon" onClick={onCollapse} className="h-9 w-9">
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button onClick={onNewChat} size="icon" className="h-9 w-9 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl">
          <Plus className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <UserMenu collapsed />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full border-r border-border/50 bg-sidebar', className)}>
      <div className="flex items-center gap-2 p-4 border-b border-border/30">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="h-8 w-8 rounded-[0.75rem] bg-foreground text-background flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkle className="h-4 w-4" />
          </div>
          <span className="font-serif font-bold text-sm truncate tracking-tight">Techy Tharun</span>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onCollapse} className="flex-shrink-0">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-none font-medium"
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
          New Chat
          <span className="ml-auto text-xs text-muted-foreground font-normal">⌘⇧O</span>
        </Button>
      </div>

      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/50 border-0 rounded-lg focus-visible:ring-1"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-2">
        {isLoading ? (
          <div className="space-y-1 p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded-xl shimmer-bg" />
            ))}
          </div>
        ) : chatGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {search ? 'No chats found' : 'No conversations yet'}
            </p>
            {!search && <p className="text-xs text-muted-foreground/70 mt-1">Start a new chat to begin</p>}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <AnimatePresence>
              {chatGroups.map((group) => (
                <motion.div key={group.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="px-2 py-1 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.chats.map((chat) => (
                      <ChatItem key={chat.id} chat={chat} onDelete={onDeleteChat} onPin={onPinChat} onRename={onRenameChat} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      <div className="flex flex-col gap-2 p-3 border-t border-border/30 bg-muted/20">
        <UserMenu />
        {!collapsed && (
          <a
            href="https://tharunkumark4743.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40 hover:text-primary text-center py-2 transition-colors"
          >
            Built with 🖤 by Tharun Kumar
          </a>
        )}
      </div>
    </div>
  )
}
