'use client'

import { useState, useCallback } from 'react'

export type WindowKind = 'registry' | 'editor' | 'preview' | 'console'

export interface OsWindow {
  id: string
  kind: WindowKind
  title: string
  fileId?: string
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  maximized: boolean
  focused: boolean
}

const SIZES: Record<WindowKind, { w: number; h: number }> = {
  registry: { w: 280, h: 480 },
  editor:   { w: 440, h: 520 },
  preview:  { w: 580, h: 460 },
  console:  { w: 480, h: 240 },
}

function nextZ(wins: OsWindow[]) {
  return wins.length ? Math.max(...wins.map(w => w.z)) + 1 : 1
}

export function useDesktop() {
  const [windows, setWindows] = useState<OsWindow[]>([{
    id: 'registry-main',
    kind: 'registry',
    title: 'File Registry',
    x: 32, y: 32,
    ...SIZES.registry,
    z: 1,
    minimized: false,
    maximized: false,
    focused: true,
  }])

  const openWindow = useCallback((kind: WindowKind, fileId?: string, title?: string) => {
    const id = fileId ? `${kind}-${fileId}` : `${kind}-main`
    setWindows(prev => {
      const existing = prev.find(w => w.id === id)
      if (existing) {
        return prev.map(w => w.id === id
          ? { ...w, minimized: false, focused: true, z: nextZ(prev) }
          : { ...w, focused: false }
        )
      }
      // Only one preview window at a time — close any other preview before opening a new one
      const base = kind === 'preview'
        ? prev.filter(w => w.kind !== 'preview')
        : prev
      const n = base.filter(w => !w.minimized).length
      return [
        ...base.map(w => ({ ...w, focused: false })),
        {
          id, kind,
          title: title ?? kind,
          fileId,
          x: 48 + (n % 6) * 28,
          y: 48 + (n % 6) * 22,
          ...SIZES[kind],
          z: nextZ(base),
          minimized: false,
          maximized: false,
          focused: true,
        },
      ]
    })
  }, [])

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id))
  }, [])

  const focusWindow = useCallback((id: string) => {
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(w => w.z))
      return prev.map(w => w.id === id
        ? { ...w, focused: true, minimized: false, z: maxZ + 1 }
        : { ...w, focused: false }
      )
    })
  }, [])

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x: Math.max(0, x), y: Math.max(0, y) } : w))
  }, [])

  const toggleMinimize = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w))
  }, [])

  const toggleMaximize = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w))
  }, [])

  return { windows, openWindow, closeWindow, focusWindow, moveWindow, toggleMinimize, toggleMaximize }
}
