import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, otp } = await req.json()

    if (!email || !password || !otp) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Verify OTP
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token: otp } },
    })

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user
    // Note: If this fails with "Unknown argument password", ensure "prisma generate" has been run.
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Clean up used token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: otp } },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reset Error:', error?.message || error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
