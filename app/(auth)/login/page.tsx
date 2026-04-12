'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Loader2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // Map common error identifiers to human messages
        const errorMsg = result.error.includes("password") 
          ? "The password you entered is incorrect." 
          : result.error.includes("email") || result.error.includes("No account")
          ? "No account found with this email."
          : "Sign in failed. Please check your details."

        toast({
          title: 'Authentication Failed',
          description: errorMsg,
          variant: 'destructive',
        })
      } else {
        toast({ 
          title: 'Welcome back!', 
          description: 'Let\'s pick up right where we left off.' 
        })
        router.push('/chat')
        router.refresh()
      }
    } catch (error) {
      toast({
        title: 'Oops!',
        description: 'Something went wrong on our end. Please try again.',
        variant: 'destructive',
      })
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
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-500 mb-2">
          <Heart className="h-5 w-5 fill-current" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Hello again!</h2>
        <p className="text-muted-foreground text-sm">
          It's good to see you. Please sign in to continue.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl shadow-foreground/5 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                id="email"
                type="email"
                placeholder="Where should we reach you?"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 bg-muted/30 border-none rounded-2xl focus-visible:ring-primary/20"
                required
                suppressHydrationWarning
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input
                id="password"
                type="password"
                placeholder="Your secret key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12 bg-muted/30 border-none rounded-2xl focus-visible:ring-primary/20"
                required
                suppressHydrationWarning
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            disabled={isLoading}
            suppressHydrationWarning
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          New here?{' '}
          <Link href="/signup" className="font-bold text-foreground hover:text-primary transition-colors">
            Create an account
          </Link>
        </p>
        
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
          Simply secure • Simply Techy Tharun
        </p>
      </div>
    </motion.div>
  )
}
