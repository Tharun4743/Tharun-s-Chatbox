import { getUser, updateUser } from '@/lib/db'
import { GUEST_USER_ID } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET() {
  const user = await getUser(GUEST_USER_ID)
  return Response.json({ user })
}

export async function PATCH(req: NextRequest) {
  const updates = await req.json()
  await updateUser(GUEST_USER_ID, updates)
  return Response.json({ success: true })
}
