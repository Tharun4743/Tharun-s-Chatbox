export async function generateOTPWithAI(): Promise<{ code: string; message: string }> {
  // Generate code locally for maximum speed
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Use a professional premium template instead of waiting for AI for every single request
  // This drastically reduces latency by 1-2 seconds
  const message = `Welcome to ChatBox! Your secure verification code is ${code}. This code will expire in 10 minutes. If you did not request this code, please ignore this email.`

  return { code, message }
}
