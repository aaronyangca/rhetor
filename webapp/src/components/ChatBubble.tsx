import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * The two voices are made legible by a border, not a fill: the user's message
 * sits in a bordered surface at the right; Rhetor's reply has no surface at
 * all — full column width, a small muted label above it, then prose.
 */
export function ChatBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  if (role === 'user') {
    // Shown verbatim — running it through Markdown would quietly eat asterisks
    // and underscores the user meant literally.
    return (
      <div className="max-w-[70%] self-end rounded-lg border border-ink-15 bg-card px-4 py-[13px] text-[15.5px] leading-[1.6] whitespace-pre-wrap">
        {content}
      </div>
    )
  }

  return (
    <div className="max-w-full text-[15.5px] leading-[1.68]">
      <p className="mb-3 text-[13px] text-ink-58">Rhetor</p>
      <div className="chat-prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ children, ...props }) => (
              <a {...props} target="_blank" rel="noreferrer noopener">
                {children}
              </a>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  )
}
