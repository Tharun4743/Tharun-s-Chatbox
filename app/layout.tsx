import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: "Techy Tharun's Chatbox — Premium AI Assistant", template: "%s | Techy Tharun's Chatbox" },
  description: "A premium AI assistant powered by GPT-4o. Created by Techy Tharun.",
  keywords: ['AI', 'chatbot', 'GPT-4o', 'assistant', 'productivity'],
  authors: [{ name: 'ChatBox' }],
  creator: 'ChatBox',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'ChatBox — Premium AI Assistant',
    description: 'A premium AI assistant powered by GPT-4o.',
    siteName: 'ChatBox',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatBox — Premium AI Assistant',
    description: 'A premium AI assistant powered by GPT-4o.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

import AuthProvider from '@/components/providers/auth-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
