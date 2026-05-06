'use client'

import { useEffect } from 'react'
import { motion, useMotionValue, useDragControls } from 'framer-motion'
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
  const x = useMotionValue(win.x)
  const y = useMotionValue(win.y)
  const dragControls = useDragControls()

  // Sync if position is changed externally (e.g. maximize resets to 0,0)
  useEffect(() => { x.set(win.x) }, [win.x])
  useEffect(() => { y.set(win.y) }, [win.y])

  if (win.minimized) return null

  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.94, opacity: 0 }}
      transition={{ type: 'spring', damping: 26, stiffness: 240 }}
      drag={!win.maximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={() => onMove(win.id, x.get(), y.get())}
      style={{
        position: 'absolute',
        x: win.maximized ? 0 : x,
        y: win.maximized ? 0 : y,
        width: win.maximized ? '100%' : win.w,
        height: win.maximized ? '100%' : win.h,
        zIndex: win.z,
      }}
      onMouseDown={() => onFocus(win.id)}
      className={`flex flex-col bg-paper border border-ink overflow-hidden ${
        win.focused
          ? 'shadow-[0_12px_40px_rgba(0,0,0,0.32)]'
          : 'shadow-[0_4px_16px_rgba(0,0,0,0.14)] opacity-90'
      }`}
    >
      {/* Titlebar — drag handle */}
      <div
        onPointerDown={e => {
          if ((e.target as HTMLElement).closest('button')) return
          if (win.maximized) return
          dragControls.start(e)
        }}
        className={`h-7 flex items-center justify-between px-3 select-none shrink-0 ${
          win.maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        } ${
          win.focused ? 'bg-ink text-bone' : 'bg-[#A5A4A0] text-bone/60'
        }`}
      >
        <span className="font-mono text-[9px] font-bold tracking-widest truncate uppercase">
          {win.title}
        </span>

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
    </motion.div>
  )
}
