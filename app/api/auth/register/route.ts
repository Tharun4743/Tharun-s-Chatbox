import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, otp } = await req.json()

    if (!name || !email || !password || !otp) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Verify OTP
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { identifier_token: { identifier: email, token: otp } },
    })

    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    })

    // Clean up used token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: otp } },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('Registration Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
