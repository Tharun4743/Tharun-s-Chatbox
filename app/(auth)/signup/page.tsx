'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Loader2, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  })

  const handleSendOtp = useCallback(async () => {
    if (!formData.email || !formData.name || !formData.password) {
      toast({ title: 'Wait a moment', description: 'Please fill in all the details first.', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, type: 'signup' }),
      })

      const data = await res.json()
      if (res.ok) {
        setIsOtpSent(true)
        toast({ title: 'Magic sent!', description: 'Check your inbox for a special 6-digit code.' })
      } else {
        toast({ title: 'Oops', description: data.error || 'Failed to send code.', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong. Try again?', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.otp) {
      toast({ title: 'Security first', description: 'Please enter the code we sent you.', variant: 'destructive' })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (res.ok) {
        toast({ title: 'Welcome to the family!', description: 'Your account is ready.' })
        await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          callbackUrl: '/chat',
        })
      } else {
        toast({ title: 'Registration failed', description: data.error || 'Please try again.', variant: 'destructive' })
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
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-500 mb-2">
          <Sparkles className="h-5 w-5 fill-current" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Join the family</h2>
        <p className="text-muted-foreground text-sm">
          Start your journey with a simpler, smarter AI.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl shadow-foreground/5 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isOtpSent ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">What should we call you?</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="pl-12 h-12 bg-muted/30 border-none rounded-2xl"
                      required
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Your email address</Label>
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

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Choose a password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                    <Input
                      type="password"
                      placeholder="Make it strong"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-12 h-12 bg-muted/30 border-none rounded-2xl"
                      required
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full h-12 bg-violet-600 hover:bg-violet-700 rounded-2xl text-sm font-bold shadow-lg shadow-violet-200"
                  disabled={isLoading}
                  suppressHydrationWarning
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send verification code"}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 text-center"
              >
                <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/20 mb-4 text-left">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Verify your email</p>
                  <p className="text-sm font-semibold">{formData.email}</p>
                </div>
                
                <div className="space-y-2 text-left">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Enter the 6-digit code</Label>
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

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20"
                  disabled={isLoading}
                  suppressHydrationWarning
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Complete registration"}
                </Button>
                
                <button 
                  type="button" 
                  onClick={() => setIsOtpSent(false)} 
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Back to details
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-foreground hover:text-primary transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
