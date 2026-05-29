'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Zap, MessageSquare, Calendar, Phone, Clock, Star, Globe,
  ArrowRight, Check, ChevronDown, Menu, X, TrendingUp, Users, Shield,
} from 'lucide-react'

const INDUSTRIES = ['Plumbers', 'HVAC', 'Landscapers', 'Electricians', 'Roofers', 'General Contractors', 'Painters', 'Pressure Washers', 'Pest Control', 'Pool Service', 'Handymen', 'Tree Service']

const faqs = [
  {
    q: 'Do I need to know anything about technology?',
    a: "No. If you can fill out a Google Form, you can set this up. We built it specifically for business owners who don't want to deal with tech.",
  },
  {
    q: "What if the AI doesn't know the answer?",
    a: "It says 'Let me have our team follow up with you' and captures the customer's contact info. You never look bad, and you still get the lead.",
  },
  {
    q: 'Can I change what my AI knows?',
    a: 'Yes — any time from your dashboard. Update services, prices, hours, or FAQs in minutes.',
  },
  {
    q: "What if I don't have a website?",
    a: 'You still get a direct chat link you can share on Facebook, in text messages, or in your Google Business profile.',
  },
  {
    q: 'Is there a contract?',
    a: 'No. Month to month. Cancel any time from your account settings.',
  },
  {
    q: 'Can you build my website too?',
    a: 'Yes — the Pro plan includes a professional website built specifically for your business. Mobile-friendly, SEO-ready, and connected to your AI chat widget.',
  },
]

const testimonials = [
  {
    quote: 'I used to miss calls constantly while on the job. Now I get leads at 2am. Set up in one afternoon.',
    name: 'Mike Tran',
    role: 'Owner, Denver Plumbing Co.',
    initials: 'MT',
  },
  {
    quote: 'My AI assistant explains my services better than I do. Clients love getting an instant response.',
    name: 'Sarah Kim',
    role: 'Green Thumb Landscaping',
    initials: 'SK',
  },
  {
    quote: 'First month paid for the whole year. Captured 14 leads I would have completely missed.',
    name: 'Carlos Mendez',
    role: 'M&M HVAC Services',
    initials: 'CM',
  },
]

const plans = [
  {
    name: 'Starter',
    price: '$97',
    desc: 'Get your AI assistant live',
    features: ['100 conversations/mo', 'AI chat widget', 'Lead capture dashboard', 'Email support'],
    popular: false,
  },
  {
    name: 'Growth',
    price: '$197',
    desc: 'For businesses ready to scale',
    features: ['300 conversations/mo', 'Everything in Starter', 'Real calendar booking', 'Calendly integration', 'Review draft assist'],
    popular: true,
  },
  {
    name: 'Pro',
    price: '$397',
    desc: 'The complete package',
    features: ['1,000 conversations/mo', 'Everything in Growth', 'Full scheduling suite', 'Professional website built', 'Priority support'],
    popular: false,
  },
]

type ChatState = {
  m0: boolean
  m1: boolean
  m2: boolean
  typing: boolean
  notif1: boolean
  notif2: boolean
}

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [chat, setChat] = useState<ChatState>({ m0: false, m1: false, m2: false, typing: false, notif1: false, notif2: false })

  // Sequential chat animation on load
  useEffect(() => {
    const timers = [
      setTimeout(() => setChat(c => ({ ...c, m0: true })), 600),
      setTimeout(() => setChat(c => ({ ...c, typing: true })), 1600),
      setTimeout(() => setChat(c => ({ ...c, typing: false, m1: true })), 2500),
      setTimeout(() => setChat(c => ({ ...c, typing: true })), 3300),
      setTimeout(() => setChat(c => ({ ...c, typing: false, m2: true })), 4400),
      setTimeout(() => setChat(c => ({ ...c, notif1: true })), 5200),
      setTimeout(() => setChat(c => ({ ...c, notif2: true })), 6000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-badge', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1 })
      gsap.fromTo('.hero-title', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 0.9, delay: 0.25, ease: 'power3.out' })
      gsap.fromTo('.hero-sub',   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.5 })
      gsap.fromTo('.hero-cta',   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.65 })
      gsap.fromTo('.hero-widget',{ opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1.1, delay: 0.4, ease: 'power2.out' })

      document.querySelectorAll<HTMLElement>('.fade-up').forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
        )
      })

      document.querySelectorAll<HTMLElement>('.stagger-parent').forEach(el => {
        gsap.fromTo(Array.from(el.children) as HTMLElement[],
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } }
        )
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes float  { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-9px) } }
        @keyframes float2 { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-6px) } }
        @keyframes fadeSlideUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes glow-pulse { 0%,100% { opacity:0.5 } 50% { opacity:1 } }
        @keyframes spin-slow { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
        .chat-msg { transition: opacity 0.4s ease, transform 0.4s ease; }
        .chat-msg.hidden-msg { opacity:0; transform:translateY(10px); pointer-events:none; }
        .chat-msg.visible-msg { opacity:1; transform:translateY(0); }
        .notif-card { transition: opacity 0.5s ease, transform 0.5s ease; }
        .notif-card.hidden-notif { opacity:0; transform:translateY(12px) scale(0.95); pointer-events:none; }
        .notif-card.visible-notif { opacity:1; transform:translateY(0) scale(1); }
        .bento-card:hover .card-glow { opacity:1; }
        .card-glow { opacity:0; transition:opacity 0.3s ease; }
      `}</style>

      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-blue-600/8 blur-[140px]" style={{ animation: 'glow-pulse 6s ease-in-out infinite' }} />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-violet-600/6 blur-[120px]" style={{ animation: 'glow-pulse 8s ease-in-out infinite 2s' }} />
        <div className="absolute bottom-1/4 -left-20 w-[400px] h-[400px] rounded-full bg-blue-500/7 blur-[100px]" style={{ animation: 'glow-pulse 7s ease-in-out infinite 4s' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#030712]/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Axon</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login"   className="text-sm text-white/60 hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup"  className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
              Start free trial
            </Link>
          </div>
          <button className="sm:hidden text-white/60" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="sm:hidden bg-[#030712]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 space-y-3">
            <Link href="/pricing" className="block text-sm text-white/60 hover:text-white py-2">Pricing</Link>
            <Link href="/login"   className="block text-sm text-white/60 hover:text-white py-2">Sign in</Link>
            <Link href="/signup"  className="block text-sm bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold text-center">Start free trial</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="hero-badge inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{ animation: 'glow-pulse 2s ease-in-out infinite' }} />
              Built for contractors &amp; home service pros
            </div>
            <h1 className="hero-title text-5xl sm:text-6xl font-black leading-[1.06] tracking-tight mb-5">
              Never miss a lead.{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Not even at 2am.
              </span>
            </h1>
            <p className="hero-sub text-lg text-white/55 max-w-md leading-relaxed mb-8">
              Axon gives your business an AI assistant that chats with customers, captures leads, and books appointments — 24/7, even when you&apos;re on the job.
            </p>
            <div className="hero-cta flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5">
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3.5 rounded-xl transition-all duration-200">
                See pricing
              </Link>
            </div>
            <p className="text-xs text-white/35 mt-4">20 free conversations. No credit card required.</p>
          </div>

          {/* ANIMATED chat widget mockup */}
          <div className="hero-widget hidden md:block">
            <div className="relative">
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-3xl scale-110" style={{ animation: 'glow-pulse 4s ease-in-out infinite' }} />

              {/* Chat card */}
              <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#030712]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-none mb-0.5">Alex · AI Assistant</p>
                    <p className="text-xs text-white/40 truncate">Mike&apos;s Plumbing Co.</p>
                  </div>
                  <div className="flex gap-1 opacity-40">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                </div>

                {/* Messages */}
                <div className="p-4 space-y-3 min-h-[240px]">
                  {/* AI message 1 */}
                  <div className={`chat-msg flex gap-2 ${chat.m0 ? 'visible-msg' : 'hidden-msg'}`}>
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-white">Hey! 👋 I&apos;m Alex. Do you need a plumber today?</p>
                    </div>
                  </div>

                  {/* User message */}
                  <div className={`chat-msg flex justify-end ${chat.m1 ? 'visible-msg' : 'hidden-msg'}`}>
                    <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-white">Yes, my kitchen sink is leaking badly</p>
                    </div>
                  </div>

                  {/* AI message 2 */}
                  <div className={`chat-msg flex gap-2 ${chat.m2 ? 'visible-msg' : 'hidden-msg'}`}>
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-white">We can get someone out today! Can I grab your name and best number? 📍</p>
                    </div>
                  </div>

                  {/* Typing indicator */}
                  {chat.typing && !chat.m2 && (
                    <div className="chat-msg visible-msg flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Zap className="w-2.5 h-2.5 text-white" />
                      </div>
                      <div className="bg-white/10 rounded-xl px-4 py-3 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5 border border-white/10">
                    <p className="flex-1 text-sm text-white/30">Type a message...</p>
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating notification cards */}
              <div
                className={`notif-card absolute -left-10 top-1/4 bg-[#0a0f1e]/95 border border-white/15 rounded-xl px-3 py-2.5 shadow-2xl hidden lg:block`}
                style={{
                  ...(chat.notif1 ? {} : { opacity: 0, transform: 'translateY(12px) scale(0.95)', pointerEvents: 'none' }),
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                  animation: chat.notif1 ? 'float 4s ease-in-out infinite' : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-[10px] text-white/50 font-medium">NEW LEAD CAPTURED</p>
                </div>
                <p className="text-sm font-bold text-white">Sarah M.</p>
                <p className="text-xs text-white/50">(720) 555-0142</p>
              </div>

              <div
                className={`notif-card absolute -right-10 bottom-1/4 bg-[#0a0f1e]/95 border border-white/15 rounded-xl px-3 py-2.5 shadow-2xl hidden lg:block`}
                style={{
                  ...(chat.notif2 ? {} : { opacity: 0, transform: 'translateY(12px) scale(0.95)', pointerEvents: 'none' }),
                  transition: 'opacity 0.5s ease, transform 0.5s ease',
                  animation: chat.notif2 ? 'float2 4s ease-in-out infinite 1.5s' : undefined,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <p className="text-[10px] text-white/50 font-medium">APPOINTMENT BOOKED</p>
                </div>
                <p className="text-sm font-bold text-white">Tomorrow, 2:00 PM</p>
                <p className="text-xs text-white/50">Mike&apos;s Plumbing Co. ✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────── */}
      <div className="relative z-10 border-y border-white/8 py-5 overflow-hidden">
        <p className="text-center text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mb-4">Trusted by home service businesses across every trade</p>
        <div className="overflow-hidden">
          <div
            className="flex gap-3 w-max"
            style={{ animation: 'marquee 28s linear infinite' }}
          >
            {[...INDUSTRIES, ...INDUSTRIES].map((t, i) => (
              <span
                key={i}
                className="text-sm text-white/50 bg-white/[0.04] border border-white/8 px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-parent">
          {[
            { value: '< 5s',   label: 'Response time',       sub: 'Industry avg is 2+ hours' },
            { value: '24 / 7', label: 'Always available',     sub: 'Nights, weekends, holidays' },
            { value: '10 min', label: 'To go live',           sub: 'No tech skills needed' },
            { value: '$800+',  label: 'Avg job value',        sub: 'One extra job pays for a year' },
          ].map(({ value, label, sub }) => (
            <div key={label} className="relative group rounded-2xl border border-white/10 bg-white/[0.03] p-6 overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-violet-600/5 transition-all duration-300 rounded-2xl" />
              <p className="relative text-3xl sm:text-4xl font-black bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-1">{value}</p>
              <p className="relative text-sm font-semibold text-white/80 mb-0.5">{label}</p>
              <p className="relative text-xs text-white/35">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM (before / after) ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Every missed message is{' '}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              money walking out the door
            </span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-lg">
            You&apos;re on a job. A potential customer messages your site, gets no response, and calls your competitor. That&apos;s a $500–$2,000 job gone.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="fade-up rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-7">
            <p className="text-red-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-6">Without Axon</p>
            <div className="space-y-3.5">
              {[
                "Calls go to voicemail while you're on the job",
                "No one answers website messages at night",
                "New leads wait hours — then call a competitor",
                "Scheduling takes dozens of back-and-forth texts",
                "You lose jobs you never even knew about",
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-red-400 mt-0.5 flex-shrink-0 font-bold text-lg leading-none">✕</span>
                  <p className="text-sm text-white/55 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="fade-up rounded-2xl border border-blue-500/20 bg-blue-500/[0.04] p-7">
            <p className="text-blue-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-6">With Axon</p>
            <div className="space-y-3.5">
              {[
                "Every message gets an instant, accurate reply",
                "Leads are captured automatically, 24/7",
                "Appointments book themselves while you work",
                "Your AI knows your business inside and out",
                "You wake up to new jobs already scheduled",
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0 font-bold text-lg leading-none">✓</span>
                  <p className="text-sm text-white/70 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ROI CALLOUT ──────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
        <div className="fade-up rounded-2xl border border-white/8 bg-white/[0.03] px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">The math is simple</p>
            <p className="text-xl font-black text-white">One extra job per month <span className="text-blue-400">pays for a full year</span></p>
          </div>
          <div className="flex gap-6 text-center">
            {[
              { jobs: '1 job', per: '/month', result: '= $97/mo covered' },
              { jobs: '5 jobs', per: '/month', result: '= $400–$10k captured' },
            ].map(({ jobs, per, result }) => (
              <div key={jobs}>
                <p className="text-2xl font-black text-white">{jobs}<span className="text-sm text-white/40 font-normal">{per}</span></p>
                <p className="text-xs text-white/40 mt-0.5">{result}</p>
              </div>
            ))}
          </div>
          <Link href="/signup" className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 whitespace-nowrap">
            Start capturing leads →
          </Link>
        </div>
      </div>

      {/* ── FEATURES BENTO ───────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Everything you need. One subscription.</h2>
          <p className="text-white/50 text-lg">No tech skills required. Set up in 10 minutes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-parent">

          <div className="bento-card md:col-span-2 relative rounded-2xl border border-white/10 bg-white/[0.04] hover:border-blue-500/25 transition-all duration-300 p-7 overflow-hidden group hover:-translate-y-1">
            <div className="card-glow absolute inset-0 bg-gradient-to-br from-blue-600/8 to-violet-600/8 rounded-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">AI Chat on Your Website</h3>
              <p className="text-white/50 text-sm leading-relaxed">A beautiful chat widget appears on your site. Customers get instant, accurate answers about your services, pricing, and availability — any time of day or night. Paste one line of code. Done.</p>
            </div>
          </div>

          <div className="bento-card relative rounded-2xl border border-white/10 bg-white/[0.04] hover:border-blue-500/25 transition-all duration-300 p-7 flex flex-col justify-between overflow-hidden group hover:-translate-y-1">
            <div className="card-glow absolute inset-0 bg-gradient-to-br from-blue-600/8 to-violet-600/8 rounded-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-6xl font-black bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">24/7</p>
              <p className="text-white/50 text-sm mt-2 leading-relaxed">Always answering, even at 2am on holidays</p>
            </div>
          </div>

          <div className="bento-card relative rounded-2xl border border-white/10 bg-white/[0.04] hover:border-blue-500/25 transition-all duration-300 p-7 overflow-hidden group hover:-translate-y-1">
            <div className="card-glow absolute inset-0 bg-gradient-to-br from-blue-600/8 to-violet-600/8 rounded-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">Auto Lead Capture</h3>
              <p className="text-white/50 text-sm leading-relaxed">Names, phones, and emails saved instantly. Every lead in one clean dashboard.</p>
            </div>
          </div>

          <div className="bento-card relative rounded-2xl border border-white/10 bg-white/[0.04] hover:border-blue-500/25 transition-all duration-300 p-7 overflow-hidden group hover:-translate-y-1">
            <div className="card-glow absolute inset-0 bg-gradient-to-br from-blue-600/8 to-violet-600/8 rounded-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">Appointment Booking</h3>
              <p className="text-white/50 text-sm leading-relaxed">Customers book directly through chat. Zero back-and-forth texting required.</p>
            </div>
          </div>

          <div className="bento-card relative rounded-2xl border border-white/10 bg-white/[0.04] hover:border-blue-500/25 transition-all duration-300 p-7 overflow-hidden group hover:-translate-y-1">
            <div className="card-glow absolute inset-0 bg-gradient-to-br from-blue-600/8 to-violet-600/8 rounded-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold mb-2">Trained on Your Business</h3>
              <p className="text-white/50 text-sm leading-relaxed">Your services, pricing, hours, FAQs. Your AI answers every question correctly.</p>
            </div>
          </div>

          <div className="bento-card md:col-span-2 relative rounded-2xl border border-white/10 bg-white/[0.04] hover:border-blue-500/25 transition-all duration-300 p-7 overflow-hidden group hover:-translate-y-1">
            <div className="card-glow absolute inset-0 bg-gradient-to-br from-blue-600/8 to-violet-600/8 rounded-2xl pointer-events-none" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold mb-2">Full CRM + Schedule</h3>
              <p className="text-white/50 text-sm leading-relaxed">Every past customer in one place with full job history, crew scheduling, week-view calendar, and booking management. Your entire operation — one screen.</p>
            </div>
          </div>

          <div className="bento-card relative rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/8 to-violet-600/8 hover:from-blue-600/12 hover:to-violet-600/12 transition-all duration-300 p-7 overflow-hidden group hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Website Included</h3>
            <p className="text-white/50 text-sm mb-4 leading-relaxed">Pro plan: we build you a full professional website — mobile-ready, SEO-optimized, and AI connected from day one.</p>
            <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">Pro plan</span>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Up and running in 4 steps</h2>
          <p className="text-white/50 text-lg">Takes about 10 minutes. We&apos;ll walk you through every step.</p>
        </div>
        <div className="space-y-5 stagger-parent">
          {[
            { n: '01', title: 'Create your account', desc: 'Sign up with your email. No credit card needed to start your free trial.' },
            { n: '02', title: 'Tell us about your business', desc: 'Enter your services, hours, pricing, and FAQs. Give your AI assistant a name and personality.' },
            { n: '03', title: 'Add one line of code to your website', desc: 'Copy a snippet and paste it in. Or share your chat link directly — works without a website too.' },
            { n: '04', title: "You're live", desc: 'Your AI starts answering customers instantly. Check your dashboard to see leads and bookings roll in.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="group flex gap-6 items-start rounded-2xl border border-transparent hover:border-white/8 hover:bg-white/[0.02] p-4 transition-all duration-200 -mx-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-600/15 transition-colors">
                <span className="text-blue-400 font-black text-sm">{n}</span>
              </div>
              <div className="pt-2">
                <h3 className="font-bold text-lg text-white mb-1">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl sm:text-4xl font-black mb-3">Real businesses. Real results.</h2>
          <p className="text-white/40 text-base">From plumbers to landscapers — businesses just like yours.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 stagger-parent">
          {testimonials.map(({ quote, name, role, initials }) => (
            <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/65 text-sm leading-relaxed mb-6">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-white/40">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Pricing that makes sense</h2>
          <p className="text-white/50 text-lg">One missed job costs more than a full year of Axon. No contracts. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 stagger-parent">
          {plans.map(({ name, price, desc, features, popular }) => (
            <div key={name} className={`relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 ${
              popular
                ? 'bg-blue-600/10 border-2 border-blue-500/40 shadow-2xl shadow-blue-500/10'
                : 'border border-white/10 bg-white/[0.04] hover:border-white/20'
            }`}>
              {popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full shadow-lg shadow-blue-500/30">
                    Most Popular
                  </span>
                </div>
              )}
              <p className="font-bold text-white text-lg">{name}</p>
              <p className="text-xs text-white/40 mb-5">{desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">{price}</span>
                <span className="text-sm text-white/40">/month</span>
              </div>
              <div className="space-y-2.5 mb-7">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-blue-400" />
                    </div>
                    <p className="text-sm text-white/60">{f}</p>
                  </div>
                ))}
              </div>
              <Link href="/signup" className={`block text-center text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-200 ${
                popular
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
              }`}>
                Start free trial
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-white/30 mt-6">
          <Link href="/pricing" className="hover:text-white/60 transition-colors">See full feature comparison →</Link>
        </p>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-black mb-12 text-center fade-up">Common questions</h2>
        <div className="space-y-2 fade-up">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.03] transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="fade-up relative rounded-3xl overflow-hidden p-12 text-center" style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #4f46e5 50%, #7c3aed 100%)',
          boxShadow: '0 40px 80px -20px rgba(59, 130, 246, 0.35)',
        }}>
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1.5px, transparent 0)',
            backgroundSize: '28px 28px'
          }} />
          {/* Glow orbs */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <Shield className="w-3 h-3" />
              No credit card required
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Your competition is already using AI.
            </h2>
            <p className="text-blue-100/80 text-lg mb-8 max-w-md mx-auto">
              Start your free trial today. Up and running in 10 minutes. Cancel anytime.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-blue-700 font-black px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-2xl hover:-translate-y-0.5 text-base">
              Start free — 20 conversations included
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/8 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-sm">Axon</span>
          </div>
          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/pricing" className="hover:text-white/70 transition-colors">Pricing</Link>
            <Link href="/login"   className="hover:text-white/70 transition-colors">Sign in</Link>
            <a href="mailto:tobinroberts22@gmail.com" className="hover:text-white/70 transition-colors">Contact</a>
          </div>
          <p className="text-xs text-white/20">© {new Date().getFullYear()} Axon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
