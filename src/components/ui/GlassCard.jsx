export function GlassCard({ className = '', children }) {
  return <article className={`glass-card rounded-3xl p-6 ${className}`}>{children}</article>
}
