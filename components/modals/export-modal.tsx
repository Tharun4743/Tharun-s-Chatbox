'use client'

import { useState } from 'react'
import type { Chat } from '@/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Download, FileDown } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ExportModalProps {
  open: boolean
  onClose: () => void
  chat: Chat
}

export function ExportModal({ open, onClose, chat }: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportAsMarkdown = async () => {
    setIsExporting(true)
    try {
      const res = await fetch(`/api/chats/${chat.id}`)
      const data = await res.json()
      const messages = data.messages || []

      const md = [
        `# ${chat.title}`,
        `*Exported from ChatBox on ${new Date().toLocaleDateString()}*`,
        '',
        ...messages.map((m: any) => [
          `## ${m.role === 'user' ? '👤 You' : '🤖 Assistant'}`,
          m.content,
          '',
        ].join('\n')),
      ].join('\n')

      const blob = new Blob([md], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${chat.title.replace(/[^a-z0-9]/gi, '-')}.md`
      a.click()
      URL.revokeObjectURL(url)
      toast({ description: 'Exported as Markdown' })
      onClose()
    } catch {
      toast({ description: 'Export failed', variant: 'destructive' })
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsPDF = async () => {
    setIsExporting(true)
    try {
      const res = await fetch(`/api/chats/${chat.id}`)
      const data = await res.json()
      const messages = data.messages || []

      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text(chat.title, 20, 20)

      doc.setFontSize(10)
      doc.setTextColor(128)
      doc.text(`Exported from ChatBox on ${new Date().toLocaleDateString()}`, 20, 30)

      let y = 45
      doc.setTextColor(0)

      for (const msg of messages) {
        if (y > 270) {
          doc.addPage()
          y = 20
        }

        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.text(msg.role === 'user' ? 'You:' : 'Assistant:', 20, y)
        y += 6

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        const lines = doc.splitTextToSize(msg.content, 170)
        doc.text(lines, 20, y)
        y += lines.length * 5 + 8
      }

      doc.save(`${chat.title.replace(/[^a-z0-9]/gi, '-')}.pdf`)
      toast({ description: 'Exported as PDF' })
      onClose()
    } catch {
      toast({ description: 'PDF export failed', variant: 'destructive' })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Export Conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Export "{chat.title}" in your preferred format.
          </p>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={exportAsMarkdown}
            disabled={isExporting}
          >
            <FileText className="h-5 w-5 text-blue-500" />
            <div className="text-left">
              <p className="text-sm font-medium">Markdown (.md)</p>
              <p className="text-xs text-muted-foreground">Plain text with formatting</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={exportAsPDF}
            disabled={isExporting}
          >
            <FileDown className="h-5 w-5 text-red-500" />
            <div className="text-left">
              <p className="text-sm font-medium">PDF Document</p>
              <p className="text-xs text-muted-foreground">Formatted document</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
