'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { parseHtmlFile } from '@/lib/parseHtmlFile'
import LivePreview from '@/components/preview/LivePreview'

interface HtmlFile {
  id: string
  name: string
  html_content: string
  css_content: string
  js_content: string
  tags: string[]
  created_at: string
}

export default function FileLibrary({ spaceId }: { spaceId: string }) {
  const [files, setFiles] = useState<HtmlFile[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<HtmlFile | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  async function loadFiles() {
    const { data } = await supabase
      .from('html_files')
      .select('id, name, html_content, css_content, js_content, tags, created_at')
      .eq('space_id', spaceId)
      .order('created_at', { ascending: false })
    setFiles(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadFiles() }, [spaceId])

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingId) renameInputRef.current?.select()
  }, [renamingId])

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
  }, [spaceId, supabase])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/html': ['.html', '.htm'] },
    noClick: files.length > 0,
  })

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  async function deleteFile(id: string) {
    await supabase.from('html_files').delete().eq('id', id)
    if (selected?.id === id) setSelected(null)
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  function startRename(file: HtmlFile) {
    setRenamingId(file.id)
    setRenameValue(file.name)
  }

  async function commitRename(id: string) {
    const trimmed = renameValue.trim()
    if (!trimmed) { cancelRename(); return }
    await supabase.from('html_files').update({ name: trimmed }).eq('id', id)
    setFiles(prev => prev.map(f => f.id === id ? { ...f, name: trimmed } : f))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, name: trimmed } : prev)
    setRenamingId(null)
  }

  function cancelRename() {
    setRenamingId(null)
    setRenameValue('')
  }

  function openInViewer(file: HtmlFile) {
    sessionStorage.setItem('op_viewer_file', JSON.stringify({
      html: file.html_content,
      css: file.css_content,
      js: file.js_content,
      name: file.name,
    }))
    router.push(`/spaces/${spaceId}/viewer`)
  }

  return (
    <div className="flex h-full min-h-0">
      {/* Sidebar */}
      <div className="w-[272px] shrink-0 border-r border-ink flex flex-col bg-paper">

        {/* Search */}
        <div className="h-[var(--spacing-bar)] border-b border-ink flex items-center font-mono text-[8px] tracking-widest">
          <span className="w-[54px] h-full flex items-center px-2.5 border-r border-ink text-ink-faint uppercase text-[8px]">find</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="filter…"
            className="flex-1 h-full px-2.5 bg-transparent outline-none text-[10px] uppercase tracking-widest"
          />
        </div>

        {/* Upload */}
        <div {...getRootProps()} className="border-b border-ink">
          <input {...getInputProps()} />
          <button
            className={`w-full h-[var(--spacing-bar)] font-mono text-[8px] tracking-[0.18em] uppercase transition-colors ${
              isDragActive
                ? 'bg-ink text-bone'
                : 'text-ink-faint hover:bg-ink hover:text-bone'
            }`}
          >
            {uploading ? '· importing ·' : isDragActive ? '· drop to import ·' : '+ import .html'}
          </button>
        </div>

        {/* Section header */}
        <div className="h-6 flex items-center justify-between px-2.5 border-b border-ink bg-bone-dim font-mono text-[8px] tracking-widest text-ink-faint uppercase sticky top-0">
          <span>§ Active Files</span>
          <span>{String(filtered.length).padStart(2, '0')}</span>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-auto bg-bone-soft">
          {loading ? (
            <p className="font-mono text-[8px] text-ink-faint tracking-widest uppercase px-2.5 py-3">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="font-mono text-[8px] text-ink-faint tracking-widest uppercase px-2.5 py-3 italic">
              {files.length === 0 ? 'Drop .html files to import' : 'No results'}
            </p>
          ) : (
            filtered.map((file, i) => (
              <div
                key={file.id}
                onClick={() => renamingId !== file.id && setSelected(file)}
                className={`group h-[42px] grid grid-cols-[34px_1fr_auto] items-center gap-2 px-2.5 border-b border-ink/10 cursor-pointer transition-colors ${
                  selected?.id === file.id
                    ? 'bg-ink text-bone'
                    : 'hover:bg-ink/5 text-ink'
                }`}
              >
                <span className={`font-mono text-[9px] ${selected?.id === file.id ? 'text-bone/50' : 'text-ink-faint'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {renamingId === file.id ? (
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') commitRename(file.id)
                      if (e.key === 'Escape') cancelRename()
                    }}
                    onBlur={() => commitRename(file.id)}
                    onClick={e => e.stopPropagation()}
                    className="flex-1 bg-bone border border-ink px-1.5 py-0.5 font-mono text-[10px] outline-none uppercase tracking-wider min-w-0"
                  />
                ) : (
                  <div className="min-w-0">
                    <div className="text-[10px] font-extrabold tracking-wider leading-tight truncate uppercase">{file.name}</div>
                  </div>
                )}

                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={e => { e.stopPropagation(); startRename(file) }} title="Rename"
                    className="w-5 h-5 flex items-center justify-center font-mono text-[10px] hover:bg-ink/10 transition-colors">✎</button>
                  <button onClick={e => { e.stopPropagation(); openInViewer(file) }} title="Open in viewer"
                    className="w-5 h-5 flex items-center justify-center font-mono text-[10px] hover:bg-ink/10 transition-colors">↗</button>
                  <button onClick={e => { e.stopPropagation(); deleteFile(file.id) }} title="Delete"
                    className="w-5 h-5 flex items-center justify-center font-mono text-[10px] hover:bg-oxide hover:text-bone transition-colors">✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preview pane */}
      <div className="flex-1 min-w-0">
        {selected ? (
          <LivePreview
            html={selected.html_content}
            css={selected.css_content}
            js={selected.js_content}
          />
        ) : (
          <div className="h-full flex items-center justify-center mesh-overlay">
            <p className="relative z-10 font-mono text-[9px] text-ink-faint tracking-widest uppercase">Select a file to preview</p>
          </div>
        )}
      </div>
    </div>
  )
}
