import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

declare global {
  var _prisma: PrismaClient | undefined
}

function createClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

const prisma: PrismaClient = global._prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  global._prisma = prisma
}

export default prisma
