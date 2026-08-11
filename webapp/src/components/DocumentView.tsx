import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * The stage document.
 *
 * GFM is not optional here: idea.md asks for the Stage 1 seed pool and the
 * Stage 2 scoring tables as Markdown tables, and tables are not part of
 * CommonMark. Without this plugin they render as literal rows of pipes.
 * Strikethrough matters for the same reason — a cut argument is struck
 * through rather than deleted, so the record of why it left stays visible.
 */
export function DocumentView({ markdown }: { markdown: string }) {
  return (
    <div className="doc-prose prose prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  )
}
