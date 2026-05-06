'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Command } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { parseHtmlFile } from '@/lib/parseHtmlFile'
import CodeEditor from '@/components/editor/CodeEditor'
import LivePreview from '@/components/preview/LivePreview'
import { useDesktop } from './os/useDesktop'
import { DesktopWindow } from './os/DesktopWindow'

interface HtmlFile {
  id: string
  name: string
  html_content: string
  css_content: string
  js_content: string
  created_at: string
}

const DEFAULT_HTML = `<div style="padding:48px;font-family:system-ui,sans-serif;text-align:center;color:#141414;">
  <p style="font-size:11px;letter-spacing:.2em;opacity:.4;text-transform:uppercase;margin-bottom:12px;">OP-LAB · Desktop OS</p>
  <h1 style="font-size:32px;font-weight:900;letter-spacing:-.01em;margin:0 0 12px;">Ready.</h1>
  <p style="font-size:13px;opacity:.5;">Select a file from the registry to begin.</p>
</div>`
const DEFAULT_CSS = ''
const DEFAULT_JS = ''

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[36px_1fr_24px] items-center gap-2 px-3 py-1.5 border-b border-ink/10 last:border-b-0 font-mono text-[8px] tracking-wider">
      <span className="text-ink-faint uppercase">{label}</span>
      <div className="h-1 bg-ink/10 border border-ink/10 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-ink transition-all duration-700" style={{ width: `${value}%` }} />
      </div>
      <span className="text-right text-ink-faint">{value}</span>
    </div>
  )
}

export default function CodeStudio({
  spaceId,
  spaceName,
  spaceEmoji,
}: {
  spaceId: string
  spaceName?: string
  spaceEmoji?: string
}) {
  const supabase = createClient()
  const { windows, openWindow, closeWindow, focusWindow, moveWindow, toggleMinimize, toggleMaximize } = useDesktop()

  const [files, setFiles] = useState<HtmlFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [html, setHtml] = useState(DEFAULT_HTML)
  const [css, setCss] = useState(DEFAULT_CSS)
  const [js, setJs] = useState(DEFAULT_JS)
  const [editorTab, setEditorTab] = useState<'html' | 'css' | 'js'>('html')
  const [launcherOpen, setLauncherOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [time, setTime] = useState('')

  // Clock
  useEffect(() => {
    function tick() { setTime(new Date().toLocaleTimeString('en-GB', { hour12: false })) }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // ⌘K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setLauncherOpen(o => !o)
      }
      if (e.key === 'Escape') setLauncherOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function loadFiles() {
    const { data } = await supabase
      .from('html_files')
      .select('id, name, html_content, css_content, js_content, created_at')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })
    setFiles(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadFiles() }, [spaceId])

  function selectFile(file: HtmlFile) {
    setActiveFileId(file.id)
    setHtml(file.html_content)
    setCss(file.css_content)
    setJs(file.js_content)
    setEditorTab('html')
    openWindow('editor', file.id, file.name)
    openWindow('preview', file.id, `Preview · ${file.name}`)
  }

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return
    setUploading(true)
    try {
      for (const file of accepted) {
        const { name, html, css, js } = await parseHtmlFile(file)
        await supabase.from('html_files').insert({
          space_id: spaceId,
          name,
          html_content: html,
          css_content: css,
          js_content: js,
        })
      }
      await loadFiles()
    } finally {
      setUploading(false)
    }
  }, [spaceId])

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    onDrop,
    accept: { 'text/html': ['.html', '.htm'] },
    noClick: true,
  })

  async function deleteFile(id: string) {
    await supabase.from('html_files').delete().eq('id', id)
    setFiles(prev => prev.filter(f => f.id !== id))
    if (activeFileId === id) {
      setActiveFileId(null)
      setHtml(DEFAULT_HTML)
      setCss(DEFAULT_CSS)
      setJs(DEFAULT_JS)
    }
  }

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
  const activeFile = files.find(f => f.id === activeFileId)

  const LAUNCHER_ACTIONS = [
    { label: 'Open File Registry',    action: () => openWindow('registry') },
    { label: 'Import HTML File',      action: () => { openFilePicker(); setLauncherOpen(false) } },
    { label: 'Open Preview Window',   action: () => openWindow('preview') },
    { label: 'Open System Console',   action: () => openWindow('console') },
  ]

  return (
    <div
      className="h-full flex flex-col bg-bone-dim select-none"
      {...getRootProps()}
      onClick={() => setLauncherOpen(false)}
    >
      <input {...getInputProps()} />

      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute inset-0 z-[9999] bg-ink/75 flex items-center justify-center pointer-events-none">
          <p className="font-mono text-bone text-[11px] tracking-[0.28em] uppercase">· drop to import ·</p>
        </div>
      )}

      {/* Top status bar */}
      <header className="h-[var(--spacing-bar)] border-b border-ink bg-bone-dim flex items-center shrink-0 divide-x divide-ink z-50 font-mono text-[8px] tracking-[0.16em] uppercase">
        <div className="w-10 bg-ink text-bone flex items-center justify-center font-bold shrink-0">OP</div>
        <div className="flex-1 flex items-center px-3 gap-2 min-w-0">
          <div className="w-1.5 h-1.5 bg-ink shrink-0" />
          <span className="font-sans font-extrabold text-[10px] whitespace-nowrap">OP-LAB · Desktop OS</span>
          {spaceName && (
            <span className="text-ink-faint truncate">/ {spaceEmoji} {spaceName}</span>
          )}
        </div>
        <div className="hidden lg:flex items-center gap-6 px-4 text-ink-faint text-[7px]">
          <span>PROC: ARTIFACT_ENGINE</span>
          <span>STATUS: STABLE</span>
        </div>
        <div className="px-3 flex items-center gap-2 text-ink-faint text-[7px] shrink-0">
          <div className="w-1.5 h-1.5 bg-ink animate-pulse" />
          <span>SYNCING</span>
        </div>
      </header>

      {/* Desktop canvas */}
      <div className="flex-1 relative overflow-hidden">
        {/* Desktop texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'><path d='M20 15v10M15 20h10' stroke='%23141414' stroke-width='0.8' stroke-opacity='0.18'/></svg>"), url("data:image/svg+xml;utf8,<svg width='3' height='3' xmlns='http://www.w3.org/2000/svg'><rect width='1' height='1' fill='%23141414' fill-opacity='0.12'/></svg>")`,
            backgroundSize: '40px 40px, 3px 3px',
          }}
        />

        {/* Windows */}
        <AnimatePresence>
          {windows.map(win => (
            <DesktopWindow
              key={win.id}
              win={win}
              onClose={closeWindow}
              onFocus={focusWindow}
              onMinimize={toggleMinimize}
              onMaximize={toggleMaximize}
              onMove={moveWindow}
            >
                {/* ── Registry ── */}
                {win.kind === 'registry' && (
                  <div className="h-full flex flex-col bg-paper">
                    <div className="h-[var(--spacing-bar)] border-b border-ink flex items-center shrink-0">
                      <span className="w-10 h-full flex items-center justify-center border-r border-ink font-mono text-[8px] text-ink-faint shrink-0 uppercase">Fnd</span>
                      <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Query..."
                        className="flex-1 h-full px-2.5 bg-transparent outline-none font-mono text-[9px] tracking-widest placeholder:text-ink/20 uppercase"
                      />
                    </div>

                    <button
                      onClick={openFilePicker}
                      className="h-[var(--spacing-bar)] border-b border-ink font-mono text-[8px] tracking-[0.16em] uppercase text-ink-faint hover:bg-ink hover:text-bone transition-colors shrink-0"
                    >
                      {uploading ? '· importing ·' : '+ import .html'}
                    </button>

                    <div className="h-6 flex items-center justify-between px-3 border-b border-ink bg-bone-dim font-mono text-[8px] tracking-widest text-ink-faint uppercase shrink-0">
                      <span>§ Active Artifacts</span>
                      <span>{String(filtered.length).padStart(2, '0')}</span>
                    </div>

                    <div className="flex-1 overflow-auto bg-bone-soft">
                      {loading ? (
                        <p className="px-3 py-3 font-mono text-[8px] text-ink-faint tracking-widest uppercase">Loading…</p>
                      ) : filtered.length === 0 ? (
                        <p className="px-3 py-3 font-mono text-[8px] text-ink-faint tracking-widest uppercase italic">
                          {files.length === 0 ? 'Drop .html to import' : 'No results'}
                        </p>
                      ) : filtered.map((file, i) => (
                        <div
                          key={file.id}
                          className={`group flex items-center gap-2 px-3 h-[42px] border-b border-ink/10 cursor-pointer transition-colors ${
                            activeFileId === file.id ? 'bg-ink text-bone' : 'hover:bg-ink/5 text-ink'
                          }`}
                          onClick={() => selectFile(file)}
                        >
                          <span className={`font-mono text-[9px] shrink-0 ${activeFileId === file.id ? 'text-bone/40' : 'text-ink-faint'}`}>
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-extrabold tracking-wider truncate uppercase">{file.name}</div>
                          </div>
                          <div className={`border px-1 py-0.5 font-mono text-[7px] shrink-0 transition-colors ${
                            activeFileId === file.id ? 'border-bone/30 text-bone/40' : 'border-ink/20 text-ink-faint'
                          }`}>HTML</div>
                          <button
                            onClick={e => { e.stopPropagation(); deleteFile(file.id) }}
                            className="w-4 h-4 flex items-center justify-center font-mono text-[10px] opacity-0 group-hover:opacity-100 hover:bg-oxide hover:text-bone transition-all shrink-0"
                          >✕</button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-ink bg-bone shrink-0">
                      <MetricBar label="PRV" value={82} />
                      <MetricBar label="EDT" value={activeFileId ? 94 : 0} />
                      <MetricBar label="MEM" value={61} />
                      <MetricBar label="TSK" value={14} />
                    </div>
                  </div>
                )}

                {/* ── Editor ── */}
                {win.kind === 'editor' && (
                  <div className="h-full flex flex-col bg-paper">
                    <div className="h-7 flex items-stretch border-b border-ink bg-bone-dim shrink-0">
                      {(['html', 'css', 'js'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setEditorTab(tab)}
                          className={`px-4 flex items-center font-mono text-[8px] font-bold tracking-[0.2em] border-r border-ink transition-colors uppercase ${
                            editorTab === tab ? 'bg-paper text-ink' : 'text-ink/40 hover:bg-ink/5'
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                      <div className="flex-1 flex items-center justify-end px-2">
                        <span className="font-mono text-[7px] text-ink-faint truncate max-w-[120px]">
                          {activeFile?.name ?? 'untitled'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-h-0">
                      {editorTab === 'html' && (
                        <CodeEditor label="HTML" language="html" value={html} onChange={setHtml} />
                      )}
                      {editorTab === 'css' && (
                        <CodeEditor label="CSS" language="css" value={css} onChange={setCss} />
                      )}
                      {editorTab === 'js' && (
                        <CodeEditor label="JS" language="javascript" value={js} onChange={setJs} />
                      )}
                    </div>

                    <div className="h-7 border-t border-ink bg-bone flex items-stretch divide-x divide-ink shrink-0 font-mono text-[8px] tracking-widest uppercase">
                      <button className="flex-1 hover:bg-ink hover:text-bone transition-colors">Format</button>
                      <button className="px-4 bg-oxide text-bone font-bold hover:opacity-90 transition-opacity">Save</button>
                    </div>
                  </div>
                )}

                {/* ── Preview ── */}
                {win.kind === 'preview' && (
                  <div className="h-full flex flex-col bg-[#0b0c0c] relative">
                    <div
                      className="absolute inset-0 pointer-events-none opacity-15"
                      style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.45) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                      }}
                    />
                    <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/20 pointer-events-none z-10" />
                    <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/20 pointer-events-none z-10" />
                    <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/20 pointer-events-none z-10" />
                    <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/20 pointer-events-none z-10" />

                    <div className="h-6 border-b border-white/10 flex items-center px-3 gap-3 font-mono text-[7px] tracking-[0.2em] text-white/40 shrink-0 z-10">
                      <span className="font-bold text-white/60 uppercase">Render</span>
                      <span className="opacity-30">/</span>
                      <span className="truncate uppercase">{activeFile?.name ?? 'no file'}</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        <span>Live</span>
                      </div>
                    </div>

                    <div className="flex-1 relative z-10">
                      <LivePreview html={html} css={css} js={js} />
                    </div>
                  </div>
                )}

                {/* ── Console ── */}
                {win.kind === 'console' && (
                  <div className="h-full bg-[#080808] font-mono text-[10px] p-4 overflow-auto">
                    <p className="text-white/20 tracking-[0.2em] uppercase">-- op-lab system console --</p>
                    <p className="mt-2 text-green-400">READY :: AWAITING INPUT</p>
                    <div className="mt-4 flex gap-2 items-center text-green-400">
                      <span className="text-white/30">{'>'}</span>
                      <div className="w-2 h-4 bg-green-400 animate-pulse" />
                    </div>
                  </div>
                )}
              </DesktopWindow>
          ))}
        </AnimatePresence>
      </div>

      {/* Launcher */}
      <AnimatePresence>
        {launcherOpen && (
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute bottom-[var(--spacing-bar)] left-0 w-72 bg-paper border border-ink border-b-0 z-[200] flex flex-col overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-10 bg-ink text-bone flex flex-col justify-center px-3 border-b border-white/5 shrink-0">
              <span className="font-mono text-[7px] tracking-[0.18em] text-bone/40 uppercase">System Core · v3</span>
              <span className="font-sans font-black text-[12px] tracking-widest uppercase">OP-LAB OS</span>
            </div>
            {LAUNCHER_ACTIONS.map((cmd, i) => (
              <button
                key={i}
                onClick={() => { cmd.action(); setLauncherOpen(false) }}
                className="h-9 flex items-center justify-between px-3 border-b border-ink/10 last:border-b-0 hover:bg-ink hover:text-bone font-mono text-[9px] tracking-widest uppercase transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-ink-faint">{String(i + 1).padStart(2, '0')}</span>
                  <span>{cmd.label}</span>
                </div>
                <span className="text-ink-faint opacity-40">↵</span>
              </button>
            ))}
            <div className="h-8 grid grid-cols-2 divide-x divide-ink border-t border-ink shrink-0 font-mono text-[8px] tracking-widest uppercase">
              <button className="hover:bg-ink hover:text-bone transition-colors">Sleep</button>
              <button onClick={() => setLauncherOpen(false)} className="bg-oxide text-bone font-bold hover:opacity-90 transition-opacity">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Taskbar */}
      <footer className="h-[var(--spacing-bar)] bg-bone-dim border-t border-ink flex items-stretch shrink-0 z-50 font-mono text-[8px] tracking-[0.15em] uppercase divide-x divide-ink">
        <button
          onClick={e => { e.stopPropagation(); setLauncherOpen(o => !o) }}
          className={`w-28 flex items-center gap-2 px-3 transition-colors shrink-0 ${
            launcherOpen ? 'bg-oxide text-bone' : 'bg-ink text-bone hover:brightness-110'
          }`}
        >
          <Command size={11} />
          <span className="font-sans font-extrabold text-[9px]">Launch</span>
        </button>

        <div className="flex-1 flex items-center px-2 gap-1.5 overflow-x-auto min-w-0">
          {windows.map(win => (
            <button
              key={win.id}
              onClick={() => focusWindow(win.id)}
              className={`h-[18px] px-2.5 flex items-center gap-1.5 border shrink-0 transition-all font-mono text-[7px] tracking-wider uppercase ${
                win.focused && !win.minimized
                  ? 'border-ink bg-bone text-ink'
                  : 'border-ink/20 text-ink/40 hover:bg-ink/5'
              } ${win.minimized ? 'opacity-40' : ''}`}
            >
              <div className={`w-1 h-1 shrink-0 ${win.focused && !win.minimized ? 'bg-ink' : 'bg-ink/20'}`} />
              <span className="truncate max-w-[96px]">{win.title}</span>
            </button>
          ))}
        </div>

        <div className="px-3 flex items-center gap-2 text-ink-faint shrink-0">
          <div className="w-1 h-1 bg-ink animate-[pulse_2s_steps(2,end)_infinite]" />
          <span>{time}</span>
        </div>
      </footer>
    </div>
  )
}
