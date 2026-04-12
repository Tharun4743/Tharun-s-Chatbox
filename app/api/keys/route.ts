import { auth } from '@/auth'
import { getKeyStats } from '@/lib/key-manager'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  return Response.json(getKeyStats())
}
