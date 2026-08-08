export function ChatBubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  const isUser = role === 'user'
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[420px] rounded-[10px] px-4 py-3 text-sm leading-5 whitespace-pre-wrap ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'border border-border bg-card text-foreground'
        }`}
      >
        {content}
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
