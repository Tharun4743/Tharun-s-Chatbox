import prisma from '@/lib/prisma'
import { GUEST_USER_ID, auth } from '@/lib/auth'
import { ensureGuestUser } from '@/lib/db'
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

  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const isAllowedMime = ALLOWED_TYPES.includes(file.type)
  const isAllowedExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'docx', 'doc', 'txt', 'md', 'csv', 'json'].includes(extension)

  if (!isAllowedMime && !isAllowedExt) {
    return Response.json({ error: 'File type not supported' }, { status: 415 })
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    let extractedText = ''
    let parsingError: string | null = null

    try {
      if (file.type === 'application/pdf' || extension === 'pdf') {
        const pdfParse = (await import('pdf-parse')).default
        extractedText = (await pdfParse(buffer)).text.slice(0, 50000)
      } else if (file.type.includes('word') || file.type.includes('document') || extension === 'docx' || extension === 'doc') {
        const mammoth = await import('mammoth')
        extractedText = (await mammoth.extractRawText({ buffer })).value.slice(0, 50000)
      } else if (file.type.startsWith('text/') || ['txt', 'md', 'csv', 'json', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py'].includes(extension)) {
        extractedText = buffer.toString('utf-8').slice(0, 50000)
      }
    } catch (err: any) {
      console.error('File content extraction failed:', err)
      parsingError = err?.message || String(err)
      extractedText = `[Note: Content extraction failed: ${parsingError}]`
    }

    const session = await auth()
    const userId = session?.user?.id || GUEST_USER_ID

    if (userId === GUEST_USER_ID) {
      await ensureGuestUser()
    }

    // Convert file to Base64 Data URL to be 100% serverless and persistent on Render
    const base64Data = buffer.toString('base64')
    const fileUrl = `data:${file.type || 'application/octet-stream'};base64,${base64Data}`

    const record = await prisma.fileUpload.create({
      data: {
        userId,
        chatId: chatId || null,
        name: file.name,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        url: fileUrl,
        extractedText,
        status: parsingError ? 'error' : 'ready',
        errorMessage: parsingError,
      },
    })

    return Response.json({
      id: record.id,
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      url: fileUrl,
      extractedText: extractedText.slice(0, 1000),
      fullText: extractedText,
      status: parsingError ? 'error' : 'ready',
      errorMessage: parsingError,
    })
  } catch (err) {
    console.error('Upload error:', err)
    return Response.json({ error: 'Failed to process file' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return Response.json({ error: 'Missing file ID' }, { status: 400 })
  }

  try {
    const record = await prisma.fileUpload.findUnique({
      where: { id },
    })

    if (!record) {
      return Response.json({ error: 'File not found' }, { status: 404 })
    }

    // Parse base64 data url from database
    const match = record.url.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) {
      return Response.json({ error: 'Invalid file data' }, { status: 500 })
    }

    const contentType = match[1]
    const base64Data = match[2]
    const buffer = Buffer.from(base64Data, 'base64')

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${encodeURIComponent(record.originalName)}"`,
      },
    })
  } catch (err) {
    console.error('File fetch error:', err)
    return Response.json({ error: 'Failed to fetch file' }, { status: 500 })
  }
}
