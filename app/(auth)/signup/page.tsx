'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, Sparkle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/chat' })
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: 'Please try again.',
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
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-500 mb-2">
          <Sparkle className="h-5 w-5 fill-current" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Join the Family</h2>
        <p className="text-muted-foreground text-sm">
          The fastest way to start chatting with your AI.
        </p>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-xl shadow-foreground/5 backdrop-blur-sm space-y-6">
        <div className="space-y-4">
          <Button
            type="button"
            className="w-full h-14 bg-white hover:bg-white/90 text-black border border-border/50 rounded-2xl text-base font-bold shadow-lg shadow-foreground/5 transition-all active:scale-[0.98] flex items-center justify-center gap-4"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-black/50" />
            ) : (
              <>
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Join with Google
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/10">
            <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
            <p className="text-[11px] leading-tight text-muted-foreground font-medium">
              We'll automatically set up your profile and chat history using your Google account.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          Safe • Fast • Professional
        </p>
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
