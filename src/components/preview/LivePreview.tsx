'use client'

import { useEffect, useRef, useMemo, useState } from 'react'

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
  externalScripts,
  externalCSS,
}: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [logs, setLogs] = useState<ConsoleEntry[]>([])
  const [consoleOpen, setConsoleOpen] = useState(false)

  const externalScriptsKey = JSON.stringify(externalScripts ?? [])
  const externalCSSKey = JSON.stringify(externalCSS ?? [])

  const srcdoc = useMemo(() => {
    return buildDocument(html, css, js, externalScripts ?? [], externalCSS ?? [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, css, js, externalScriptsKey, externalCSSKey])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    iframe.srcdoc = srcdoc
    setLogs([])
  }, [srcdoc])

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!e.data?.__op_console) return
      const time = new Date().toLocaleTimeString('en-US', { hour12: false })
      setLogs(prev => [...prev.slice(-199), { type: e.data.type, message: e.data.args.join(' '), time }])
      setConsoleOpen(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Preview iframe */}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-modals"
        className="flex-1 w-full border-0 bg-white"
        title="preview"
      />

      {/* Console panel */}
      {consoleOpen && (
        <div className="h-40 shrink-0 bg-[#0d0d0d] border-t border-white/10 flex flex-col">
          <div className="h-6 flex items-center justify-between px-3 border-b border-white/[0.06] shrink-0">
            <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/30">§ Console</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLogs([])}
                className="font-mono text-[8px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors"
              >
                clear
              </button>
              <button
                onClick={() => setConsoleOpen(false)}
                className="font-mono text-[8px] text-white/20 hover:text-white/50 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto font-mono text-[10px] leading-relaxed p-2 space-y-0.5">
            {logs.length === 0 ? (
              <p className="text-white/20 italic">no output</p>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-white/20 shrink-0">{l.time}</span>
                  <span className={
                    l.type === 'error' ? 'text-red-400' :
                    l.type === 'warn' ? 'text-yellow-400' :
                    'text-emerald-400'
                  }>
                    {l.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Console toggle tab — only visible when console is closed and there are logs */}
      {!consoleOpen && logs.length > 0 && (
        <button
          onClick={() => setConsoleOpen(true)}
          className="h-6 shrink-0 bg-[#0d0d0d] border-t border-white/10 w-full font-mono text-[8px] uppercase tracking-[0.22em] text-white/30 hover:text-white/60 transition-colors"
        >
          § Console ({logs.length})
        </button>
      )}
    </div>
  )
}
