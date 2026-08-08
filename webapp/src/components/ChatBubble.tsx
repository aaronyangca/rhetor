import ReactMarkdown from 'react-markdown'

export function ChatBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user'

  // The user's own text is shown verbatim — running it through Markdown would
  // quietly eat asterisks and underscores they meant literally. Only the
  // assistant writes Markdown, so only the assistant gets it rendered.
  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="max-w-[420px] rounded-[10px] bg-primary px-4 py-3 text-sm leading-5 whitespace-pre-wrap text-primary-foreground">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full justify-start">
      {/* Wider than a user bubble: replies carry lists and headings, which read
          badly squeezed into the same width as a one-line question. */}
      <div className="chat-prose max-w-[560px] rounded-[10px] border border-border bg-card px-4 py-3 text-foreground">
        <ReactMarkdown
          components={{
            // Model-generated links, including citations from web search, so
            // they open away from the app and carry no referrer.
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

export function TypingBubble() {
  return (
    <div className="flex w-full justify-start">
      <div className="flex items-center gap-1 rounded-[10px] border border-border bg-card px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  )
}
