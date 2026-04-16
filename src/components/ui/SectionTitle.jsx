import { motion as Motion } from 'framer-motion'

export function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.55 }}
      className="mx-auto mb-10 max-w-3xl text-center"
    >
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-violet-500">{eyebrow}</p>
      <h2 className="text-3xl font-semibold text-soul-text sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mx-auto mt-4 max-w-2xl text-base text-soul-muted">{subtitle}</p> : null}
    </Motion.div>
  )
}
