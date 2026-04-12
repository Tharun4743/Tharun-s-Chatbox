import { getChats, createChat } from '@/lib/db'
import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const chats = await getChats(userId)
  return NextResponse.json({ chats })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, mode } = await req.json()
  const chat = await createChat(userId, title, mode)
  return NextResponse.json({ chat })
}
