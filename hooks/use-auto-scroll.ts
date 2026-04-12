'use client'

import { useEffect, useRef, useCallback } from 'react'

export function useAutoScroll(dependency: any, enabled = true) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isUserScrollingRef = useRef(false)

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      isUserScrollingRef.current = scrollHeight - scrollTop - clientHeight >= 100
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (enabled && !isUserScrollingRef.current) {
      scrollToBottom()
    }
  }, [dependency, enabled, scrollToBottom])

  return { bottomRef, containerRef, scrollToBottom }
}
