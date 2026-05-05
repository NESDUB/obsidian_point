'use client'

import { useState } from 'react'
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

  return (
    <div className="h-screen flex flex-col bg-[#111316]">
      {/* Toolbar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-white/[0.06] shrink-0">
        <span className="text-[10px] uppercase tracking-[0.28em] text-[#9A948A]/60">Viewer</span>
      </div>

      {/* Split */}
      <Group orientation="horizontal" className="flex-1 min-h-0">
        {/* Editor column */}
        <Panel defaultSize={42} minSize={20}>
          <Group orientation="vertical" className="h-full">
            <Panel defaultSize={40} minSize={10}>
              <CodeEditor label="HTML" language="html" value={html} onChange={setHtml} />
            </Panel>
            <Separator className="h-[3px] bg-white/[0.04] hover:bg-white/[0.12] transition-colors cursor-row-resize" />
            <Panel defaultSize={35} minSize={10}>
              <CodeEditor label="CSS" language="css" value={css} onChange={setCss} />
            </Panel>
            <Separator className="h-[3px] bg-white/[0.04] hover:bg-white/[0.12] transition-colors cursor-row-resize" />
            <Panel defaultSize={25} minSize={10}>
              <CodeEditor label="JS" language="javascript" value={js} onChange={setJs} />
            </Panel>
          </Group>
        </Panel>

        <Separator className="w-[3px] bg-white/[0.04] hover:bg-white/[0.12] transition-colors cursor-col-resize" />

        {/* Preview column */}
        <Panel defaultSize={58} minSize={30}>
          <LivePreview html={html} css={css} js={js} />
        </Panel>
      </Group>
    </div>
  )
}
