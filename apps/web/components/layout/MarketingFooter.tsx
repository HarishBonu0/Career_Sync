import Link from 'next/link'

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
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-sm">
                C
              </div>
              <span className="text-base font-semibold tracking-tight">Career Sync</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              AI-powered career planning, roadmaps, courses, and assessments — in one place.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">{col.heading}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Career Sync Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="https://policies.google.com/privacy" className="hover:text-foreground" target="_blank" rel="noreferrer">
              Privacy
            </a>
            <a href="https://policies.google.com/terms" className="hover:text-foreground" target="_blank" rel="noreferrer">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
