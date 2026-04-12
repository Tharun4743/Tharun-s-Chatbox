import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateOTPWithAI } from '@/lib/otp'
import { sendOTPEmail, sendResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, type = 'signup' } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (type === 'signup') {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 })
      }
    } else if (type === 'reset') {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (!existingUser) {
        return NextResponse.json({ error: 'No user found with this email' }, { status: 404 })
      }
    }

    // Generate code and message using AI
    const { code, message } = await generateOTPWithAI()

    // Store in DB
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    await prisma.verificationToken.upsert({
      where: { identifier_token: { identifier: email, token: code } },
      update: { expires },
      create: { identifier: email, token: code, expires },
    })

    // Send email using Resend
    let emailResponse;
    if (type === 'signup') {
      emailResponse = await sendOTPEmail(email, code, message)
    } else {
      emailResponse = await sendResetEmail(email, code, message)
    }

    if (!emailResponse.success) {
      console.error('Email Dispatch Failed:', emailResponse.error)
      return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' })
  } catch (error) {
    console.error('OTP Route Internal Error:', error)
    return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 })
  }
}
