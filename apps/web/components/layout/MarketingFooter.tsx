import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'

type FooterColumn = {
  heading: string
  links: { label: string; href: string }[]
}

const COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Course generator', href: '/courses' },
      { label: 'Roadmap engine', href: '/roadmaps' },
      { label: 'Skill evaluator', href: '/assessments' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign in', href: '/login' },
      { label: 'Sign up', href: '/signup' },
      { label: 'Home', href: '/home' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Documentation', href: 'https://developer.mozilla.org/en-US/docs/Web' },
      { label: 'API reference', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference' },
      { label: 'Blog', href: 'https://web.dev/blog/' },
    ],
  },
]

export function MarketingFooter() {
  return (
    <footer className="bg-primary text-white relative overflow-hidden border-t border-border/10">
      <div className="absolute inset-0 bg-gradient-radial from-accent/5 to-transparent blur-3xl opacity-50" />
      <div className="mx-auto max-w-7xl px-6 py-16 relative z-10">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:pr-8">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-base font-bold text-primary shadow-[0_4px_14px_rgba(255,255,255,0.15)] relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <span className="relative z-10">C</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Career<span className="text-accent">Sync</span>
              </span>
            </Link>
            <p className="mt-6 text-sm font-medium leading-relaxed text-secondary-foreground/80 max-w-[280px]">
              AI-powered career planning, roadmaps, courses, and assessments — engineered for the ambitious.
            </p>
            <div className="mt-8 flex gap-4 text-secondary-foreground/80">
              <a href="https://github.com" aria-label="GitHub" className="transition-all hover:text-accent hover:-translate-y-1"><Github size={20} /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="transition-all hover:text-accent hover:-translate-y-1"><Linkedin size={20} /></a>
              <a href="https://twitter.com" aria-label="Twitter" className="transition-all hover:text-accent hover:-translate-y-1"><Twitter size={20} /></a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-bold uppercase tracking-widest text-white/90">{col.heading}</h4>
              <ul className="mt-6 space-y-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-secondary-foreground/80 transition-all hover:text-accent hover:pl-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-sm font-medium text-secondary-foreground/60 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} CareerSync Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="https://policies.google.com/privacy" className="hover:text-accent transition-colors" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            <a href="https://policies.google.com/terms" className="hover:text-accent transition-colors" target="_blank" rel="noreferrer">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
