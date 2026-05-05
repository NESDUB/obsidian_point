'use client'

import dynamic from 'next/dynamic'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { EditorView } from '@uiw/react-codemirror'

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false })

type Language = 'html' | 'css' | 'javascript'

interface CodeEditorProps {
  value: string
  language: Language
  onChange: (value: string) => void
  label: string
}

const theme = EditorView.theme({
  '&': { background: 'transparent', height: '100%' },
  '.cm-scroller': { fontFamily: "var(--font-mono, 'DM Mono', monospace)", fontSize: '12px', lineHeight: '1.65' },
  '.cm-gutters': { background: '#D1D0CC', borderRight: '1px solid rgba(20,20,20,0.15)', color: 'rgba(20,20,20,0.35)' },
  '.cm-activeLineGutter': { background: 'rgba(20,20,20,0.06)' },
  '.cm-activeLine': { background: 'rgba(20,20,20,0.04)' },
  '.cm-cursor': { borderLeftColor: '#141414' },
  '.cm-selectionBackground': { background: 'rgba(20,20,20,0.12) !important' },
})

function getExtension(language: Language) {
  switch (language) {
    case 'html': return html()
    case 'css': return css()
    case 'javascript': return javascript()
  }
}

const LABELS: Record<Language, string> = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JS',
}

export default function CodeEditor({ value, language, onChange, label }: CodeEditorProps) {
  return (
    <div className="flex flex-col h-full min-h-0 border-b border-ink/10 last:border-b-0">
      <div className="px-3 h-6 bg-bone-dim border-b border-ink flex items-center justify-between shrink-0">
        <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-ink-faint font-bold">{label || LABELS[language]}</span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto bg-paper">
        <CodeMirror
          value={value}
          extensions={[getExtension(language), theme]}
          onChange={onChange}
          theme="light"
          height="100%"
          style={{ height: '100%' }}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightActiveLine: true,
          }}
        />
      </div>
    </div>
  )
}
