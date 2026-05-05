/**
 * Parses a single .html file and splits it into HTML body, CSS, and JS.
 * Uses DOMParser — must run client-side only.
 */
export async function parseHtmlFile(file: File): Promise<{
  name: string
  html: string
  css: string
  js: string
}> {
  const text = await file.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/html')

  // Extract and remove all inline <style> tags
  const styleTags = Array.from(doc.querySelectorAll('style'))
  const css = styleTags.map(t => t.textContent ?? '').join('\n\n').trim()
  styleTags.forEach(t => t.remove())

  // Extract and remove all inline <script> tags
  const scriptTags = Array.from(doc.querySelectorAll('script'))
  const js = scriptTags.map(t => t.textContent ?? '').join('\n\n').trim()
  scriptTags.forEach(t => t.remove())

  // Remaining body content
  const html = doc.body.innerHTML.trim()

  // Clean filename for display
  const name = file.name.replace(/\.html?$/i, '').replace(/[-_]/g, ' ')

  return { name, html, css, js }
}
