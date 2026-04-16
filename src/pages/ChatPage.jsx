import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Mic, SendHorizonal } from 'lucide-react'
import { chatPrompts, memoryProfiles } from '../data/soulData'

export function ChatPage() {
  const { avatarId } = useParams()

  const profile = useMemo(
    () => memoryProfiles.find((entry) => entry.id === avatarId) ?? memoryProfiles[0],
    [avatarId],
  )

  return (
    <main className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="glass-card rounded-3xl p-6">
        <img src={profile.image} alt={profile.name} className="h-64 w-full rounded-3xl object-cover" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">{profile.relation}</p>
        <h1 className="mt-2 text-3xl font-semibold text-soul-text">{profile.name}</h1>
        <p className="mt-2 text-sm text-soul-muted">{profile.tone}</p>
      </aside>

      <section className="glass-card flex min-h-[620px] flex-col rounded-3xl p-5 sm:p-6">
        <div className="flex flex-1 items-center justify-center pb-6">
          <div className="max-w-md rounded-3xl border border-white/80 bg-white/70 px-6 py-8 text-center">
            <p className="text-lg font-semibold text-soul-text">No messages yet</p>
            <p className="mt-2 text-sm text-soul-muted">
              Start your first conversation with a prompt below or share what is on your heart.
            </p>
          </div>
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            {chatPrompts.map((prompt) => (
              <button key={prompt} className="rounded-full border border-white/80 bg-white/75 px-4 py-2 text-xs font-semibold text-soul-text transition hover:bg-white">
                {prompt}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/80 p-2 pl-4">
            <input placeholder="Share what is on your heart..." className="flex-1 bg-transparent text-sm text-soul-text outline-none placeholder:text-soul-muted" />
            <button className="rounded-full border border-violet-200 p-2 text-violet-500 transition hover:bg-violet-100">
              <Mic className="h-4 w-4" />
            </button>
            <button className="rounded-full bg-soul-text p-2 text-white transition hover:bg-[#2f283c]">
              <SendHorizonal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
