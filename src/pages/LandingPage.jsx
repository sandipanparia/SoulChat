import { motion as Motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Lock, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react'
import { memoryProfiles } from '../data/soulData'
import { SectionTitle } from '../components/ui/SectionTitle'
import { GlassCard } from '../components/ui/GlassCard'

const steps = [
  { icon: UploadCloud, title: 'Upload Memories', description: 'Add photos, voice notes, letters, stories, and treasured moments.' },
  { icon: Sparkles, title: 'Create the Avatar', description: 'Soul Chat shapes a respectful AI memory avatar from your shared details.' },
  { icon: ShieldCheck, title: 'Start the Conversation', description: 'Reconnect in a calm private space designed for comfort and reflection.' },
]

const values = [
  'Emotional healing through safe, meaningful conversations',
  'Memory preservation that keeps voice, values, and stories alive',
  'Private by design with secure storage and personal control',
  'Personal connection in a respectful and human-centered experience',
]

const testimonials = [
  '"Soul Chat helps me hear my mother\'s kindness in difficult moments."',
  '"It feels like opening a memory journal that can answer back with warmth."',
  '"A beautiful way to preserve family stories for generations."',
]

export function LandingPage() {
  return (
    <main className="space-y-16 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/40 px-6 py-16 shadow-glow backdrop-blur-2xl sm:px-10 lg:px-16">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.6),transparent_55%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-5 inline-flex rounded-full border border-violet-200 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-violet-500">
              Gentle AI Memory Companion
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-soul-text sm:text-5xl lg:text-6xl">
              Talk to the ones you still miss
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-soul-muted">
              Soul Chat helps you preserve memories, voices, and stories in a gentle digital sanctuary so love and wisdom can stay close.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/create-avatar" className="rounded-full bg-soul-text px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#2f283c]">
                Create a Memory Avatar
              </Link>
              <a href="#how-it-works" className="rounded-full border border-white/80 bg-white/75 px-6 py-3 text-sm font-semibold text-soul-text transition hover:bg-white">
                See How It Works
              </a>
            </div>
          </Motion.div>

          <div className="relative h-[340px] overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-violet-100 via-blue-100 to-white shadow-soft">
            <div className="absolute left-8 top-8 h-14 w-14 animate-float rounded-full bg-white/80 shadow-soft" />
            <div className="absolute left-1/2 top-16 h-4 w-4 animate-pulseSoft rounded-full bg-violet-300" />
            <div className="absolute right-10 top-12 h-8 w-8 animate-float rounded-full bg-blue-200" />
            <div className="absolute bottom-12 left-12 h-6 w-6 animate-pulseSoft rounded-full bg-violet-200" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),rgba(255,255,255,0))]" />
            <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-white/80 bg-white/70 p-5 backdrop-blur-md">
              <p className="text-sm text-soul-muted">"I am always with you in your heart."</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="pt-2">
        <SectionTitle eyebrow="How It Works" title="A calm and respectful journey" subtitle="Designed to make preserving memory feel simple, meaningful, and deeply personal." />
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <GlassCard key={step.title} className="transition hover:-translate-y-1 hover:bg-white/70">
              <step.icon className="mb-4 h-8 w-8 text-violet-500" />
              <h3 className="text-xl font-semibold text-soul-text">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-soul-muted">{step.description}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Why Soul Chat" title="Built for healing and remembrance" subtitle="Every detail is crafted to preserve dignity, emotional safety, and meaningful connection." />
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map((value) => (
            <GlassCard key={value} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-violet-400" />
              <p className="text-soul-text">{value}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Memory Profiles" title="Keep their presence close" subtitle="Create dedicated spaces for loved ones and continue heartfelt conversations anytime." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {memoryProfiles.map((profile) => (
            <GlassCard key={profile.id} className="p-4">
              <img src={profile.image} alt={profile.name} className="h-44 w-full rounded-2xl object-cover" />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">{profile.relation}</p>
              <h3 className="mt-1 text-xl font-semibold text-soul-text">{profile.name}</h3>
              <Link to={`/chat/${profile.id}`} className="mt-4 inline-flex rounded-full bg-soul-text px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2f283c]">
                Open Chat
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Privacy & Trust" title="Your memories remain yours" />
        <div className="grid gap-5 md:grid-cols-3">
          <GlassCard>
            <Lock className="mb-3 h-7 w-7 text-violet-500" />
            <h3 className="text-lg font-semibold text-soul-text">Secure storage</h3>
            <p className="mt-2 text-sm text-soul-muted">Your uploaded memories are encrypted and protected with modern safeguards.</p>
          </GlassCard>
          <GlassCard>
            <ShieldCheck className="mb-3 h-7 w-7 text-violet-500" />
            <h3 className="text-lg font-semibold text-soul-text">Full user control</h3>
            <p className="mt-2 text-sm text-soul-muted">Review, edit, or remove any memory source at any time from your dashboard.</p>
          </GlassCard>
          <GlassCard>
            <Sparkles className="mb-3 h-7 w-7 text-violet-500" />
            <h3 className="text-lg font-semibold text-soul-text">Respectful AI behavior</h3>
            <p className="mt-2 text-sm text-soul-muted">Soul Chat responses are tuned for compassion, boundaries, and emotional care.</p>
          </GlassCard>
        </div>
      </section>

      <section>
        <SectionTitle eyebrow="Words From Families" title="Moments of comfort" />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((quote) => (
            <GlassCard key={quote} className="text-center">
              <p className="text-lg italic leading-relaxed text-soul-text">{quote}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <footer className="glass-card rounded-3xl px-6 py-8 text-center">
        <p className="text-2xl font-semibold text-soul-text">Soul Chat</p>
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-soul-muted">
          <a href="#">About</a>
          <a href="#">Privacy</a>
          <a href="#">Support</a>
          <a href="#">Terms</a>
        </div>
        <p className="mt-4 text-sm text-soul-muted">A gentle space where memories remain held with love.</p>
      </footer>
    </main>
  )
}
