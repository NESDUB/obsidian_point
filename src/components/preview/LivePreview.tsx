'use client'

import { useEffect, useRef, useState } from 'react'

interface LivePreviewProps {
  html: string
  css: string
  js: string
  externalScripts?: string[]
  externalCSS?: string[]
}

interface ConsoleEntry {
  type: 'log' | 'error' | 'warn'
  message: string
  time: string
}

function buildDocument(html: string, css: string, js: string, externalScripts: string[], externalCSS: string[]) {
  const scriptTags = externalScripts.map(src => `<script src="${src}"></script>`).join('\n')
  const cssTags = externalCSS.map(href => `<link rel="stylesheet" href="${href}">`).join('\n')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${cssTags}
<style>
  body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; box-sizing: border-box; }
  *, *::before, *::after { box-sizing: inherit; }
  ${css}
</style>
<script>
  (function() {
    const send = (type, args) => window.parent.postMessage({
      __op_console: true, type, args: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a))
    }, '*');
    console.log = (...a) => send('log', a);
    console.error = (...a) => send('error', a);
    console.warn = (...a) => send('warn', a);
  })();
<\/script>
${scriptTags}
</head>
<body>
${html}
<script>
  try { ${js} } catch(e) { console.error(e.message) }
<\/script>
</body>
</html>`
}

export default function LivePreview({
  html,
  css,
  js,
  externalScripts = [],
  externalCSS = [],
}: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [logs, setLogs] = useState<ConsoleEntry[]>([])
  const [consoleOpen, setConsoleOpen] = useState(false)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    iframe.srcdoc = buildDocument(html, css, js, externalScripts, externalCSS)
    setLogs([])
  }, [html, css, js, externalScripts, externalCSS])

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data?.__op_console) return
      const time = new Date().toLocaleTimeString('en-US', { hour12: false })
      setLogs(prev => [...prev.slice(-199), { type: e.data.type, message: e.data.args.join(' '), time }])
      if (!consoleOpen) setConsoleOpen(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [consoleOpen])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chrome bar */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-[#f0f0f0] border-b border-black/10 shrink-0">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-[10px] text-black/30 tracking-wide">preview</span>
        <button
          onClick={() => setConsoleOpen(o => !o)}
          className="ml-auto text-[9px] uppercase tracking-widest text-black/30 hover:text-black/60 transition-colors"
        >
          console {logs.length > 0 && `(${logs.length})`}
        </button>
      </div>

      {/* Preview iframe */}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-modals"
        className="flex-1 w-full border-0"
        title="preview"
      />

      {/* Console panel */}
      {consoleOpen && (
        <div className="h-44 shrink-0 bg-[#1a1a1a] border-t border-white/10 flex flex-col">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06]">
            <span className="text-[9px] uppercase tracking-widest text-white/30">Console</span>
            <button onClick={() => setLogs([])} className="text-[9px] text-white/20 hover:text-white/50 transition-colors">clear</button>
          </div>
          <div className="flex-1 overflow-auto font-mono text-[11px] p-2 space-y-0.5">
            {logs.length === 0 ? (
              <p className="text-white/20 italic">no output</p>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-white/20 shrink-0">{l.time}</span>
                  <span className={l.type === 'error' ? 'text-red-400' : l.type === 'warn' ? 'text-yellow-400' : 'text-green-400'}>
                    {l.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
