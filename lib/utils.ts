import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'
import type { Chat, ChatGroup } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMessageTime(date: string | Date): string {
  const d = new Date(date)
  if (isToday(d)) return format(d, 'h:mm a')
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, h:mm a')
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function groupChatsByDate(chats: Chat[]): ChatGroup[] {
  const pinned = chats.filter((c) => c.pinned)
  const unpinned = chats.filter((c) => !c.pinned)

  const groups: ChatGroup[] = []

  if (pinned.length > 0) {
    groups.push({ label: 'Pinned', chats: pinned })
  }

  const today: Chat[] = []
  const yesterday: Chat[] = []
  const thisWeek: Chat[] = []
  const thisMonth: Chat[] = []
  const older: Chat[] = []

  unpinned.forEach((chat) => {
    const d = new Date(chat.lastMessageAt)
    if (isToday(d)) today.push(chat)
    else if (isYesterday(d)) yesterday.push(chat)
    else if (isThisWeek(d)) thisWeek.push(chat)
    else if (isThisMonth(d)) thisMonth.push(chat)
    else older.push(chat)
  })

  if (today.length > 0) groups.push({ label: 'Today', chats: today })
  if (yesterday.length > 0) groups.push({ label: 'Yesterday', chats: yesterday })
  if (thisWeek.length > 0) groups.push({ label: 'This Week', chats: thisWeek })
  if (thisMonth.length > 0) groups.push({ label: 'This Month', chats: thisMonth })
  if (older.length > 0) groups.push({ label: 'Older', chats: older })

  return groups
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function generateChatTitle(firstMessage: string): string {
  const cleaned = firstMessage.replace(/[#*`]/g, '').trim()
  return truncateText(cleaned, 50) || 'New Chat'
}

export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) return `${tokens}`
  return `${(tokens / 1000).toFixed(1)}k`
}

export function calculateCost(tokens: number, model = 'openai/gpt-4o'): number {
  // GPT-4o pricing: ~$5/1M input, $15/1M output (approximate blended)
  const costPer1kTokens = 0.01
  return (tokens / 1000) * costPer1kTokens
}

export function formatCost(cost: number): string {
  if (cost < 0.001) return '<$0.001'
  return `$${cost.toFixed(4)}`
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType === 'application/pdf') return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('text')) return '📃'
  return '📎'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const WARM_GREETINGS = [
  "Good to see you! What's on your mind today?",
  "Hey there! Ready to dive in?",
  "Welcome back! How can I help you today?",
  "Hi! I'm here and ready to help.",
  "Great to have you here. What would you like to explore?",
]

export function getWarmGreeting(name?: string | null): string {
  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = name?.split(' ')[0]
  return firstName ? `${timeGreeting}, ${firstName}` : `${timeGreeting}`
}

export const PROMPT_SUGGESTIONS = [
  { text: 'Help me write a professional email', icon: '✉️', category: 'Writing' },
  { text: 'Explain a complex topic simply', icon: '💡', category: 'Learning' },
  { text: 'Review my code for bugs', icon: '🐛', category: 'Code' },
  { text: 'Create a study plan for me', icon: '📚', category: 'Study' },
  { text: 'Help me brainstorm ideas', icon: '🧠', category: 'Creative' },
  { text: 'Summarize this document', icon: '📋', category: 'Document' },
  { text: 'Practice interview questions', icon: '🎯', category: 'Career' },
  { text: 'Help me plan my week', icon: '📅', category: 'Productivity' },
]

export const SLASH_COMMANDS = [
  { command: '/code', description: 'Switch to Code Assistant mode', mode: 'code', icon: '💻' },
  { command: '/doc', description: 'Analyze a document', mode: 'document', icon: '📄' },
  { command: '/resume', description: 'Review your resume', mode: 'resume', icon: '📋' },
  { command: '/interview', description: 'Practice interviews', mode: 'interview', icon: '🎯' },
  { command: '/study', description: 'Study assistant mode', mode: 'study', icon: '📚' },
  { command: '/coach', description: 'Productivity coaching', mode: 'productivity', icon: '⚡' },
  { command: '/image', description: 'Image understanding', mode: 'image', icon: '🖼️' },
  { command: '/clear', description: 'Clear conversation', icon: '🗑️' },
  { command: '/export', description: 'Export conversation', icon: '📤' },
]
