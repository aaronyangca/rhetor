# Rhetor → shadcn/ui

Everything needed to keep this visual identity in a real codebase.

## Install

```bash
npx shadcn@latest init      # pick: New York, CSS variables = yes
```

Then copy these files in:

| File here | Goes to |
| --- | --- |
| `globals.css` | `app/globals.css` (keep your `@tailwind` lines at the top) |
| `tailwind.config.ts` | merge the `theme.extend` block into your config |
| `layout.tsx` | `app/layout.tsx` — loads Cormorant Garamond + Lora |
| `button.tsx` | `components/ui/button.tsx` — overwrites shadcn's default |

Nothing else needs changing: every other shadcn component reads
`--background`, `--border`, `--primary` etc. and inherits the look.

## The four rules that make it look like Rhetor

1. **Buttons are outlined, not filled.** `button.tsx` here does that. If you
   regenerate the component from shadcn, you lose it.
2. **Bold is retired.** Headings cap at `font-medium` (500); the bigger the
   type, the lighter it sets — the hero `h1` is `font-normal`.
3. **Hairlines, not cards.** Structure comes from `border-border` rules and
   whitespace. Reserve boxed surfaces (`bg-card`) for genuinely discrete
   things like the argument panel.
4. **No colored pills for metadata.** Scores, ranks and stage labels set as
   plain `text-muted-foreground`. This was a deliberate call — badges read
   as less trustworthy.

## Contrast note

The accent at full strength (`--accent-500`, #c67139) clears 3:1 — fine for
icons, large type and chrome, not for body copy. For paragraph-size text in
the accent use `text-accent-700` or deeper.

## Converting the pages

`Rhetor Forum.dc.html` (landing) and `Rhetor Chat.dc.html` (app) use inline
`style` attributes referencing `var(--color-*)`. To port a page, hand your
coding agent that file plus this folder and ask it to convert to Tailwind
classes reusing these tokens. The mapping is mechanical:

```
var(--color-bg)       -> bg-background
var(--color-surface)  -> bg-card
var(--color-text)     -> text-foreground
var(--color-accent)   -> accent-500 (border-accent-500 / text-accent-700)
var(--color-divider)  -> border-border
var(--font-heading)   -> font-heading
var(--font-body)      -> font-body
```

One piece needs real logic rather than a class swap: the rotating headline
verb ("ameliorating / bolstering / strengthening / sharpening / improving").
It measures each word in a hidden sizer span and animates the slot's width so
the line closes up instead of jumping. `useState` + `useRef` + a
`ResizeObserver`, or a `framer-motion` `layout` prop on the slot.
