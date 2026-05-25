import Link from 'next/link'
import { Check, Zap, MessageSquare, Calendar, Star, Phone, Clock } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">AI Hub</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">Pricing</Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2">Sign in</Link>
          <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Start free trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          Built for contractors, landscapers, plumbers &amp; more
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Your business answers<br />
          <span className="text-blue-600">every call. 24/7.</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          AI Hub gives your small business an AI assistant that chats with customers, captures leads, and books appointments — even while you&apos;re on the job.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            Start free trial
          </Link>
          <Link
            href="/pricing"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            See pricing
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">20 free conversations. No credit card required. Set up in 10 minutes.</p>
      </section>

      {/* Stats */}
      <section className="border-y bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-extrabold text-gray-900">24/7</p>
            <p className="text-sm text-gray-500 mt-1">Always answering</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-gray-900">&lt; 10 min</p>
            <p className="text-sm text-gray-500 mt-1">Setup time</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-gray-900">$0 extra</p>
            <p className="text-sm text-gray-500 mt-1">No per-message fees</p>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Every missed call is money walking out the door</h2>
            <p className="text-gray-500 mb-6">
              You&apos;re busy on a job. A new customer visits your website, has a question, and nobody responds. They move on to the next contractor. That&apos;s a $500–2,000 job you never knew you lost.
            </p>
            <p className="text-gray-500">
              AI Hub&apos;s assistant is on your website right now, answering questions, capturing contact info, and booking appointments — so you don&apos;t miss anything.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { icon: '📵', text: 'Missing calls while on the job' },
              { icon: '🕐', text: 'No one to answer at night or weekends' },
              { icon: '📋', text: 'Losing leads before they call you' },
              { icon: '⭐', text: 'Slow review responses hurt your reputation' },
              { icon: '📅', text: 'Scheduling takes too many back-and-forth texts' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <span className="text-xl">{icon}</span>
                <p className="text-gray-700 text-sm font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything your business needs. One subscription.</h2>
            <p className="text-gray-500">No tech skills required. If you can fill out a form, you can set this up.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
                title: 'AI Chat on Your Website',
                desc: 'A chat bubble appears on your site. Customers click it and get instant answers about your services, pricing, and availability.',
              },
              {
                icon: <Calendar className="w-6 h-6 text-blue-600" />,
                title: 'Appointment Scheduling',
                desc: 'Customers can book appointments directly through the chat. Your AI checks availability and confirms bookings automatically.',
              },
              {
                icon: <Phone className="w-6 h-6 text-blue-600" />,
                title: 'Lead Capture',
                desc: "Every time a customer shares their name and number, it's saved to your dashboard. Never lose a lead again.",
              },
              {
                icon: <Clock className="w-6 h-6 text-blue-600" />,
                title: 'Works After Hours',
                desc: 'Your AI answers at 2am, on holidays, and weekends. You sleep, it works.',
              },
              {
                icon: <Star className="w-6 h-6 text-blue-600" />,
                title: 'Trained on Your Business',
                desc: 'Enter your services, hours, FAQs, and pricing. Your AI knows your business and answers correctly every time.',
              },
              {
                icon: <Zap className="w-6 h-6 text-blue-600" />,
                title: 'Simple Dashboard',
                desc: 'See every conversation, all your leads, and your bookings in one clean screen. No tech knowledge required.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-5 border border-gray-200">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Up and running in 4 steps</h2>
          <p className="text-gray-500">Takes about 10 minutes. We&apos;ll walk you through every step.</p>
        </div>
        <div className="space-y-6">
          {[
            { step: '1', title: 'Create your account', desc: 'Sign up with your email. No credit card needed for your free trial.' },
            { step: '2', title: 'Tell us about your business', desc: 'Fill in your services, hours, common questions, and give your AI assistant a name.' },
            { step: '3', title: 'Add one line of code to your website', desc: 'Copy a snippet and paste it into your website. Or share your chat link directly — works without a website too.' },
            { step: '4', title: "You're live", desc: 'Your AI starts answering customers instantly. Check your dashboard anytime to see leads and conversations.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-5 items-start">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {step}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{title}</h3>
                <p className="text-gray-500 text-sm mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Pricing that makes sense</h2>
          <p className="text-gray-500 mb-10">One missed job costs more than a full year of AI Hub. No contracts. Cancel anytime.</p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {[
              { name: 'Starter', price: '$97', desc: 'Chat widget + lead capture + booking requests', tag: '' },
              { name: 'Growth', price: '$197', desc: 'Real calendar booking + Calendly integration + review drafts', tag: 'Most Popular' },
              { name: 'Pro', price: '$397', desc: 'Full scheduling suite + content generation + priority support', tag: '' },
            ].map(({ name, price, desc, tag }) => (
              <div
                key={name}
                className={`rounded-2xl border p-5 bg-white ${tag ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'}`}
              >
                {tag && (
                  <span className="inline-block text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full mb-3">
                    {tag}
                  </span>
                )}
                <p className="font-bold text-gray-900">{name}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">{price}<span className="text-base font-normal text-gray-400">/mo</span></p>
                <p className="text-sm text-gray-500 mt-2">{desc}</p>
              </div>
            ))}
          </div>
          <Link href="/pricing" className="inline-block mt-8 text-blue-600 hover:underline text-sm font-medium">
            See full feature comparison →
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Common questions</h2>
        <div className="space-y-6">
          {[
            {
              q: 'Do I need to know anything about technology?',
              a: "No. If you can fill out a Google Form, you can set this up. We designed it specifically for business owners who don't want to deal with tech."
            },
            {
              q: "What if the AI doesn't know the answer?",
              a: "It says \"Let me have our team follow up with you\" and captures the customer's contact info. You never look bad, and you still get the lead."
            },
            {
              q: 'Can I change what my AI knows?',
              a: 'Yes — any time from your dashboard. Update services, prices, hours, or FAQs in minutes.'
            },
            {
              q: "What if I don't have a website?",
              a: "You still get a direct chat link you can share on Facebook, in text messages, or in your Google Business profile."
            },
            {
              q: 'Is there a contract?',
              a: 'No. Month to month. Cancel any time from your account settings.'
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b pb-5">
              <h3 className="font-semibold text-gray-900 mb-2">{q}</h3>
              <p className="text-gray-500 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Your competition is already using AI. Are you?</h2>
          <p className="text-blue-100 mb-8">Start your free trial today. No credit card, no commitment. Be up and running in 10 minutes.</p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-50 transition-colors"
          >
            Start free trial
          </Link>
          <p className="text-blue-200 text-sm mt-4">20 free conversations included. No credit card required.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">AI Hub</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/pricing" className="hover:text-gray-600">Pricing</Link>
            <Link href="/login" className="hover:text-gray-600">Sign in</Link>
            <a href="mailto:tobinroberts22@gmail.com" className="hover:text-gray-600">Contact</a>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} AI Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
