'use client'

import { useTheme } from 'next-themes'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Sun, Moon, Monitor, Volume2, Brain } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Load actual user preferences when modal opens
  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    fetch('/api/user')
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setSoundEnabled(data.user.soundEnabled ?? true)
          setMemoryEnabled(data.user.memoryEnabled ?? true)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [open])

  const handleSave = async (updates: Record<string, any>) => {
    try {
      await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      toast({ description: 'Settings saved' })
    } catch {
      toast({ description: 'Failed to save settings', variant: 'destructive' })
    }
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3">Appearance</p>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => { setTheme(value); handleSave({ theme: value }) }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                    theme === value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Preferences</p>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Sound effects</p>
                  <p className="text-xs text-muted-foreground">Play sounds on messages</p>
                </div>
              </div>
              <Switch
                disabled={isLoading}
                checked={soundEnabled}
                onCheckedChange={(v) => { setSoundEnabled(v); handleSave({ soundEnabled: v }) }}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Memory</p>
                  <p className="text-xs text-muted-foreground">Remember context across chats</p>
                </div>
              </div>
              <Switch
                disabled={isLoading}
                checked={memoryEnabled}
                onCheckedChange={(v) => { setMemoryEnabled(v); handleSave({ memoryEnabled: v }) }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
