'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import CodeEditor from '@/components/editor/CodeEditor'
import LivePreview from '@/components/preview/LivePreview'

const DEFAULT_HTML = `<div class="card">
  <h1>Hello, Obsidian Point</h1>
  <p>Edit the code on the left to see changes here.</p>
  <button onclick="this.textContent = 'Clicked!'">Click me</button>
</div>`

const DEFAULT_CSS = `.card {
  max-width: 480px;
  margin: 60px auto;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 12px;
  font-family: system-ui, sans-serif;
  text-align: center;
}

h1 { color: #111; margin-bottom: 12px; }
p  { color: #666; margin-bottom: 24px; }

button {
  padding: 10px 24px;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}`

const DEFAULT_JS = `console.log('Preview ready')`

export default function ViewerPage() {
  const [html, setHtml] = useState(DEFAULT_HTML)
  const [css, setCss] = useState(DEFAULT_CSS)
  const [js, setJs] = useState(DEFAULT_JS)
  const [title, setTitle] = useState('Untitled')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load file passed from library
  useEffect(() => {
    const raw = sessionStorage.getItem('op_viewer_file')
    if (raw) {
      try {
        const file = JSON.parse(raw)
        if (file.html !== undefined) setHtml(file.html)
        if (file.css !== undefined) setCss(file.css)
        if (file.js !== undefined) setJs(file.js)
        if (file.name) setTitle(file.name)
      } catch {}
      sessionStorage.removeItem('op_viewer_file')
    }
  }, [])

  // Sync fullscreen state with browser
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-bone">
      {/* Toolbar */}
      <div className="h-[var(--spacing-bar)] flex items-center border-b border-ink bg-bone-dim shrink-0 font-mono text-[8px] tracking-[0.16em] uppercase">
        <div className="px-3 border-r border-ink h-full flex items-center gap-2">
          <div className="w-1 h-1 bg-ink shrink-0" />
          <b className="font-sans text-[10px] tracking-widest">Live Preview</b>
          <span className="text-ink-faint truncate max-w-[200px]">/ {title}</span>
        </div>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
          className="ml-auto h-full px-3 border-l border-ink text-ink-faint hover:bg-ink hover:text-bone transition-colors"
        >
          {isFullscreen ? (
            // Compress icon
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
              <line x1="10" y1="14" x2="3" y2="21" /><line x1="21" y1="3" x2="14" y2="10" />
            </svg>
          ) : (
            // Expand icon
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          )}
        </button>
      </div>

      {/* Split */}
      <Group orientation="horizontal" className="flex-1 min-h-0">
        {/* Editor column */}
        <Panel defaultSize={42} minSize={20}>
          <Group orientation="vertical" className="h-full">
            <Panel defaultSize={40} minSize={10}>
              <CodeEditor label="HTML" language="html" value={html} onChange={setHtml} />
            </Panel>
            <Separator className="h-[2px] bg-ink/10 hover:bg-ink/30 transition-colors cursor-row-resize" />
            <Panel defaultSize={35} minSize={10}>
              <CodeEditor label="CSS" language="css" value={css} onChange={setCss} />
            </Panel>
            <Separator className="h-[2px] bg-ink/10 hover:bg-ink/30 transition-colors cursor-row-resize" />
            <Panel defaultSize={25} minSize={10}>
              <CodeEditor label="JS" language="javascript" value={js} onChange={setJs} />
            </Panel>
          </Group>
        </Panel>

        <Separator className="w-[2px] bg-ink/10 hover:bg-ink/30 transition-colors cursor-col-resize" />

        {/* Preview column */}
        <Panel defaultSize={58} minSize={30}>
          <LivePreview html={html} css={css} js={js} />
        </Panel>
      </Group>
    </div>
  )
}
