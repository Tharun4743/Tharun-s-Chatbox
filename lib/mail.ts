import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: 465,
  secure: true, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('SMTP Connection Detail Error:', error)
  } else {
    console.log('SMTP Server is ready and verified on Port 465')
  }
})

export async function sendVerificationEmail(email: string, code: string, message: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Your ChatBox Verification Code',
    text: `${message}\n\nYour code is: ${code}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #6d28d9; margin-bottom: 16px;">ChatBox Verification</h2>
        <p style="font-size: 16px; color: #475569; line-height: 1.5;">${message}</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Email Send Error:', error)
    throw error
  }
}

export async function sendPasswordResetEmail(email: string, code: string, message: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Your ChatBox Password',
    text: `${message}\n\nYour code is: ${code}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #6d28d9; margin-bottom: 16px;">Password Reset</h2>
        <p style="font-size: 16px; color: #475569; line-height: 1.5;">${message}</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1e293b;">${code}</span>
        </div>
        <p style="font-size: 14px; color: #94a3b8;">Enter this code to reset your password. If you did not request a password reset, please secure your account.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
