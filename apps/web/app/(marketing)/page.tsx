import Link from 'next/link'
import { ArrowRight, Check, Play, BookOpen, Map, ClipboardCheck, Sparkles } from 'lucide-react'

const MODULES = [
  {
    number: '01',
    title: 'Skill Intelligence',
    description: "Understand your strengths and map your current career capabilities with AI precision.",
    features: ['Dynamic evaluation', 'Hidden gap identification', 'Role benchmarking'],
    button: 'Evaluate Skills',
    href: '/assessments',
    icon: <ClipboardCheck className="w-5 h-5" />
  },
  {
    number: '02',
    title: 'Career Roadmaps',
    description: 'Visualized, calculated, and optimized paths from where you are to where you want to be.',
    features: ['Role-based gap analysis', 'Milestone tracking', 'Prerequisite mapping'],
    button: 'Build Roadmap',
    href: '/roadmaps',
    icon: <Map className="w-5 h-5" />
  },
  {
    number: '03',
    title: 'Course Generation',
    description: "Bespoke learning curriculums assembled dynamically from the world's best resources.",
    features: ['Instant syllabus generation', 'Targeted material', 'Progress tracking'],
    button: 'Generate Course',
    href: '/generate',
    icon: <BookOpen className="w-5 h-5" />
  },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-accent/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-40 bg-gradient-hero border-b border-border/50">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        
        <div className="container-custom relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-accent/20 bg-accent/5 text-xs font-semibold text-accent tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            CareerSync Intelligence
          </div>
          
          <h1 className="text-display-2 md:text-[5rem] lg:text-[6rem] tracking-tight max-w-5xl mb-6 text-primary font-bold leading-[1.05]">
            Your Career,<br />
            <span className="text-gradient-gold">
              Intelligently Mapped.
            </span>
          </h1>
          
          <p className="text-body-lg md:text-xl text-secondary-foreground max-w-2xl mb-12 font-medium">
            Turn your skills, goals, and potential into a clear, personalized career roadmap with the power of AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/signup" 
              className="inline-flex w-full sm:w-auto h-14 items-center justify-center rounded-full bg-primary px-10 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 shadow-[0_8px_30px_rgba(17,17,17,0.15)] hover:-translate-y-0.5"
            >
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/home" 
              className="inline-flex w-full sm:w-auto h-14 items-center justify-center gap-2 rounded-full border-2 border-border bg-white/50 backdrop-blur-md px-10 text-base font-semibold text-primary transition-all hover:bg-white hover:border-border shadow-sm"
            >
              <Play className="w-5 h-5 fill-primary" /> Watch Demo
            </Link>
          </div>
        </div>

        {/* Hero Visual: Premium Pipeline */}
        <div className="container-custom mt-24 relative z-20">
          <PremiumPipelineVisual />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b border-border/50 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
            <div className="flex flex-col gap-1">
              <div className="text-4xl font-bold text-primary">50K+</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Learners</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-4xl font-bold text-primary">95%</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Career Clarity</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-4xl font-bold text-primary">4.8/5</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">User Rating</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-4xl font-bold text-primary">10x</div>
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Faster Learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute right-0 top-1/4 w-[800px] h-[800px] bg-gradient-radial from-accent/5 to-transparent blur-[100px] pointer-events-none" />
        <div className="container-custom space-y-40 relative z-10">
          {MODULES.map((mod, i) => (
            <div key={mod.number} className={`flex flex-col gap-16 lg:gap-24 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center`}>
              
              {/* Visual Side */}
              <div className="w-full lg:w-1/2 relative group">
                <div className="absolute -inset-4 bg-gradient-to-tr from-accent/10 via-accent/5 to-transparent rounded-[2.5rem] blur-2xl opacity-50 transition-opacity group-hover:opacity-100 duration-700" />
                <div className="relative aspect-[4/3] rounded-[2rem] border border-border bg-white shadow-elevated overflow-hidden p-8 flex items-center justify-center transition-transform duration-700 group-hover:-translate-y-2">
                  {i === 0 && <AnalysisPreview />}
                  {i === 1 && <RoadmapPreview />}
                  {i === 2 && <CoursePreview />}
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2 space-y-8">
                <div className="inline-flex items-center gap-3">
                  <span className="text-sm font-bold tracking-widest text-accent uppercase">{mod.number}</span>
                  <div className="h-px w-12 bg-accent/30" />
                </div>
                <h2 className="text-display-1 tracking-tight text-primary font-bold">{mod.title}</h2>
                <p className="text-xl text-secondary-foreground leading-relaxed">{mod.description}</p>
                
                <ul className="space-y-4 pt-4">
                  {mod.features.map(f => (
                    <li key={f} className="flex items-center gap-4 text-primary font-medium">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent border border-accent/20">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="pt-8">
                  <Link href={mod.href} className="inline-flex items-center gap-3 h-12 px-8 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 group">
                    {mod.icon}
                    {mod.button}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 bg-gradient-dark opacity-90" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
        
        <div className="container-custom relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">C</span>
          </div>
          <h2 className="text-display-1 md:text-6xl font-bold tracking-tight mb-6 max-w-3xl leading-tight">
            Ready to accelerate your professional journey?
          </h2>
          <p className="text-xl text-white/70 mb-12 max-w-2xl">
            Join thousands of professionals using CareerSync to intelligently map and achieve their goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/signup" 
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-base font-bold text-primary transition-transform hover:scale-105 shadow-xl"
            >
              Create Free Account
            </Link>
            <Link 
              href="/login" 
              className="inline-flex h-14 items-center justify-center rounded-full border-2 border-white/20 bg-transparent px-10 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function PremiumPipelineVisual() {
  return (
    <div className="relative w-full max-w-6xl mx-auto h-[350px] md:h-[450px] rounded-[2.5rem] border border-border/80 bg-white/60 backdrop-blur-xl shadow-elevated flex flex-col items-center justify-center overflow-hidden p-8">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      {/* The Golden Path (SVG) */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-60 hidden md:flex">
        <svg width="800" height="150" viewBox="0 0 800 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 75 C 200 75, 200 20, 400 75 C 600 130, 600 75, 750 75" stroke="#E5E0D6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M50 75 C 200 75, 200 20, 400 75 C 600 130, 600 75, 750 75" stroke="url(#gold-gradient)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1000" strokeDashoffset="0" className="animate-[dash_6s_linear_infinite]" />
          <defs>
            <linearGradient id="gold-gradient" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F2DFC0" stopOpacity="0" />
              <stop offset="0.5" stopColor="#B87924" />
              <stop offset="1" stopColor="#F2DFC0" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Nodes */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl z-10 gap-6 md:gap-0 mt-8">
        <PipelineNode label="Current Career" icon={<UserIcon />} delay="0ms" />
        <PipelineNode label="Skills & Gaps" icon={<TargetIcon />} delay="200ms" />
        <PipelineNode label="Learning Path" icon={<BookIcon />} delay="400ms" active />
        <PipelineNode label="Career Goal" icon={<FlagIcon />} delay="600ms" final />
      </div>
    </div>
  )
}

function PipelineNode({ label, icon, delay, active, final }: { label: string, icon: React.ReactNode, delay: string, active?: boolean, final?: boolean }) {
  return (
    <div 
      className={`relative flex flex-col items-center gap-3 transition-all duration-700 hover:-translate-y-2 group`}
      style={{ animationDelay: delay }}
    >
      <div className={`
        relative w-16 h-16 rounded-2xl flex items-center justify-center z-10 shadow-lg border-2
        ${active ? 'bg-white border-accent shadow-[0_10px_30px_rgba(184,121,36,0.2)]' : 
          final ? 'bg-primary border-primary text-white' : 'bg-white border-border text-primary'}
      `}>
        {active && <div className="absolute inset-0 rounded-2xl bg-accent/20 animate-ping opacity-20" />}
        <div className={`w-6 h-6 ${active ? 'text-accent' : final ? 'text-white' : 'text-primary'}`}>
          {icon}
        </div>
      </div>
      <div className={`text-sm font-bold tracking-tight px-4 py-1.5 rounded-full border ${active ? 'bg-accent/10 border-accent/30 text-accent' : final ? 'bg-primary border-primary text-white' : 'bg-white border-border text-primary'}`}>
        {label}
      </div>
    </div>
  )
}

// Icons for Pipeline
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
const FlagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>

// Updated Previews for Modules matching Premium Ivory theme
function CoursePreview() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-4 w-1/3 rounded-full bg-accent/20" />
        <div className="h-6 w-16 rounded-full bg-primary/5" />
      </div>
      <div className="h-32 w-full rounded-xl border border-border bg-gradient-secondary p-1" />
      <div className="space-y-3">
        <div className="h-3 w-full rounded-full bg-border" />
        <div className="h-3 w-4/5 rounded-full bg-border" />
      </div>
    </div>
  )
}

function RoadmapPreview() {
  return (
    <div className="w-full flex flex-col gap-4 relative">
      <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-accent via-border to-border" />
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-6 relative z-10">
          <div className={`h-12 w-12 rounded-full border-4 flex items-center justify-center flex-shrink-0 bg-white ${i === 1 ? 'border-accent shadow-[0_0_15px_rgba(184,121,36,0.3)]' : 'border-border'}`}>
             {i === 1 && <div className="h-3 w-3 rounded-full bg-accent" />}
          </div>
          <div className="flex-1 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className={`h-2 w-1/3 rounded-full mb-3 ${i === 1 ? 'bg-accent' : 'bg-border'}`} />
            <div className="h-2 w-1/2 rounded-full bg-muted-foreground/30" />
          </div>
        </div>
      ))}
    </div>
  )
}

function AnalysisPreview() {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative w-56 h-56 rounded-full border-[12px] border-border flex items-center justify-center bg-white shadow-elevated">
        <div className="absolute inset-0 rounded-full border-[12px] border-accent border-t-transparent border-r-transparent transform -rotate-12 transition-transform duration-1000" />
        <div className="text-center">
          <div className="text-5xl font-black text-primary">72<span className="text-3xl">%</span></div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Readiness</div>
        </div>
      </div>
    </div>
  )
}
