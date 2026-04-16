import { Link } from 'react-router-dom'
import { GlassCard } from '../components/ui/GlassCard'

export function DashboardPage() {
  return (
    <main className="space-y-8">
      <section className="glass-card rounded-[2rem] p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-violet-500">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-soul-text">Your Memory Avatars</h1>
        <p className="mt-3 text-soul-muted">Manage memories, refine personality details, and revisit conversations.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/create-avatar" className="rounded-full bg-soul-text px-5 py-3 text-sm font-semibold text-white">Create Memory Avatar</Link>
        </div>
      </section>
      <section className="grid gap-5">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-soul-text">No Memory Avatars Yet</h2>
          <p className="mx-auto mt-3 max-w-xl text-soul-muted">
            Your dashboard is ready. Create your first memory avatar to begin a private and meaningful conversation space.
          </p>
          <Link
            to="/create-avatar"
            className="mt-6 inline-flex rounded-full bg-soul-text px-5 py-3 text-sm font-semibold text-white"
          >
            Create Your First Avatar
          </Link>
        </GlassCard>
      </section>
    </main>
  )
}
