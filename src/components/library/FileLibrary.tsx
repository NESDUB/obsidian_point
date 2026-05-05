'use client'

import { useCallback, useEffect, useState } from 'react'
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
    noClick: files.length > 0, // only click-to-open when empty
  })

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  async function deleteFile(id: string) {
    await supabase.from('html_files').delete().eq('id', id)
    if (selected?.id === id) setSelected(null)
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  function openInViewer(file: HtmlFile) {
    // Store in sessionStorage so the viewer can pick it up
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
      {/* Sidebar: file list */}
      <div
        {...(files.length === 0 ? getRootProps() : {})}
        className="w-64 shrink-0 border-r border-white/[0.06] flex flex-col"
      >
        {files.length === 0 && <input {...getInputProps()} />}

        {/* Search */}
        <div className="p-3 border-b border-white/[0.06]">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full bg-white/[0.05] rounded-lg px-3 py-1.5 text-[12px] text-[#ECE8DF] placeholder:text-[#9A948A]/50 outline-none focus:bg-white/[0.08] transition-colors"
          />
        </div>

        {/* Upload button (always available) */}
        <div {...getRootProps()} className="px-3 py-2 border-b border-white/[0.06]">
          <input {...getInputProps()} />
          <button
            className={`w-full py-2 rounded-lg text-[11px] font-medium transition-colors border border-dashed ${
              isDragActive
                ? 'border-[#ECE8DF]/60 bg-white/10 text-[#ECE8DF]'
                : 'border-white/[0.12] text-[#9A948A] hover:text-[#ECE8DF] hover:border-white/30'
            }`}
          >
            {uploading ? 'Importing…' : isDragActive ? 'Drop to import' : '+ Import .html'}
          </button>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-auto py-1">
          {loading ? (
            <p className="text-[#9A948A]/40 text-xs px-4 py-3">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-[#9A948A]/40 text-xs px-4 py-3 italic">
              {files.length === 0 ? 'Drop .html files to import' : 'No results'}
            </p>
          ) : (
            filtered.map(file => (
              <div
                key={file.id}
                onClick={() => setSelected(file)}
                className={`group flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${
                  selected?.id === file.id
                    ? 'bg-white/[0.08] text-[#ECE8DF]'
                    : 'text-[#9A948A] hover:bg-white/[0.04] hover:text-[#ECE8DF]'
                }`}
              >
                <span className="text-[12px] truncate">{file.name}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                  <button
                    onClick={e => { e.stopPropagation(); openInViewer(file) }}
                    title="Open in viewer"
                    className="text-[10px] px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors"
                  >
                    ↗
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); deleteFile(file.id) }}
                    title="Delete"
                    className="text-[10px] px-1.5 py-0.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
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
          <div className="h-full flex items-center justify-center">
            <p className="text-[#9A948A]/40 text-sm">Select a file to preview</p>
          </div>
        )}
      </div>
    </div>
  )
}
