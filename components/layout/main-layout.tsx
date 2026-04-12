'use client'

import { useState, useEffect, useRef } from 'react'
import { Sidebar } from '@/components/sidebar/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { useChats } from '@/hooks/use-chats'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { chats, isLoading, createChat, updateChat, deleteChat, pinChat, renameChat, refetch } = useChats()
  const prevPathname = useRef(pathname)

  // Refresh sidebar only when pathname actually changes (not on initial mount)
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname
      refetch()
    }
  }, [pathname, refetch])

  const handleNewChat = async () => {
    const chat = await createChat()
    if (chat) router.push(`/chat/${chat.id}`)
  }

  useKeyboardShortcuts({
    'mod+shift+o': (e) => { e.preventDefault(); handleNewChat() },
    'mod+b': (e) => { e.preventDefault(); setSidebarCollapsed((v) => !v) },
  })

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      <Sidebar
        chats={chats}
        isLoading={isLoading}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed((v) => !v)}
        onNewChat={handleNewChat}
        onUpdateChat={updateChat}
        onDeleteChat={deleteChat}
        onPinChat={pinChat}
        onRenameChat={renameChat}
        className={cn('hidden md:flex transition-all duration-300', sidebarCollapsed ? 'w-16' : 'w-72')}
      />

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <Sidebar
            chats={chats}
            isLoading={isLoading}
            collapsed={false}
            onCollapse={() => setSidebarOpen(false)}
            onNewChat={handleNewChat}
            onUpdateChat={updateChat}
            onDeleteChat={deleteChat}
            onPinChat={pinChat}
            onRenameChat={renameChat}
            className="relative z-50 w-72 flex"
          />
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</main>

      <MobileNav onMenuOpen={() => setSidebarOpen(true)} onNewChat={handleNewChat} />
    </div>
  )
}
