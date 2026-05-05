'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { parseHtmlFile } from '@/lib/parseHtmlFile'
import CodeEditor from '@/components/editor/CodeEditor'
import LivePreview from '@/components/preview/LivePreview'

interface HtmlFile {
  id: string
  name: string
  html_content: string
  css_content: string
  js_content: string
  created_at: string
}

const DEFAULT_HTML = `<div class="card">
  <h1>Obsidian Point</h1>
  <p>Select a file from the registry or start editing.</p>
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
p  { color: #666; }`

const DEFAULT_JS = `console.log('Studio ready')`

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[40px_1fr_28px] items-center gap-2 px-3 py-1.5 border-b border-ink/10 last:border-b-0 font-mono text-[8px] tracking-wider">
      <span className="text-ink-faint uppercase">{label}</span>
      <div className="h-1 border border-ink/20 relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-ink transition-all duration-700 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-right text-ink-faint">{value}</span>
    </div>
  )
}

export default function CodeStudio({ spaceId, spaceName, spaceEmoji }: { spaceId: string; spaceName?: string; spaceEmoji?: string }) {
  const [files, setFiles] = useState<HtmlFile[]>([])
  const [selected, setSelected] = useState<HtmlFile | null>(null)
  const [html, setHtml] = useState(DEFAULT_HTML)
  const [css, setCss] = useState(DEFAULT_CSS)
  const [js, setJs] = useState(DEFAULT_JS)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(true)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

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

  useEffect(() => {
    if (renamingId) renameInputRef.current?.select()
  }, [renamingId])

  function selectFile(file: HtmlFile) {
    setSelected(file)
    setHtml(file.html_content)
    setCss(file.css_content)
    setJs(file.js_content)
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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'text/html': ['.html', '.htm'] },
    noClick: true,
  })

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))

  async function deleteFile(id: string) {
    await supabase.from('html_files').delete().eq('id', id)
    if (selected?.id === id) {
      setSelected(null)
      setHtml(DEFAULT_HTML)
      setCss(DEFAULT_CSS)
      setJs(DEFAULT_JS)
    }
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  function startRename(file: HtmlFile) {
    setRenamingId(file.id)
    setRenameValue(file.name)
  }

  async function commitRename(id: string) {
    const trimmed = renameValue.trim()
    if (!trimmed) { setRenamingId(null); return }
    await supabase.from('html_files').update({ name: trimmed }).eq('id', id)
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: trimmed } : f))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, name: trimmed } : prev)
    setRenamingId(null)
  }

  const title = selected?.name ?? 'untitled'

  return (
    <div className="h-full flex flex-col bg-bone" {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Drag overlay */}
      {isDragActive && (
        <div className="absolute inset-0 z-50 bg-ink/80 flex items-center justify-center pointer-events-none">
          <p className="font-mono text-bone text-[11px] tracking-[0.28em] uppercase">· drop to import ·</p>
        </div>
      )}

      {/* Top bar */}
      <header className="h-[var(--spacing-bar)] border-b border-ink bg-bone-dim flex items-center shrink-0 font-mono text-[8px] tracking-[0.16em] uppercase divide-x divide-ink z-10">
        <div className="px-3 h-full flex items-center gap-2">
          <div className="w-1 h-1 bg-ink shrink-0" />
          <b className="font-sans text-[10px] tracking-widest">Code Studio</b>
        </div>
        <div className="flex-1 px-3 h-full flex items-center text-ink-faint truncate min-w-0 gap-2">
          {spaceName && <span className="shrink-0">{spaceEmoji} {spaceName}</span>}
          {spaceName && <span className="text-ink/20">/</span>}
          <span className="truncate">{title}.html</span>
        </div>
        <button
          onClick={open}
          className="h-full px-3 text-ink-faint hover:bg-ink hover:text-bone transition-colors shrink-0"
        >
          {uploading ? '· importing ·' : '+ import .html'}
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 272, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.1, duration: 0.35 }}
              className="border-r border-ink bg-paper flex flex-col overflow-hidden shrink-0"
            >
              {/* Sidebar header */}
              <div
                className="h-[var(--spacing-bar)] border-b border-ink bg-ink text-bone flex items-center justify-between px-3 cursor-pointer select-none shrink-0"
                onClick={() => setIsSidebarOpen(false)}
              >
                <div>
                  <div className="font-mono text-[8px] tracking-[0.18em] text-bone/50 mb-0.5">artifacts · private</div>
                  <div className="font-sans font-black text-[11px] tracking-[0.14em]">Registry Space</div>
                </div>
                <ChevronLeft size={12} />
              </div>

              {/* Search */}
              <div className="h-[var(--spacing-bar)] border-b border-ink flex items-center shrink-0">
                <span className="w-[48px] h-full flex items-center justify-center border-r border-ink font-mono text-[8px] text-ink-faint italic shrink-0">find</span>
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="QUERY..."
                  className="flex-1 h-full px-2.5 bg-transparent outline-none font-mono text-[9px] tracking-widest placeholder:text-ink/20 uppercase"
                />
              </div>

              {/* Section label */}
              <div className="h-6 flex items-center justify-between px-3 border-b border-ink bg-bone-dim font-mono text-[8px] tracking-widest text-ink-faint uppercase shrink-0">
                <span>§ Active Artifacts</span>
                <span>{String(filtered.length).padStart(2, '0')}</span>
              </div>

              {/* File list */}
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
                    onClick={() => renamingId !== file.id && selectFile(file)}
                    className={`group flex items-center gap-2 px-3 h-[42px] border-b border-ink/10 cursor-pointer transition-colors ${
                      selected?.id === file.id ? 'bg-ink text-bone' : 'hover:bg-ink/5 text-ink'
                    }`}
                  >
                    <span className={`font-mono text-[9px] shrink-0 ${selected?.id === file.id ? 'text-bone/40' : 'text-ink-faint'}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {renamingId === file.id ? (
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') commitRename(file.id)
                          if (e.key === 'Escape') setRenamingId(null)
                        }}
                        onBlur={() => commitRename(file.id)}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 bg-bone border border-ink px-1.5 py-0.5 font-mono text-[9px] outline-none uppercase tracking-wider min-w-0"
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-extrabold tracking-wider leading-tight truncate uppercase">{file.name}</div>
                      </div>
                    )}

                    <div className={`border px-1.5 py-0.5 font-mono text-[7px] tracking-wider shrink-0 transition-colors ${
                      selected?.id === file.id ? 'border-bone/30 text-bone/50' : 'border-ink/20 text-ink-faint'
                    }`}>
                      HTML
                    </div>

                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); startRename(file) }}
                        className="w-5 h-5 flex items-center justify-center font-mono text-[10px] hover:bg-ink/10 transition-colors"
                        title="Rename"
                      >✎</button>
                      <button
                        onClick={e => { e.stopPropagation(); deleteFile(file.id) }}
                        className="w-5 h-5 flex items-center justify-center font-mono text-[10px] hover:bg-oxide hover:text-bone transition-colors"
                        title="Delete"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Metric rows */}
              <div className="border-t border-ink bg-bone shrink-0">
                <MetricRow label="PRV" value={82} />
                <MetricRow label="EDT" value={isEditorOpen ? 94 : 0} />
                <MetricRow label="MEM" value={48} />
                <MetricRow label="TSK" value={14} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Sidebar open strip */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-4 border-r border-ink bg-bone-dim flex items-center justify-center text-ink hover:bg-ink hover:text-bone transition-colors shrink-0"
          >
            <ChevronRight size={10} />
          </button>
        )}

        {/* Center canvas */}
        <section className="flex-1 flex flex-col min-w-0">

          {/* Preview header bar */}
          <div className="h-7 border-b border-ink bg-bone-soft flex items-center px-3 gap-3 font-mono text-[9px] tracking-widest shrink-0">
            <span className="text-ink/50 font-bold">▶</span>
            <span className="font-bold uppercase text-[8px]">Live Workspace</span>
            <span className="text-ink/30">/</span>
            <span className="text-ink/50 truncate uppercase text-[8px]">{title}.html</span>
            <div className="ml-auto flex items-center h-full divide-x divide-ink/20">
              <button className="px-2 h-full text-ink/40 hover:bg-ink hover:text-bone transition-colors text-[8px] uppercase tracking-widest">Grid</button>
              <button className="px-2 h-full text-ink/40 hover:bg-ink hover:text-bone transition-colors text-[8px] uppercase tracking-widest">Fit</button>
              <button className="px-2 h-full text-ink/40 hover:bg-ink hover:text-bone transition-colors text-[8px] uppercase tracking-widest">↺</button>
            </div>
          </div>

          {/* Dark preview chamber */}
          <div className="flex-1 bg-[#0f1110] relative overflow-hidden">
            {/* Dot grid */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
            />
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 50%)', backgroundSize: '100% 4px' }}
            />
            {/* Corner markers */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-white/25 pointer-events-none" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-white/25 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-white/25 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-white/25 pointer-events-none" />

            {/* Preview iframe fills chamber */}
            <div className="absolute inset-0">
              <LivePreview html={html} css={css} js={js} />
            </div>
          </div>

          {/* Preview footer bar */}
          <div className="h-7 border-t border-ink bg-bone-dim flex items-center divide-x divide-ink font-mono text-[8px] tracking-widest shrink-0">
            <div className="flex-1 flex items-center px-3 gap-3 text-ink/50">
              <div className="w-1.5 h-1.5 bg-ink animate-[pulse_2s_steps(2,end)_infinite]" />
              <span className="uppercase">render locked · stable</span>
            </div>
            <div className="px-3 text-ink/40 uppercase">Zoom 100%</div>
            <div className="px-3 text-ink/30 uppercase">Auto-Fit</div>
          </div>
        </section>

        {/* Right editor panel */}
        <AnimatePresence initial={false}>
          {isEditorOpen && (
            <motion.aside
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 120 }}
              className="w-[300px] border-l border-ink bg-paper flex flex-col shrink-0 overflow-hidden"
            >
              {/* Editor panel header */}
              <div
                className="h-[var(--spacing-bar)] border-b border-ink bg-ink text-bone flex items-center justify-between px-3 cursor-pointer select-none shrink-0"
                onClick={() => setIsEditorOpen(false)}
              >
                <div>
                  <div className="font-mono text-[8px] tracking-[0.18em] text-bone/50 mb-0.5">terminal · raw code</div>
                  <div className="font-sans font-black text-[11px] tracking-[0.14em]">Source Engineering</div>
                </div>
                <ChevronRight size={12} />
              </div>

              {/* Three editors, equal thirds */}
              <div className="flex-1 flex flex-col min-h-0 divide-y divide-ink/20">
                <div className="flex-1 min-h-0">
                  <CodeEditor label="STRUCT · HTML" language="html" value={html} onChange={setHtml} />
                </div>
                <div className="flex-1 min-h-0">
                  <CodeEditor label="VISUAL · CSS" language="css" value={css} onChange={setCss} />
                </div>
                <div className="flex-1 min-h-0">
                  <CodeEditor label="LOGIC · JS" language="javascript" value={js} onChange={setJs} />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Editor open strip */}
        {!isEditorOpen && (
          <button
            onClick={() => setIsEditorOpen(true)}
            className="w-4 border-l border-ink bg-bone-dim flex items-center justify-center text-ink hover:bg-ink hover:text-bone transition-colors shrink-0"
          >
            <ChevronLeft size={10} />
          </button>
        )}
      </div>
    </div>
  )
}
