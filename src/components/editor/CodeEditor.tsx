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
  '.cm-scroller': { fontFamily: "'Berkeley Mono', 'Fira Mono', monospace", fontSize: '12.5px', lineHeight: '1.6' },
  '.cm-gutters': { background: '#0e1012', borderRight: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)' },
  '.cm-activeLineGutter': { background: 'rgba(255,255,255,0.04)' },
  '.cm-activeLine': { background: 'rgba(255,255,255,0.03)' },
  '.cm-cursor': { borderLeftColor: '#ECE8DF' },
  '.cm-selectionBackground': { background: 'rgba(255,255,255,0.1) !important' },
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
    <div className="flex flex-col h-full min-h-0 border-b border-white/[0.06] last:border-b-0">
      <div className="px-4 py-1.5 bg-[#0e1012] border-b border-white/[0.06] flex items-center justify-between shrink-0">
        <span className="text-[9px] uppercase tracking-[0.28em] text-[#9A948A]/60">{label || LABELS[language]}</span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto bg-[#0e1012]">
        <CodeMirror
          value={value}
          extensions={[getExtension(language), theme]}
          onChange={onChange}
          theme="dark"
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
