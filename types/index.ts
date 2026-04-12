export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  plan: 'free' | 'pro' | 'enterprise'
  dailyMessageCount: number
  totalMessages: number
  totalTokens: number
  theme: 'light' | 'dark' | 'system'
  soundEnabled: boolean
  memoryEnabled: boolean
  memorySummary: string | null
  lastActiveChatId: string | null
  onboardingCompleted: boolean
  createdAt: string
}

export interface Chat {
  id: string
  userId: string
  title: string
  mode: ChatMode
  pinned: boolean
  archived: boolean
  model: string
  systemPrompt: string | null
  messageCount: number
  totalTokens: number
  createdAt: string
  updatedAt: string
  lastMessageAt: string
}

export type ChatMode =
  | 'normal'
  | 'code'
  | 'document'
  | 'image'
  | 'resume'
  | 'interview'
  | 'productivity'
  | 'study'
  | 'custom'

export interface Message {
  id: string
  chatId: string
  userId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model: string | null
  tokensUsed: number
  cost: number
  status: 'pending' | 'streaming' | 'complete' | 'error'
  errorMessage: string | null
  edited: boolean
  originalContent: string | null
  hasAttachments: boolean
  createdAt: string
  updatedAt: string
  // Client-side only
  attachments?: FileAttachment[]
}

export interface FileAttachment {
  id: string
  name: string
  mimeType: string
  size: number
  url?: string
  extractedText?: string
  status: 'pending' | 'processing' | 'ready' | 'error'
}

export interface UsageStats {
  date: string
  messageCount: number
  tokensUsed: number
  cost: number
}

export interface ChatGroup {
  label: string
  chats: Chat[]
}

export interface SlashCommand {
  command: string
  description: string
  mode?: ChatMode
  icon: string
}

export interface PromptSuggestion {
  text: string
  icon: string
  category: string
}

export interface StreamingState {
  isStreaming: boolean
  isThinking: boolean
  abortController: AbortController | null
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  soundEnabled: boolean
  memoryEnabled: boolean
  streamingEnabled: boolean
  autoScroll: boolean
  showTimestamps: boolean
  showTokenUsage: boolean
  fontSize: 'sm' | 'md' | 'lg'
}

export const CHAT_MODES: Record<ChatMode, { label: string; description: string; icon: string; systemPrompt: string }> = {
  normal: {
    label: 'Assistant',
    description: 'General purpose AI assistant',
    icon: '✨',
    systemPrompt: 'You are a helpful, warm, and knowledgeable AI assistant. Be conversational, clear, and genuinely helpful. Avoid being robotic or overly formal.',
  },
  code: {
    label: 'Code Assistant',
    description: 'Expert programming help',
    icon: '💻',
    systemPrompt: 'You are an expert software engineer and coding assistant. Help with code, debugging, architecture, and best practices. Always provide clean, well-commented code examples.',
  },
  document: {
    label: 'Document Analyzer',
    description: 'Analyze and summarize documents',
    icon: '📄',
    systemPrompt: 'You are a document analysis expert. Help users understand, summarize, and extract insights from documents. Be thorough and organized in your analysis.',
  },
  image: {
    label: 'Image Understanding',
    description: 'Analyze and describe images',
    icon: '🖼️',
    systemPrompt: 'You are an expert at analyzing and describing images. Provide detailed, accurate descriptions and insights about visual content.',
  },
  resume: {
    label: 'Resume Reviewer',
    description: 'Professional resume feedback',
    icon: '📋',
    systemPrompt: 'You are a professional career coach and resume expert. Provide detailed, actionable feedback to improve resumes and cover letters. Be encouraging but honest.',
  },
  interview: {
    label: 'Interview Prep',
    description: 'Practice interview questions',
    icon: '🎯',
    systemPrompt: 'You are an expert interview coach. Help users prepare for job interviews with practice questions, feedback, and strategies. Be supportive and constructive.',
  },
  productivity: {
    label: 'Productivity Coach',
    description: 'Boost your productivity',
    icon: '⚡',
    systemPrompt: 'You are a productivity and time management expert. Help users organize their work, set goals, and build better habits. Be practical and motivating.',
  },
  study: {
    label: 'Study Assistant',
    description: 'Learn anything faster',
    icon: '📚',
    systemPrompt: 'You are an expert tutor and learning coach. Help users understand complex topics, create study plans, and retain information better. Use clear explanations and examples.',
  },
  custom: {
    label: 'Custom Persona',
    description: 'Define your own assistant',
    icon: '🎭',
    systemPrompt: 'You are a helpful AI assistant. Adapt your personality and expertise based on the user\'s needs.',
  },
}

export const FREE_PLAN_LIMITS = {
  dailyMessages: 20,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxChats: 50,
}

export const PRO_PLAN_LIMITS = {
  dailyMessages: 500,
  maxFileSize: 25 * 1024 * 1024, // 25MB
  maxChats: Infinity,
}
