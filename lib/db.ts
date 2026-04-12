import prisma from './prisma'
import type { Chat, Message, User, UsageStats } from '@/types'
import { GUEST_USER_ID } from './auth'

export async function ensureGuestUser(): Promise<void> {
  await prisma.user.upsert({
    where: { id: GUEST_USER_ID },
    update: {},
    create: { id: GUEST_USER_ID, email: 'guest@local', name: 'You' },
  })
}

// ============================================
// CHAT OPERATIONS
// ============================================

export async function getChats(userId: string): Promise<Chat[]> {
  const rows = await prisma.chat.findMany({
    where: { userId, archived: false },
    orderBy: [{ pinned: 'desc' }, { lastMessageAt: 'desc' }],
  })
  return rows.map(mapChat)
}

export async function getChatById(chatId: string, userId: string): Promise<Chat | null> {
  const row = await prisma.chat.findFirst({
    where: { id: chatId, userId },
  })
  return row ? mapChat(row) : null
}

export async function createChat(userId: string, title = 'New Chat', mode = 'normal'): Promise<Chat> {
  const row = await prisma.chat.create({
    data: { userId, title, mode },
  })
  return mapChat(row)
}

export async function updateChat(chatId: string, userId: string, updates: Partial<Chat>): Promise<void> {
  await prisma.chat.updateMany({
    where: { id: chatId, userId },
    data: {
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.pinned !== undefined && { pinned: updates.pinned }),
      ...(updates.archived !== undefined && { archived: updates.archived }),
      ...(updates.mode !== undefined && { mode: updates.mode }),
      ...(updates.systemPrompt !== undefined && { systemPrompt: updates.systemPrompt }),
    },
  })
}

export async function deleteChat(chatId: string, userId: string): Promise<void> {
  await prisma.chat.deleteMany({ where: { id: chatId, userId } })
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

export async function getMessages(chatId: string, userId: string): Promise<Message[]> {
  const rows = await prisma.message.findMany({
    where: { chatId, userId },
    orderBy: { createdAt: 'asc' },
  })
  return rows.map(mapMessage)
}

export async function createMessage(message: {
  chatId: string
  userId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: string
  tokensUsed?: number
  cost?: number
  status?: string
}): Promise<Message> {
  const [row] = await prisma.$transaction([
    prisma.message.create({
      data: {
        chatId: message.chatId,
        userId: message.userId,
        role: message.role,
        content: message.content,
        aiModel: message.model ?? null,
        tokensUsed: message.tokensUsed ?? 0,
        cost: message.cost ?? 0,
        status: message.status ?? 'complete',
      },
    }),
    prisma.chat.update({
      where: { id: message.chatId },
      data: {
        messageCount: { increment: 1 },
        totalTokens: { increment: message.tokensUsed ?? 0 },
        lastMessageAt: new Date(),
      },
    }),
  ])
  return mapMessage(row)
}

export async function updateMessage(
  messageId: string,
  updates: {
    content?: string
    status?: string
    tokensUsed?: number
    cost?: number
    errorMessage?: string
    edited?: boolean
    originalContent?: string
  }
): Promise<void> {
  await prisma.message.update({
    where: { id: messageId },
    data: {
      ...(updates.content !== undefined && { content: updates.content }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.tokensUsed !== undefined && { tokensUsed: updates.tokensUsed }),
      ...(updates.cost !== undefined && { cost: updates.cost }),
      ...(updates.errorMessage !== undefined && { errorMessage: updates.errorMessage }),
      ...(updates.edited !== undefined && { edited: updates.edited }),
      ...(updates.originalContent !== undefined && { originalContent: updates.originalContent }),
    },
  })
}

export async function deleteMessage(messageId: string, userId: string): Promise<void> {
  await prisma.message.deleteMany({ where: { id: messageId, userId } })
}

// ============================================
// USER OPERATIONS
// ============================================

export async function getUser(userId: string): Promise<User | null> {
  const row = await prisma.user.findUnique({ where: { id: userId } })
  return row ? mapUser(row) : null
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      ...(updates.theme !== undefined && { theme: updates.theme }),
      ...(updates.soundEnabled !== undefined && { soundEnabled: updates.soundEnabled }),
      ...(updates.memoryEnabled !== undefined && { memoryEnabled: updates.memoryEnabled }),
      ...(updates.memorySummary !== undefined && { memorySummary: updates.memorySummary }),
      ...(updates.lastActiveChatId !== undefined && { lastActiveChatId: updates.lastActiveChatId }),
      ...(updates.onboardingCompleted !== undefined && { onboardingCompleted: updates.onboardingCompleted }),
    },
  })
}

export async function incrementUserUsage(userId: string, tokensUsed: number): Promise<void> {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyResetAt: true },
  })

  // Reset if last reset was more than 24 hours ago
  const needsReset = !user || user.dailyResetAt.getTime() < now.getTime() - 86400000

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        dailyMessageCount: needsReset ? 1 : { increment: 1 },
        totalMessages: { increment: 1 },
        totalTokens: { increment: tokensUsed },
        dailyResetAt: needsReset ? now : undefined,
      },
    }),
    prisma.usageStat.upsert({
      where: { userId_date: { userId, date: today } },
      update: { messageCount: { increment: 1 }, tokensUsed: { increment: tokensUsed } },
      create: { userId, date: today, messageCount: 1, tokensUsed },
    }),
  ])
}

export async function getUserUsageStats(userId: string, days = 7): Promise<UsageStats[]> {
  const since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]
  const rows = await prisma.usageStat.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: 'asc' },
  })
  return rows.map((r) => ({
    date: r.date,
    messageCount: r.messageCount,
    tokensUsed: r.tokensUsed,
    cost: r.cost,
  }))
}

// ============================================
// MAPPERS
// ============================================

function mapChat(d: any): Chat {
  return {
    id: d.id,
    userId: d.userId,
    title: d.title,
    mode: d.mode,
    pinned: d.pinned,
    archived: d.archived,
    model: d.aiModel,
    systemPrompt: d.systemPrompt ?? null,
    messageCount: d.messageCount,
    totalTokens: d.totalTokens,
    createdAt: d.createdAt?.toISOString?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toISOString?.() ?? d.updatedAt,
    lastMessageAt: d.lastMessageAt?.toISOString?.() ?? d.lastMessageAt,
  }
}

function mapMessage(d: any): Message {
  return {
    id: d.id,
    chatId: d.chatId,
    userId: d.userId,
    role: d.role,
    content: d.content,
    model: d.aiModel ?? null,
    tokensUsed: d.tokensUsed ?? 0,
    cost: d.cost ?? 0,
    status: d.status,
    errorMessage: d.errorMessage ?? null,
    edited: d.edited ?? false,
    originalContent: d.originalContent ?? null,
    hasAttachments: d.hasAttachments ?? false,
    createdAt: d.createdAt?.toISOString?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toISOString?.() ?? d.updatedAt,
  }
}

function mapUser(d: any): User {
  return {
    id: d.id,
    name: d.name ?? null,
    email: d.email,
    image: d.image ?? null,
    plan: d.plan ?? 'free',
    dailyMessageCount: d.dailyMessageCount ?? 0,
    totalMessages: d.totalMessages ?? 0,
    totalTokens: d.totalTokens ?? 0,
    theme: d.theme ?? 'system',
    soundEnabled: d.soundEnabled ?? true,
    memoryEnabled: d.memoryEnabled ?? true,
    memorySummary: d.memorySummary ?? null,
    lastActiveChatId: d.lastActiveChatId ?? null,
    onboardingCompleted: d.onboardingCompleted ?? false,
    createdAt: d.createdAt?.toISOString?.() ?? d.createdAt,
  }
}
