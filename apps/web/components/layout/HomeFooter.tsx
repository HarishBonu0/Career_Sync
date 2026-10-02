import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'

const PRODUCT_LINKS = [
  ['Course Generator', '/courses'],
  ['Roadmap Engine', '/roadmaps'],
  ['Skill Evaluator', '/assessments'],
] as const

export function HomeFooter() {
  return (
    <footer className="bg-[#0d142b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1.35fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#695bd3] to-[#8c7ded] text-sm font-extrabold">C</span>
              <span className="text-base font-extrabold tracking-tight">CareerOS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">Engineered for the ambitious. The world&apos;s first AI-powered career intelligence platform.</p>
            <div className="mt-5 flex gap-3 text-slate-400">
              <a href="https://github.com" aria-label="GitHub" className="transition-colors hover:text-white"><Github size={16} /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="transition-colors hover:text-white"><Linkedin size={16} /></a>
              <a href="https://twitter.com" aria-label="Twitter" className="transition-colors hover:text-white"><Twitter size={16} /></a>
            </div>
          </div>
          <FooterColumn title="Product" links={PRODUCT_LINKS} />
          <FooterColumn title="Resources" links={[["Documentation", "https://developer.mozilla.org/en-US/docs/Web"], ["API Reference", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference"], ['Blog', 'https://web.dev/blog/'], ['Community', '/signup']]} />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Stay ahead</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400">Join our intelligence network. No spam, just signal.</p>
            <form className="mt-4 flex overflow-hidden rounded-lg border border-slate-700 bg-slate-900/60" onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="home-footer-email" className="sr-only">Email address</label>
              <input id="home-footer-email" type="email" placeholder="Your email" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500" />
              <button type="submit" className="bg-[#695bd3] px-3 text-xs font-bold text-white transition-colors hover:bg-[#7b6deb]">Join</button>
            </form>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-slate-800 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Career Sync Inc. All rights reserved.</span>
          <div className="flex gap-4"><a href="https://policies.google.com/privacy" className="hover:text-slate-300">Privacy Policy</a><a href="https://policies.google.com/terms" className="hover:text-slate-300">Terms of Service</a></div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return <div><h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">{title}</h3><ul className="mt-4 space-y-3">{links.map(([label, href]) => <li key={label}><Link href={href} className="text-sm text-slate-400 transition-colors hover:text-white">{label}</Link></li>)}</ul></div>
}
