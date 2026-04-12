import prisma from '@/lib/prisma'
import { GUEST_USER_ID } from '@/lib/auth'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const MAX_FILE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'text/markdown', 'text/csv',
]

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  const chatId = formData.get('chatId') as string | null

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })
  if (file.size > MAX_FILE_SIZE) return Response.json({ error: 'File too large. Max 5MB.' }, { status: 413 })
  if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: 'File type not supported' }, { status: 415 })

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    let extractedText = ''

    if (file.type === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default
      extractedText = (await pdfParse(buffer)).text.slice(0, 50000)
    } else if (file.type.includes('word') || file.type.includes('document')) {
      const mammoth = await import('mammoth')
      extractedText = (await mammoth.extractRawText({ buffer })).value.slice(0, 50000)
    } else if (file.type.startsWith('text/')) {
      extractedText = buffer.toString('utf-8').slice(0, 50000)
    }

    const record = await prisma.fileUpload.create({
      data: {
        userId: GUEST_USER_ID,
        chatId: chatId || null,
        name: `${GUEST_USER_ID}/${Date.now()}-${file.name}`,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        extractedText,
        status: 'ready',
      },
    })

    return Response.json({
      id: record.id,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      url: '',
      extractedText: extractedText.slice(0, 1000),
      fullText: extractedText,
      status: 'ready',
    })
  } catch (err) {
    console.error('Upload error:', err)
    return Response.json({ error: 'Failed to process file' }, { status: 500 })
  }
}
