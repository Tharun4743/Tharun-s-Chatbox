'use client'

import { motion } from 'framer-motion'
import { MarkdownRenderer } from './markdown-renderer'

interface StreamingMessageProps {
  content: string
}

export function StreamingMessage({ content }: StreamingMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 py-2"
    >
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
        <span className="text-white text-xs font-bold">AI</span>
      </div>

      <div className="flex-1 min-w-0 max-w-[85%]">
        <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
          <MarkdownRenderer content={content} isStreaming />
        </div>
      </div>
    </motion.div>
  )
}
