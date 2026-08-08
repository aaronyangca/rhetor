import ReactMarkdown from 'react-markdown'

export function DocumentView({ markdown }: { markdown: string }) {
  return (
    <div className="doc-prose prose prose-sm max-w-none">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  )
}
