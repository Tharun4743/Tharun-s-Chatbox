/**
 * ChatBox — MongoDB Reset Script
 * Wipes all collections and recreates indexes for a fresh start.
 *
 * Run: node scripts/reset-db.mjs
 *
 * ─── FIX AUTH ERROR ────────────────────────────────────────────────────────
 * If you see "Authentication failed":
 *
 * 1. Go to https://cloud.mongodb.com
 * 2. Select your project → Security → Database Access
 * 3. Click EDIT on user "Chatbox"
 * 4. Click "Edit Password" → type a new password (e.g. Chatbox2024!)
 * 5. Click "Update User"
 * 6. Go to Security → Network Access
 * 7. Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0) → Confirm
 * 8. Update MONGODB_URI in .env.local:
 *    MONGODB_URI=mongodb+srv://Chatbox:Chatbox2024!@cluster0.8zsd1i8.mongodb.net/?retryWrites=true&w=majority
 * 9. Run: node scripts/reset-db.mjs
 * ───────────────────────────────────────────────────────────────────────────
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

let MONGODB_URI = ''
try {
  const envContent = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
  const match = envContent.match(/^MONGODB_URI=(.+)$/m)
  if (match) MONGODB_URI = match[1].trim()
} catch {}

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local')
  process.exit(1)
}

const DB_NAME = 'chatbox'

async function resetDatabase() {
  console.log('🔌 Connecting to MongoDB Atlas...')
  console.log(`   ${MONGODB_URI.replace(/:[^:@]+@/, ':***@')}\n`)

  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 15000 })

  try {
    await client.connect()
    console.log('✅ Connected!\n')

    const db = client.db(DB_NAME)
    const cols = await db.listCollections().toArray()
    console.log(`📋 Existing collections: ${cols.map(c => c.name).join(', ') || 'none'}`)

    if (cols.length > 0) {
      console.log('\n🗑️  Dropping all collections...')
      for (const col of cols) {
        await db.collection(col.name).drop()
        console.log(`   ✓ Dropped: ${col.name}`)
      }
    }

    console.log('\n🏗️  Creating fresh indexes...')

    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    console.log('   ✓ users — email (unique)')

    await db.collection('chats').createIndex({ userId: 1, archived: 1, lastMessageAt: -1 })
    await db.collection('chats').createIndex({ userId: 1, pinned: 1 })
    console.log('   ✓ chats — compound indexes')

    await db.collection('messages').createIndex({ chatId: 1, createdAt: 1 })
    await db.collection('messages').createIndex({ userId: 1 })
    console.log('   ✓ messages — chatId+createdAt, userId')

    await db.collection('fileuploads').createIndex({ userId: 1 })
    await db.collection('fileuploads').createIndex({ chatId: 1 })
    console.log('   ✓ fileuploads — userId, chatId')

    await db.collection('usagestats').createIndex({ userId: 1, date: 1 }, { unique: true })
    console.log('   ✓ usagestats — userId+date (unique)')

    console.log(`\n✅ Database "${DB_NAME}" reset complete!`)
    console.log('   All old data removed. Fresh start ready.\n')
  } catch (err) {
    console.error('\n❌ Failed:', err.message)
    if (err.message.includes('Authentication') || err.message.includes('bad auth')) {
      console.log('\n📋 Fix steps:')
      console.log('   1. https://cloud.mongodb.com → Database Access → Edit "Chatbox" → reset password')
      console.log('   2. Network Access → Add IP → 0.0.0.0/0 (Allow from anywhere)')
      console.log('   3. Update MONGODB_URI in .env.local with new password')
      console.log('   4. Run: node scripts/reset-db.mjs')
    }
    process.exit(1)
  } finally {
    await client.close()
  }
}

resetDatabase()
