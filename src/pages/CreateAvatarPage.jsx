import { createSteps } from '../data/soulData'

export function CreateAvatarPage() {
  return (
    <main className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="glass-card rounded-3xl p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-violet-500">Progress</p>
        <h1 className="mt-3 text-3xl font-semibold text-soul-text">Create Memory Avatar</h1>
        <ol className="mt-6 space-y-3">
          {createSteps.map((step, index) => (
            <li key={step} className={`rounded-2xl px-4 py-3 text-sm ${index === 0 ? 'bg-violet-100 text-soul-text' : 'bg-white/70 text-soul-muted'}`}>
              {index + 1}. {step}
            </li>
          ))}
        </ol>
      </aside>
      <section className="glass-card rounded-3xl p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-soul-text">Basic Information</h2>
        <p className="mt-2 text-soul-muted">Begin with foundational details to shape your loved one's profile with care.</p>
        <form className="mt-6 grid gap-4 sm:grid-cols-2">
          <input placeholder="Loved one's name" className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 outline-none ring-violet-200 focus:ring" />
          <input placeholder="Relationship" className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 outline-none ring-violet-200 focus:ring" />
          <input placeholder="Birth year" className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 outline-none ring-violet-200 focus:ring" />
          <input placeholder="Special dates" className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3 outline-none ring-violet-200 focus:ring" />
          <label className="sm:col-span-2 rounded-2xl border border-dashed border-violet-300 bg-white/60 px-4 py-6 text-center text-sm text-soul-muted">Upload Photos</label>
          <label className="sm:col-span-2 rounded-2xl border border-dashed border-violet-300 bg-white/60 px-4 py-6 text-center text-sm text-soul-muted">Upload Voice Notes</label>
          <textarea rows="4" placeholder="Text memories, letters, and meaningful stories" className="sm:col-span-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 outline-none ring-violet-200 focus:ring" />
          <textarea rows="3" placeholder="Personality traits and values" className="sm:col-span-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 outline-none ring-violet-200 focus:ring" />
          <textarea rows="3" placeholder="Favorite phrases" className="sm:col-span-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 outline-none ring-violet-200 focus:ring" />
        </form>
        <div className="mt-6 rounded-2xl border border-white/80 bg-white/75 p-4">
          <p className="text-sm font-semibold text-soul-text">Avatar preview</p>
          <p className="mt-2 text-sm text-soul-muted">Warm, reassuring, and reflective. Speaks softly and includes gentle encouragement.</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-full border border-white/80 bg-white px-5 py-3 text-sm font-semibold text-soul-text">Save Draft</button>
          <button className="rounded-full bg-soul-text px-5 py-3 text-sm font-semibold text-white">Continue to Next Step</button>
        </div>
      </section>
    </main>
  )
}
