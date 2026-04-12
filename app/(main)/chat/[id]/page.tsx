import { getChatById, getMessages } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ChatInterface } from '@/components/chat/chat-interface'
import { auth } from '@/auth'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ message?: string }>
}

export default async function ChatPage({ params, searchParams }: Props) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    // This should ideally be handled by middleware, but providing a safe fallback
    return notFound()
  }

  const { id } = await params
  const { message } = await searchParams
  const [chat, messages] = await Promise.all([
    getChatById(id, userId),
    getMessages(id, userId),
  ])

  if (!chat) notFound()

  return <ChatInterface initialChat={chat} initialMessages={messages} userId={userId} initialMessage={message} />
}
