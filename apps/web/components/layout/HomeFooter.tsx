import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'

const PRODUCT_LINKS = [
  ['Course Generator', '/courses'],
  ['Roadmap Engine', '/roadmaps'],
  ['Skill Evaluator', '/assessments'],
] as const

export function HomeFooter() {
  return (
    <footer className="bg-primary text-white relative overflow-hidden border-t border-border/10">
      <div className="absolute inset-0 bg-gradient-radial from-accent/5 to-transparent blur-3xl opacity-50" />
      <div className="mx-auto max-w-7xl px-6 py-16 relative z-10">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1.35fr]">
          <div>
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-base font-bold text-primary shadow-[0_4px_14px_rgba(255,255,255,0.15)] relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <span className="relative z-10">C</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Career<span className="text-accent">Sync</span>
              </span>
            </Link>
            <p className="mt-6 max-w-xs text-sm font-medium leading-relaxed text-secondary-foreground/80">
              Engineered for the ambitious. The world&apos;s first AI-powered career intelligence platform.
            </p>
            <div className="mt-8 flex gap-4 text-secondary-foreground/80">
              <a href="https://github.com" aria-label="GitHub" className="transition-all hover:text-accent hover:-translate-y-1"><Github size={20} /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="transition-all hover:text-accent hover:-translate-y-1"><Linkedin size={20} /></a>
              <a href="https://twitter.com" aria-label="Twitter" className="transition-all hover:text-accent hover:-translate-y-1"><Twitter size={20} /></a>
            </div>
          </div>
          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Resources" links={[["Documentation", "https://developer.mozilla.org/en-US/docs/Web"], ["API Reference", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference"], ['Blog', 'https://web.dev/blog/'], ['Community', '/signup']]} />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Stay ahead</h3>
            <p className="mt-4 text-sm font-medium leading-relaxed text-secondary-foreground/80">Join our intelligence network. No spam, just signal.</p>
            <form className="mt-5 flex overflow-hidden rounded-xl border border-white/10 bg-white/5 focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10 transition-all" onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="home-footer-email" className="sr-only">Email address</label>
              <input id="home-footer-email" type="email" placeholder="Your email address" className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm font-medium text-white outline-none placeholder:text-white/40" />
              <button type="submit" className="bg-accent px-6 text-sm font-bold text-white transition-colors hover:bg-accent/90">Join</button>
            </form>
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-sm font-medium text-secondary-foreground/60 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} CareerSync Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="https://policies.google.com/privacy" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="https://policies.google.com/terms" className="hover:text-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">{title}</h3>
      <ul className="mt-6 space-y-4">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-sm font-medium text-secondary-foreground/80 transition-all hover:text-accent hover:pl-1 inline-block">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
