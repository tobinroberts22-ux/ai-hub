'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Zap, MessageSquare, Calendar, Phone, Clock, Star, Globe,
  ArrowRight, Check, ChevronDown, Menu, X,
} from 'lucide-react'

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

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-badge', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1 })
      gsap.fromTo('.hero-title', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.25, ease: 'power2.out' })
      gsap.fromTo('.hero-sub',   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.45 })
      gsap.fromTo('.hero-cta',   { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.6 })
      gsap.fromTo('.hero-widget',{ opacity: 0, y: 36, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1, delay: 0.35, ease: 'power2.out' })

      document.querySelectorAll<HTMLElement>('.fade-up').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' } }
        )
      })

      document.querySelectorAll<HTMLElement>('.stagger-parent').forEach((el) => {
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

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-20 right-1/3 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute bottom-1/3 -right-20 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#030712]/90 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">Axon</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login"   className="text-sm text-white/60 hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup"  className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
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
            <Link href="/signup"  className="block text-sm bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-center">Start free trial</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="hero-badge inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              Built for contractors &amp; home service pros
            </div>
            <h1 className="hero-title text-5xl sm:text-6xl font-black leading-[1.08] tracking-tight mb-5">
              Never miss a lead.{' '}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Not even at 2am.
              </span>
            </h1>
            <p className="hero-sub text-lg text-white/55 max-w-md leading-relaxed mb-8">
              Axon gives your business an AI assistant that chats with customers, captures leads, and books appointments — 24/7, even when you're on the job.
            </p>
            <div className="hero-cta flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all duration-200 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5">
                Start free trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3.5 rounded-xl transition-all duration-200">
                See pricing
              </Link>
            </div>
            <p className="text-xs text-white/35 mt-4">20 free conversations. No credit card required.</p>
          </div>

          {/* Chat widget mockup */}
          <div className="hero-widget hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/15 rounded-3xl blur-3xl scale-110" />
              <div className="relative w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-none mb-1">Alex · AI Assistant</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      <p className="text-xs text-white/45 truncate">Mike's Plumbing Co. · Online</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3 min-h-[220px]">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-white">Hey! 👋 I'm Alex. Do you need a plumber today?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-600 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-white">Yes, my sink is leaking badly</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                      <p className="text-sm text-white">We can send someone today! Can I get your address and best number? 📍</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Zap className="w-2.5 h-2.5 text-white" />
                    </div>
                    <div className="bg-white/10 rounded-xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5 border border-white/10">
                    <p className="flex-1 text-sm text-white/30">Type a message...</p>
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-8 top-1/4 bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 shadow-xl hidden lg:block">
                <p className="text-xs text-white/50">New lead captured</p>
                <p className="text-sm font-bold text-white">Sarah M. · (720) 555-0142</p>
              </div>
              <div className="absolute -right-8 bottom-1/4 bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 shadow-xl hidden lg:block">
                <p className="text-xs text-white/50">Appointment booked</p>
                <p className="text-sm font-bold text-white">Tomorrow, 2:00 PM ✓</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <div className="relative z-10 border-y border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs text-white/40 font-semibold uppercase tracking-widest mb-5">Trusted by home service businesses</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Plumbers', 'HVAC', 'Landscapers', 'Electricians', 'Roofers', 'General Contractors', 'Painters'].map(t => (
              <span key={t} className="text-sm text-white/50 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Problem */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Every missed message is{' '}
            <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              money walking out the door
            </span>
          </h2>
          <p className="text-white/50 max-w-xl mx-auto text-lg">
            You're on a job. A potential customer messages your site, gets no response, and calls your competitor. That's a $500–$2,000 job gone.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="fade-up rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-5">Without Axon</p>
            <div className="space-y-3">
              {[
                "Calls go to voicemail while you're on the job",
                "No one answers website messages at night",
                "New leads wait hours — then call a competitor",
                "Scheduling takes dozens of back-and-forth texts",
                "You lose jobs you never even knew about",
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-red-400 mt-0.5 flex-shrink-0 font-bold">✕</span>
                  <p className="text-sm text-white/60">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="fade-up rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-5">With Axon</p>
            <div className="space-y-3">
              {[
                "Every message gets an instant, accurate reply",
                "Leads are captured automatically, 24/7",
                "Appointments book themselves while you work",
                "Your AI knows your business inside and out",
                "You wake up to new jobs already scheduled",
              ].map(item => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-blue-400 mt-0.5 flex-shrink-0 font-bold">✓</span>
                  <p className="text-sm text-white/70">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features bento */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Everything you need. One subscription.</h2>
          <p className="text-white/50 text-lg">No tech skills required. Set up in 10 minutes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-parent">
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300 p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">AI Chat on Your Website</h3>
            <p className="text-white/50 text-sm leading-relaxed">A beautiful chat widget appears on your site. Customers get instant, accurate answers about your services, pricing, and availability — any time of day or night.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all duration-300 p-6 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-5xl font-black bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">24/7</p>
              <p className="text-white/50 text-sm mt-2">Always answering, even at 2am on holidays</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all duration-300 p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Lead Capture</h3>
            <p className="text-white/50 text-sm">Every customer contact saved instantly to your dashboard. Never lose a lead again.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all duration-300 p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Appointment Booking</h3>
            <p className="text-white/50 text-sm">Customers book directly through chat. Zero back-and-forth texting.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all duration-300 p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Trained on Your Business</h3>
            <p className="text-white/50 text-sm">Your services, pricing, hours, FAQs. Your AI answers every question correctly.</p>
          </div>
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all duration-300 p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Simple Dashboard</h3>
            <p className="text-white/50 text-sm leading-relaxed">See every conversation, lead, and booking in one clean screen. Check your business from anywhere — no tech knowledge required.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-violet-600/10 hover:from-blue-600/15 transition-all duration-300 p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold mb-2">Website Included</h3>
            <p className="text-white/50 text-sm mb-4">Pro plan: we build you a full professional website — mobile-ready, SEO-optimized, AI connected.</p>
            <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">Pro plan</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Up and running in 4 steps</h2>
          <p className="text-white/50 text-lg">Takes about 10 minutes. We'll walk you through every step.</p>
        </div>
        <div className="space-y-5 stagger-parent">
          {[
            { n: '01', title: 'Create your account', desc: 'Sign up with your email. No credit card needed to start your free trial.' },
            { n: '02', title: 'Tell us about your business', desc: 'Enter your services, hours, pricing, and FAQs. Give your AI assistant a name and personality.' },
            { n: '03', title: 'Add one line of code to your website', desc: 'Copy a snippet and paste it in. Or share your chat link directly — works without a website too.' },
            { n: '04', title: "You're live", desc: 'Your AI starts answering customers instantly. Check your dashboard to see leads and bookings roll in.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
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

      {/* Testimonials */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Real businesses. Real results.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 stagger-parent">
          {testimonials.map(({ quote, name, role, initials }) => (
            <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-6">"{quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
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

      {/* Pricing */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-16 fade-up">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Pricing that makes sense</h2>
          <p className="text-white/50 text-lg">One missed job costs more than a full year of Axon. No contracts. Cancel anytime.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 stagger-parent">
          {plans.map(({ name, price, desc, features, popular }) => (
            <div key={name} className={`relative rounded-2xl p-6 ${
              popular
                ? 'bg-blue-600/10 border-2 border-blue-500/40 shadow-xl shadow-blue-500/10'
                : 'border border-white/10 bg-white/5'
            }`}>
              {popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full shadow-lg shadow-blue-500/30">
                    Most Popular
                  </span>
                </div>
              )}
              <p className="font-bold text-white">{name}</p>
              <p className="text-xs text-white/40 mb-4">{desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">{price}</span>
                <span className="text-sm text-white/40">/month</span>
              </div>
              <div className="space-y-2.5 mb-6">
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

      {/* FAQ */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 py-24">
        <h2 className="text-3xl sm:text-4xl font-black mb-12 text-center fade-up">Common questions</h2>
        <div className="space-y-2 fade-up">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-white/55 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="fade-up relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-violet-700 p-12 text-center shadow-2xl shadow-blue-500/20">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Your competition is already using AI.
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-md mx-auto">
              Start your free trial today. No credit card, no commitment. Up and running in 10 minutes.
            </p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-blue-700 font-black px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-xl hover:-translate-y-0.5">
              Start free trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-blue-200/70 text-xs mt-4">20 free conversations included. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6">
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
          <p className="text-xs text-white/25">© {new Date().getFullYear()} Axon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
