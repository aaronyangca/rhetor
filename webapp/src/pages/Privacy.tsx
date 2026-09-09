import { Link } from 'react-router-dom'
import { Wordmark } from '../components/Logo'

const UPDATED = '8 September 2026'
const CONTACT = 'privacy@rhetor.app'

/**
 * A plain-language privacy policy that reflects what the app actually does. It
 * is a starting template — have it reviewed before relying on it commercially.
 */
export function Privacy() {
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
        <h1 className="font-heading text-[38px] leading-[1.1] font-normal">Privacy Policy</h1>
        <p className="mt-2 text-[14px] text-ink-60">Last updated {UPDATED}</p>

        <p className="mt-6">
          Rhetor helps you develop and score arguments for British Parliamentary debate. You
          connect your own AI provider account (OpenAI, Anthropic, or Google), and Rhetor uses it
          to run the argument pipeline. This policy explains what we collect, why, and who can see
          it.
        </p>

        <Section title="Information we collect">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Account details.</strong> Your email address and a password, which we store
              only as a salted hash — we never keep your password in readable form.
            </li>
            <li>
              <strong>AI provider API keys.</strong> The keys you add for OpenAI, Anthropic, or
              Google. They are encrypted at rest and are never shown back to you after entry — the
              settings page displays only a masked value with a “replace” action.
            </li>
            <li>
              <strong>Your content.</strong> The motions, positions, generated argument documents,
              and chat messages you create in the app.
            </li>
            <li>
              <strong>Basic technical data.</strong> Standard web-server logs, such as IP address,
              browser type, and request timestamps.
            </li>
          </ul>
          <p className="mt-3">
            We do not use advertising or third-party analytics trackers, and we do not sell or rent
            your data to anyone.
          </p>
        </Section>

        <Section title="How we use it">
          <p>
            We use your information only to operate Rhetor: to sign you in, to run generation and
            scoring when you send a message or advance a stage, to show you your saved motions, and
            to keep the service secure and working.
          </p>
        </Section>

        <Section title="Sharing with third parties">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>AI providers.</strong> When you send a message or advance a stage, the text
              of that motion and the chat history for the current stage are sent to the provider
              you selected (OpenAI, Anthropic, or Google), authenticated with your own key. That
              provider’s handling of the request is governed by your agreement with them, not this
              policy. Rhetor does not pay for or proxy those calls.
            </li>
            <li>
              <strong>Infrastructure.</strong> We use a hosting provider and a managed database to
              run the service. They process data on our behalf under their own security terms.
            </li>
            <li>
              <strong>Legal.</strong> We may disclose information if required by law or to protect
              the rights, safety, or property of Rhetor or its users.
            </li>
          </ul>
        </Section>

        <Section title="Who can see your content">
          <p>
            You can see your own motions and messages. While Rhetor is in closed beta, the site
            administrators also have read access to all accounts’ motions and chat history, for
            support, debugging, and abuse prevention. Administrators never have access to your
            API keys. We will narrow this access and update this policy before opening the service
            more widely.
          </p>
        </Section>

        <Section title="Security">
          <p>
            API keys are encrypted at rest with symmetric encryption and are decrypted only
            in memory, at the moment a call is made on your behalf. Passwords are hashed. No system
            is perfectly secure, but we take reasonable measures to protect your data.
          </p>
        </Section>

        <Section title="Keeping and deleting data">
          <p>
            You can delete any motion at any time from the sidebar; deleting a motion removes its
            documents and messages. You can remove a stored API key from the settings page. To
            delete your account and everything associated with it, email us at{' '}
            <a
              href={`mailto:${CONTACT}`}
              className="text-accent-700 hover:text-accent-800 hover:underline"
            >
              {CONTACT}
            </a>{' '}
            and we will action it.
          </p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            If we change this policy we will update the date above, and for material changes we
            will give notice in the app before they take effect.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions about privacy:{' '}
            <a
              href={`mailto:${CONTACT}`}
              className="text-accent-700 hover:text-accent-800 hover:underline"
            >
              {CONTACT}
            </a>
            .
          </p>
        </Section>

        <p className="mt-10 border-t border-divider pt-4 text-[13px] text-ink-60">
          This document is a plain-language starting template. Have it reviewed by someone
          qualified before relying on it for a commercial launch or in a jurisdiction with
          specific requirements (GDPR, CCPA, and similar).
        </p>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-heading text-[22px] font-normal">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  )
}
