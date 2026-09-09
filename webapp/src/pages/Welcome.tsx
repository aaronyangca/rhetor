import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wordmark } from '../components/Logo'

/* Landing page — the "Classical" terracotta-and-cream design. Copy is final;
 * do not rewrite it. The product-preview panel is a static placeholder. */

const VERBS = ['ameliorating', 'bolstering', 'strengthening', 'sharpening', 'improving']

/**
 * The rotating hero verb. A hidden sizer span measures the current word; the
 * visible word is absolutely positioned in a slot whose width animates to that
 * measurement, so the line closes up smoothly instead of jumping. Re-measures
 * on resize and once web fonts have loaded.
 */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

function RotatingVerb() {
  const [index, setIndex] = useState(0)
  const [width, setWidth] = useState(0)
  const [reduced] = useState(prefersReducedMotion)
  const sizerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => setIndex((n) => (n + 1) % VERBS.length), 2800)
    return () => window.clearInterval(id)
  }, [reduced])

  useLayoutEffect(() => {
    let cancelled = false
    const measure = () => {
      const el = sizerRef.current
      if (el && !cancelled) setWidth(el.getBoundingClientRect().width)
    }
    measure()
    window.addEventListener('resize', measure)
    if (document.fonts?.ready) void document.fonts.ready.then(measure)
    return () => {
      cancelled = true
      window.removeEventListener('resize', measure)
    }
  }, [index])

  return (
    <span
      className="relative inline-block whitespace-nowrap"
      style={{
        width: width ? `${width}px` : undefined,
        transition: 'width .42s cubic-bezier(.4,0,.2,1)',
      }}
    >
      <span ref={sizerRef} aria-hidden className="invisible inline-block whitespace-nowrap">
        {VERBS[index]}
      </span>
      <span
        key={index}
        className="absolute top-0 left-0 whitespace-nowrap text-accent-800"
        style={reduced ? undefined : { animation: 'rh-verb-in .46s ease both' }}
      >
        {VERBS[index]}
      </span>
    </span>
  )
}

const HERO_PHOTO: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  height: 900,
  backgroundImage: "url('/forum-illustration.webp')",
  backgroundSize: 'cover',
  backgroundPosition: '50% 34%',
  filter: 'saturate(1.02) contrast(1.02)',
  opacity: 0.96,
  maskImage:
    'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 46%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.18) 88%, rgba(0,0,0,0) 100%)',
  WebkitMaskImage:
    'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 46%, rgba(0,0,0,0.62) 70%, rgba(0,0,0,0.18) 88%, rgba(0,0,0,0) 100%)',
  pointerEvents: 'none',
}

const HERO_WASH: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  height: 900,
  background:
    'radial-gradient(760px 400px at 50% 26%, color-mix(in srgb, #fbf3e6 84%, transparent) 0%, color-mix(in srgb, #fbf3e6 52%, transparent) 62%, transparent 100%), ' +
    'linear-gradient(to bottom, color-mix(in srgb, #f7ecdb 76%, transparent) 0%, color-mix(in srgb, #f7ecdb 58%, transparent) 34%, color-mix(in srgb, var(--color-background) 40%, transparent) 64%, var(--color-background) 100%)',
  pointerEvents: 'none',
}

const CREAM_SHADOW = '0 1px 26px rgba(251,243,230,.95), 0 1px 3px rgba(251,243,230,.9)'

function Nav() {
  return (
    <nav className="flex h-[72px] items-center justify-between gap-6 px-[clamp(20px,5vw,64px)]">
      <Wordmark className="text-[23px]" />
      <div className="flex items-center gap-7 text-[15px]">
        <a href="#how" className="hidden text-ink-82 hover:text-accent-800 sm:inline">
          How it works
        </a>
        <a href="#how" className="hidden text-ink-82 hover:text-accent-800 sm:inline">
          Scoring
        </a>
        <Link to="/login" className="text-ink-82 hover:text-accent-800">
          Sign in
        </Link>
        <Link
          to="/signup"
          className="rounded-md border border-accent-500 px-[18px] py-[8px] text-[14px] font-medium text-accent-800 transition-colors hover:bg-accent-100"
        >
          Start free trial
        </Link>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1160px] px-[clamp(20px,5vw,48px)] pt-[clamp(48px,7vw,104px)] text-center">
      <h1
        className="m-0 font-heading font-medium text-hero-ink [font-feature-settings:'tnum'_1]"
        style={{
          fontSize: 'clamp(40px, 5.6vw, 80px)',
          lineHeight: 1.06,
          letterSpacing: '-0.012em',
          textShadow: CREAM_SHADOW,
        }}
      >
        <span className="block">
          #1 AI for <RotatingVerb />
        </span>
        <span className="block">your arguments.</span>
      </h1>

      <p
        className="mx-auto mt-7 max-w-[54ch] text-[19.5px] leading-[1.66] text-[#2b241f]"
        style={{ textShadow: '0 1px 18px rgba(251,243,230,.95)' }}
      >
        An AI assistant that makes your own arguments stronger. Generic AI wants to do all the
        thinking for you. We built Rhetor to think with you, not for you. Step inside the AI
        brainstorming process to push your ideas further.
      </p>

      <div className="mt-[34px] flex flex-wrap items-center justify-center gap-7">
        <Link
          to="/signup"
          className="flex min-h-[54px] items-center rounded-md border border-accent-500 px-[34px] text-[17px] font-medium text-accent-800 transition-colors hover:bg-accent-100"
        >
          Start free trial
        </Link>
        <a href="#how" className="text-[16px] text-accent-700 hover:text-accent-800 hover:underline">
          See a worked motion
        </a>
      </div>

      <p
        className="mt-[22px] text-[14.5px] text-hero-sub"
        style={{ textShadow: '0 1px 14px rgba(251,243,230,.9)' }}
      >
        British Parliamentary. Three motions on the trial, no card.
      </p>
    </section>
  )
}

/** Static placeholder — a real argument shown in full, on a raised surface. */
function ProductPanel() {
  return (
    <section className="mx-auto max-w-[1000px] px-[clamp(16px,4vw,48px)] pt-[clamp(44px,5vw,72px)] pb-[clamp(56px,6vw,96px)]">
      <div className="rounded-md border border-ink-16 bg-card p-[clamp(24px,3vw,40px)] text-left shadow-lg">
        <p className="m-0 text-[13px] text-ink-60">Opening Opposition · argument 1</p>
        <h2 className="mt-[10px] mb-4 font-heading text-[clamp(24px,2.4vw,32px)] leading-[1.15] font-normal text-foreground">
          Abolition relocates selection from the fee to the postcode
        </h2>
        <div className="flex flex-col gap-4 text-[15.5px] leading-[1.7] text-ink-90">
          <p className="m-0">
            Claim. Abolishing private schools does not remove selective education. It moves the
            point of selection from the fee to the postcode, and postcodes are far harder to tax
            than fees.
          </p>
          <p className="m-0">
            Mechanism. Families who currently convert money into educational advantage through
            tuition do not stop wanting to convert it once tuition is illegal; they look for the
            nearest available market, and in the UK that market is housing. State secondary
            admissions are overwhelmingly decided by distance from the gate, so a house inside the
            catchment of a strong comprehensive is a direct substitute for a term's fees. Roughly
            six hundred thousand privately educated pupils enter that market at once, bidding
            against families already in it and against each other.
          </p>
          <p className="m-0">
            Evidence. Homes inside the catchment of high-performing English state secondaries
            already sell at a measurable premium over near-identical homes a street outside, and
            the same pattern appears wherever places are allocated by distance rather than by
            test.
          </p>
          <p className="m-0">
            Impact. A fee is visible, annual, and something a government can tax, cap or regulate;
            a house price is none of those. It capitalises into the wealth of families who already
            own, locks in for a generation, and stays invisible to education policy because it is
            not education spending. Selection survives the motion, and the poorest child now
            competes against a mortgage instead of against a bursary.
          </p>
        </div>
      </div>
    </section>
  )
}

const STAGES = [
  {
    numeral: 'I',
    title: 'Bring your idea',
    body: 'Give it the motion, your side, and the line you already have in mind. Rhetor builds the bench out around it — the variants you would have reached eventually, and the ones you wouldn’t.',
  },
  {
    numeral: 'II',
    title: 'Score and rank',
    body: 'Each argument is marked on the axes a judge marks it on: is it true, is it relevant, does the logic hold, does the impact matter. The bench sorts by intrinsic score and shows which stage lost the marks.',
  },
  {
    numeral: 'III',
    title: 'Refine stage by stage',
    body: "Open one stage at a time and rewrite it against the score. Push the mechanism, demand a harder source, weigh the impact against the other side's, and watch the mark move before the round rather than after it.",
  },
]

function HowItWorks() {
  return (
    <section
      id="how"
      className="border-y border-divider"
      style={{
        background:
          'linear-gradient(to bottom, color-mix(in srgb, var(--color-accent-100) 72%, var(--color-background)) 0%, var(--color-background) 100%)',
      }}
    >
      <div className="mx-auto max-w-[1140px] px-[clamp(20px,5vw,48px)] py-[clamp(48px,6vw,88px)] text-center">
        <h2 className="mx-auto max-w-[24ch] font-heading text-[clamp(32px,4vw,52px)] leading-[1.08] font-normal">
          Three stages, the same three you'd do on paper
        </h2>
        <div className="mt-[clamp(34px,4vw,56px)] grid gap-[clamp(28px,3.4vw,52px)] text-left md:grid-cols-3">
          {STAGES.map((stage, i) => (
            <div
              key={stage.numeral}
              className={i > 0 ? 'md:border-l md:border-divider md:pl-[clamp(20px,2.6vw,40px)]' : ''}
            >
              <p className="m-0 font-heading text-[44px] leading-none text-accent-700 [font-feature-settings:'tnum'_1]">
                {stage.numeral}
              </p>
              <h3 className="mt-[14px] font-heading text-[24px] leading-[1.2] font-medium">
                {stage.title}
              </h3>
              <p className="mt-3 text-[16px] leading-[1.7] text-ink-82">{stage.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PullQuote() {
  return (
    <section className="mx-auto max-w-[1140px] px-[clamp(20px,5vw,48px)] py-[clamp(48px,6vw,88px)]">
      <figure className="m-0 max-w-[46ch]">
        <blockquote className="m-0 font-heading text-[clamp(24px,2.7vw,36px)] leading-[1.32] font-normal text-accent-900 italic">
          &ldquo;It marked my second argument down for relevance and it was right. I dropped it and
          won the room on the first one.&rdquo;
        </blockquote>
        <figcaption className="mt-6 text-[15.5px] leading-[1.7] text-ink-70">
          — A. Mensah, university open, semifinalist
        </figcaption>
      </figure>
    </section>
  )
}

function ClosingBand() {
  return (
    <section
      id="pricing"
      style={{ background: 'linear-gradient(160deg, #5b2d10 0%, #7a3f18 55%, #b0602e 100%)' }}
    >
      <div className="mx-auto max-w-[1140px] px-[clamp(20px,5vw,48px)] py-[clamp(52px,7vw,104px)] text-center text-[#f7ecdb]">
        <h2 className="mx-auto max-w-[22ch] font-heading text-[clamp(32px,4.4vw,58px)] leading-[1.05] font-normal text-[#fdf6ea]">
          Your round is Saturday. Your case can be ready tonight.
        </h2>
        <p className="mx-auto mt-5 max-w-[48ch] text-[17px] leading-[1.66] text-[rgba(253,246,234,.8)]">
          Three motions on the free trial, no card. After that it's the price of a coffee a month.
        </p>
        <div className="mt-[30px] flex flex-wrap items-center justify-center gap-[26px]">
          <Link
            to="/signup"
            className="flex min-h-[54px] items-center rounded-md border border-[#f1cfb4] px-[34px] text-[17px] font-medium text-[#fdf6ea] transition-colors hover:bg-white/10"
          >
            Start free trial
          </Link>
          <a href="#how" className="text-[16px] text-[rgba(253,246,234,.82)] hover:underline">
            Read how scoring works
          </a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1140px] flex-wrap justify-between gap-6 border-t border-divider px-[clamp(20px,5vw,48px)] pt-[34px] pb-[56px] text-[14.5px] text-ink-64">
      <Wordmark className="text-[20px]" />
      <span className="flex flex-wrap gap-[26px]">
        <a href="#how" className="hover:text-accent-800">
          How it works
        </a>
        <a href="#how" className="hover:text-accent-800">
          Scoring
        </a>
        <a href="#pricing" className="hover:text-accent-800">
          Pricing
        </a>
        <Link to="/privacy" className="hover:text-accent-800">
          Privacy
        </Link>
        <a href="#pricing" className="hover:text-accent-800">
          Contact
        </a>
      </span>
      <span>© 2026 Rhetor</span>
    </footer>
  )
}

export function Welcome() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div aria-hidden style={HERO_PHOTO} />
        <div aria-hidden style={HERO_WASH} />
        <div className="relative">
          <Nav />
          <Hero />
          <ProductPanel />
        </div>
      </div>
      <HowItWorks />
      <PullQuote />
      <ClosingBand />
      <Footer />
    </div>
  )
}
