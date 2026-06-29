'use client'

import { useRef } from 'react'
import { X, Minus, Square } from 'lucide-react'
import { OsWindow } from './useDesktop'

interface Props {
  win: OsWindow
  onClose: (id: string) => void
  onFocus: (id: string) => void
  onMinimize: (id: string) => void
  onMaximize: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  children: React.ReactNode
}

export function DesktopWindow({ win, onClose, onFocus, onMinimize, onMaximize, onMove, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  if (win.minimized) return null

  function startDrag(e: React.MouseEvent) {
    // Don't initiate drag if clicking a button
    if ((e.target as HTMLElement).closest('button')) return
    if (e.button !== 0 || win.maximized) return
    e.preventDefault()

    const startMouseX = e.clientX
    const startMouseY = e.clientY
    const startX = win.x
    const startY = win.y

    function onMouseMove(ev: MouseEvent) {
      const newX = Math.max(0, startX + ev.clientX - startMouseX)
      const newY = Math.max(0, startY + ev.clientY - startMouseY)
      // Move the DOM element directly — no React re-render during drag
      if (ref.current && !win.maximized) {
        ref.current.style.left = `${newX}px`
        ref.current.style.top = `${newY}px`
      }
    }

    function onMouseUp(ev: MouseEvent) {
      const newX = Math.max(0, startX + ev.clientX - startMouseX)
      const newY = Math.max(0, startY + ev.clientY - startMouseY)
      onMove(win.id, newX, newY)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const pos = win.maximized
    ? { left: 0, top: 0, width: '100%', height: '100%' }
    : { left: win.x, top: win.y, width: win.w, height: win.h }

  return (
    <div
      ref={ref}
      style={{ ...pos, zIndex: win.z, position: 'absolute' }}
      className={`flex flex-col bg-paper border border-ink overflow-hidden ${
        win.focused
          ? 'shadow-[0_12px_40px_rgba(0,0,0,0.35)]'
          : 'shadow-[0_4px_16px_rgba(0,0,0,0.14)] opacity-90'
      }`}
      onMouseDown={() => onFocus(win.id)}
    >
      {/* Titlebar */}
      <div
        onMouseDown={startDrag}
        className={`h-7 flex items-center justify-between px-3 select-none cursor-default shrink-0 ${
          win.focused ? 'bg-ink text-bone' : 'bg-[#A5A4A0] text-bone/60'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[9px] font-bold tracking-widest truncate uppercase">
            {win.title}
          </span>
        </div>

        <div className="flex items-center gap-0.5 ml-2 shrink-0">
          <button
            onClick={() => onMinimize(win.id)}
            className="w-5 h-5 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Minus size={10} />
          </button>
          <button
            onClick={() => onMaximize(win.id)}
            className="w-5 h-5 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Square size={9} />
          </button>
          <button
            onClick={() => onClose(win.id)}
            className="w-5 h-5 flex items-center justify-center hover:bg-oxide transition-colors"
          >
            <X size={10} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  )
}
