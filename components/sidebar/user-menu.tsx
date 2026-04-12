'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { SettingsModal } from '@/components/modals/settings-modal'
import { Settings, User, LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UserMenu({ collapsed }: { collapsed?: boolean }) {
  const { data: session } = useSession()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const user = session?.user
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {collapsed ? (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20">
              <span className="text-[10px] font-bold text-primary">{initials}</span>
            </Button>
          ) : (
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 px-3 rounded-xl hover:bg-accent/50 group transition-all">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side={collapsed ? 'right' : 'top'} align="end" className="w-56 p-1.5 shadow-xl border-border/50 backdrop-blur-md">
          <div className="px-2 py-1.5 mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
          </div>
          <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="rounded-lg gap-2 cursor-pointer">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span>Security</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem 
            onClick={() => signOut({ callbackUrl: '/login' })} 
            className="rounded-lg gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
