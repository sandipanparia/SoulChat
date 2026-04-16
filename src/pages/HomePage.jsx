import { Link } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'

const steps = [
  {
    title: '1. Create a Memory Avatar',
    text: 'Go to Create Avatar and add name, relation, photos, voice notes, stories, and personality details.',
  },
  {
    title: '2. Save and Review',
    text: 'Check the profile preview to make sure tone, values, and favorite phrases feel accurate and respectful.',
  },
  {
    title: '3. Start a Conversation',
    text: 'Open Chat and send your first message. Use quick prompts whenever words feel difficult.',
  },
  {
    title: '4. Keep It Personal',
    text: 'Update memories over time so conversations remain meaningful and close to your loved one.',
  },
]

export function HomePage() {
  return (
    <main className="space-y-8 pb-8">
      <section className="glass-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-violet-500">Welcome to Soul Chat</p>
        <h1 className="mt-3 text-4xl font-semibold text-soul-text">How to use your healing space</h1>
        <p className="mt-3 max-w-2xl text-soul-muted">
          You are now signed in. Follow these steps to create a meaningful memory avatar and begin gentle conversations.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/create-avatar"
            className="rounded-full bg-soul-text px-5 py-3 text-sm font-semibold text-white"
          >
            Start Creating Avatar
          </Link>
          <Link
            to="/dashboard"
            className="rounded-full border border-white/80 bg-white/80 px-5 py-3 text-sm font-semibold text-soul-text"
          >
            Open Dashboard
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {steps.map((step) => (
          <GlassCard key={step.title} className="p-6">
            <h2 className="text-xl font-semibold text-soul-text">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-soul-muted">{step.text}</p>
          </GlassCard>
        ))}
      </section>
    </main>
  )
}
