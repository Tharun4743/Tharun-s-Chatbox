import { WelcomeScreen } from '@/components/chat/welcome-screen'
import { auth } from '@/auth'

export default async function ChatPage() {
  const session = await auth()
  return <WelcomeScreen user={session?.user} />
}
