'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface MarkdownRendererProps {
  content: string
  isStreaming?: boolean
}

export function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className={cn('prose-chat', isStreaming && 'typing-cursor')}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const language = match?.[1] || 'text'
            const codeString = String(children).replace(/\n$/, '')
            const isInline = !match && !codeString.includes('\n')

            if (!isInline && match) {
              return (
                <CodeBlock
                  language={language}
                  code={codeString}
                  isDark={isDark}
                />
              )
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          pre({ children }) {
            return <>{children}</>
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            )
          },
          img({ src, alt }) {
            return <ImageWithProgress src={src} alt={alt} />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function ImageWithProgress({ src, alt }: { src?: string; alt?: string }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (loading && !error) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev
          // Non-linear progress simulation
          const inc = prev < 30 ? 5 : prev < 70 ? 2 : 1
          return Math.min(prev + inc, 95)
        })
      }, 300)
      return () => clearInterval(timer)
    }
  }, [loading, error])

  const handleLoad = () => {
    setProgress(100)
    setTimeout(() => setLoading(false), 500)
  }

  return (
    <div className="flex flex-col items-center my-8 w-full max-w-2xl mx-auto">
      <div className="relative group w-full overflow-hidden rounded-[2.5rem] border border-border/20 shadow-xl shadow-foreground/5 bg-transparent min-h-[400px] flex items-center justify-center transition-all duration-700">
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent backdrop-blur-[2px] z-10 space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="h-20 w-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="absolute text-[10px] font-black text-primary">{progress}%</span>
            </div>
            <div className="w-48 h-1 bg-primary/20 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary"
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary/80 animate-pulse">
              Creating your artwork...
            </p>
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <span className="text-xl">⚠️</span>
            </div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Generation Unstable
            </p>
            <p className="text-[10px] text-muted-foreground/60 italic">
              "The universe is shy today. Please try a different prompt."
            </p>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            onError={() => {
              setLoading(false)
              setError(true)
            }}
            className={cn(
              "max-w-full h-auto block transition-all duration-1000",
              loading ? "opacity-0 scale-95 blur-xl" : "opacity-100 scale-100 blur-0"
            )}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
      </div>
      {alt && !error && (
        <span className="mt-4 text-[9px] uppercase tracking-[0.4em] font-black text-muted-foreground/40 text-center px-4 leading-relaxed">
          {alt}
        </span>
      )}
    </div>
  )
}

function CodeBlock({ language, code, isDark }: { language: string; code: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-border/50">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 border-b border-border/50">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleCopy}
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.8125rem',
          background: isDark ? '#1e1e2e' : '#f8f8f8',
        }}
        showLineNumbers={code.split('\n').length > 5}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}
