import { auth as nextAuth } from "@/auth"

export const GUEST_USER_ID = 'local-user'

export async function auth() {
  const session = await nextAuth()
  return session
}
