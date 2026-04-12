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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-border/50 px-4 py-3 safe-area-bottom">
      <div className="flex items-center justify-between max-w-md mx-auto gap-4">
        <Button variant="ghost" size="icon" onClick={onMenuOpen} className="h-11 w-11 rounded-xl">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </Button>

        <Button
          onClick={onNewChat}
          className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

        <Link href="/chat">
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-11 w-11 rounded-xl', pathname === '/chat' && 'bg-accent text-primary')}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
