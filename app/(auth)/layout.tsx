import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-100 via-background to-background dark:from-violet-900/20 dark:via-background dark:to-background">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="h-full w-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight">Techy Tharun's Chatbox</span>
        </Link>
      </div>

      <div className="w-full max-w-[420px]">
        {children}
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-xs text-muted-foreground font-medium">
          © 2026 Techy Tharun's Chatbox — Made with care.
        </p>
      </div>
    </div>
  )
}
