'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Loader2, ShieldCheck, HeartPulse, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    password: '',
  })

  const handleSendOtp = useCallback(async () => {
    if (!formData.email) {
      toast({ title: 'Where should we send it?', description: 'Please enter your email first.', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, type: 'reset' }),
      })

      const data = await res.json()
      if (res.ok) {
        setIsOtpSent(true)
        toast({ title: 'On the way!', description: 'Check your email for the reset code.' })
      } else {
        toast({ title: 'Problem found', description: data.error || 'Failed to send code.', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.otp || !formData.password) {
      toast({ title: 'Details missing', description: 'Please fill in both the code and your new password.', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Success!', description: 'Your password has been updated. Welcome back!' })
        router.push('/login')
      } else {
        toast({ title: 'Reset failed', description: data.error || 'Please try again.', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-500 mb-2">
          <HeartPulse className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Don't worry</h2>
        <p className="text-muted-foreground text-sm">
          It happens to the best of us. We'll help you get back in.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl shadow-foreground/5 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isOtpSent ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Your registered email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-12 h-12 bg-muted/30 border-none rounded-2xl"
                      required
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-bold shadow-lg shadow-blue-200"
                  disabled={isLoading}
                  suppressHydrationWarning
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send reset link"}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="code-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 text-center"
              >
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 mb-4 text-left">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Check your inbox</p>
                  <p className="text-sm font-semibold">{formData.email}</p>
                </div>

                <div className="space-y-2 text-left">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">The 6-digit code</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      placeholder="123456"
                      value={formData.otp}
                      onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                      className="pl-12 h-12 bg-muted/30 border-none rounded-2xl tracking-[0.5em] font-mono text-lg"
                      maxLength={6}
                      required
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Your new password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      type="password"
                      placeholder="Pick something safe"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 h-12 bg-muted/30 border-none rounded-2xl"
                      required
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20"
                  disabled={isLoading}
                  suppressHydrationWarning
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset password"}
                </Button>

                <button 
                  type="button" 
                  onClick={() => setIsOtpSent(false)} 
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Wait, I remember it!
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <div className="text-center">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </motion.div>
  )
}
