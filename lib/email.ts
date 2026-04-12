import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    })

    if (data.error) {
      console.error('Resend API Error:', data.error)
      return { success: false, error: data.error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected Email Error:', error)
    return { success: false, error }
  }
}

export async function sendOTPEmail(email: string, code: string, message: string) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Techy Tharun's Chatbox"
  
  return sendEmail({
    to: email,
    subject: `Your ${appName} Verification Code`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #6d28d9; margin-bottom: 16px;">${appName} Verification</h2>
        <p style="font-size: 16px; color: #475569; line-height: 1.5;">${message}</p>
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #cbd5e1; text-align: center;">Sent with ❤️ from ${appName}</p>
      </div>
    `,
  })
}

export async function sendResetEmail(email: string, code: string, message: string) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Techy Tharun's Chatbox"
  
  return sendEmail({
    to: email,
    subject: `Reset Your ${appName} Password`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #6d28d9; margin-bottom: 16px;">Password Reset</h2>
        <p style="font-size: 16px; color: #475569; line-height: 1.5;">${message}</p>
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">Enter this code to reset your password. If you did not request this, please secure your account.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #cbd5e1; text-align: center;">Sent with ❤️ from ${appName}</p>
      </div>
    `,
  })
}
