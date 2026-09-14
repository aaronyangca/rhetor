import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Wordmark } from '../components/Logo'

/**
 * The deep-dive companion to the landing page's "How it works" teaser
 * (Welcome.tsx). Distilled from idea.md for a reader deciding whether to
 * trust the pipeline, not for the model itself — the internal scoring
 * weights, formulas, and pass-by-pass instructions stay in idea.md.
 */
export function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="mx-auto flex max-w-[720px] items-center justify-between px-[clamp(20px,5vw,40px)] py-6">
        <Link to="/">
          <Wordmark className="text-[21px]" />
        </Link>
        <Link to="/" className="text-[14px] text-accent-700 hover:text-accent-800 hover:underline">
          Back to home
        </Link>
      </nav>

      <main className="mx-auto max-w-[720px] px-[clamp(20px,5vw,40px)] pb-24 text-[15.5px] leading-[1.7] text-foreground">
        <h1 className="font-heading text-[38px] leading-[1.1] font-normal">How Rhetor works</h1>

        <p className="mt-6">
          Every case Rhetor builds goes through the same three-stage pipeline, whether it takes
          thirty seconds or the night before your round. Nothing gets scored before it has
          actually been built out, and nothing skips a stage. Here is what happens at each one.
        </p>

        <Section title="Stage 1: Ideas">
          <p>
            The first stage is not about writing arguments. It is about generating as many
            workable seeds as possible: a claim, a rough mechanism, a named impact area, one line
            each. Quality checks are deliberately switched off here, because judging ideas while
            you are still generating them is what keeps a pool small and predictable before it has
            a chance to get interesting.
          </p>
          <p className="mt-3">Rhetor works four passes across your motion:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Values pass.</strong> Which normative arguments does the motion activate?
              Autonomy, fairness, harm, legitimacy, and so on, each checked against your specific
              side.
            </li>
            <li>
              <strong>Domain pass.</strong> Who is actually affected, and where? Economic, social,
              legal, psychological, every domain the motion touches, worked from the impact
              outward.
            </li>
            <li>
              <strong>Combination pass.</strong> Cross a value from the first pass with a domain
              from the second. This is where the less obvious arguments come from: a labour-dignity
              frame applied to an environmental motion, a due-process frame applied to a technology
              motion.
            </li>
            <li>
              <strong>Coverage check.</strong> Which domains produced nothing? Which frames never
              got used? Rhetor forces at least one attempt into every gap, and flags the arguments
              any debater would reach for in the first thirty seconds so they do not crowd out the
              less obvious ones.
            </li>
          </ul>
          <p className="mt-3">
            By the end of Stage 1 you typically have twenty to twenty-five seeds on each side, not
            because more is automatically better, but because judging too early is the single
            biggest reason an AI-generated pool stays shallow.
          </p>
        </Section>

        <Section title="Stage 2: Develop and score" id="scoring">
          <p>
            Every seed that cleared Stage 1 gets built out in full before anything is judged: a
            one-sentence Claim, a Mechanism written as an explicit chain of steps (not a paragraph
            describing the topic), Evidence carrying its own confidence flag, and an Impact that
            names who is affected and by how much. A rough one-line seed cannot be scored honestly;
            only the developed version can.
          </p>
          <p className="mt-3">Once built out, every argument is checked against three things:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong>Claim Clarity.</strong> Is the position stated in one sentence the other side
              would actually have to engage with, not one they would simply concede and move past?
            </li>
            <li>
              <strong>Mechanism.</strong> Does the chain prove the claim is likely, not just
              possible? Each step has to hold on its own, without borrowing plausibility from a
              historical precedent that was never actually connected to this case.
            </li>
            <li>
              <strong>Impact & Weighing.</strong> Does it say why this matters more than what it is
              being traded against, using real dimensions (breadth, depth, probability, timeframe,
              reversibility) rather than "this affects everyone"?
            </li>
          </ul>
          <p className="mt-3">
            Arguments that only survive because a step got skipped, or because the impact was
            asserted rather than earned, get cut here. This is the stage that turns a wide pool
            into a shortlist worth trusting.
          </p>
        </Section>

        <Section title="Stage 3: Final ranking">
          <p>
            The last stage is not about whether an argument is good on its own. It is about
            whether it is right for this round: does it sit on the motion's actual contested
            ground, or somewhere a competent opposing team could ignore entirely? And does it fit
            your bench? Opening benches should define the core terrain; Closing benches are
            checked against the opening half's material specifically, so an argument that just
            repeats it with a different noun gets deprioritized, while one that builds something
            genuinely new on shared ground does not.
          </p>
          <p className="mt-3">
            Final Ranking outputs a ranked shortlist of four. A BP case usually runs the top one or
            two; longer formats can draw further down the list.
          </p>
        </Section>

        <Section title="The standard every argument is held to">
          <p>
            Every Claim, Mechanism, and Impact has to survive being said out loud to an ordinary,
            broadly informed judge, not a specialist. That is not a rule about using simpler
            words; it is a rule about whether the sentence names an actual stake. "Epistemic
            autonomy" failing isn't fixed by shortening it to "thought autonomy." It is fixed by
            writing the sentence a real person would say: "the right to decide for yourself with
            the full picture." If the plain version sounds weaker than the jargon, that is a sign
            the mechanism underneath still needs work, not a reason to keep the jargon.
          </p>
        </Section>

        <p className="mt-10 border-t border-divider pt-6 text-[15.5px]">
          Ready to build your first case?{' '}
          <Link to="/signup" className="text-accent-700 hover:text-accent-800 hover:underline">
            Start free trial
          </Link>
          .
        </p>
      </main>
    </div>
  )
}

function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-8 scroll-mt-8">
      <h2 className="font-heading text-[22px] font-normal">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}
