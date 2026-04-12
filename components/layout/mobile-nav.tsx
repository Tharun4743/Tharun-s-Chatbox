'use client'

import { Menu, Plus, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  onMenuOpen: () => void
  onNewChat: () => void
}

export function MobileNav({ onMenuOpen, onNewChat }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-border/50 px-4 py-2 safe-area-bottom">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        <Button variant="ghost" size="icon" onClick={onMenuOpen} className="h-12 w-12 rounded-2xl">
          <Menu className="h-5 w-5" />
        </Button>

        <Button
          onClick={onNewChat}
          className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"
        >
          <Plus className="h-5 w-5 mr-1" />
          New Chat
        </Button>

        <Link href="/chat">
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-12 w-12 rounded-2xl', pathname === '/chat' && 'bg-accent')}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
