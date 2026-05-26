'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { PLANS } from '@/lib/plans'
import Link from 'next/link'
import { Check, Zap, Loader2 } from 'lucide-react'

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  async function checkout(plan: string) {
    setLoadingPlan(plan)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      window.location.href = '/signup'
      return
    }

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, userId: user.id, email: user.email }),
    })

    const { url } = await res.json()
    if (url) window.location.href = url
    setLoadingPlan(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">AI Hub</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2">Sign in</Link>
          <Link href="/signup" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Free trial
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, honest pricing</h1>
          <p className="text-gray-500 text-lg">One missed call costs more than a month of AI Hub. No contracts. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([key, plan]) => (
            <div
              key={key}
              className={`rounded-2xl border p-6 bg-white relative ${
                key === 'growth' ? 'border-blue-500 shadow-lg shadow-blue-100 ring-2 ring-blue-500' : 'border-gray-200'
              }`}
            >
              {key === 'growth' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                </div>
              )}
              <div className="mb-5">
                <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Up to {plan.conversations.toLocaleString()} conversations/mo</p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => checkout(key)}
                disabled={loadingPlan === key}
                className={`w-full font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  key === 'growth'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {loadingPlan === key && <Loader2 className="w-4 h-4 animate-spin" />}
                Get started
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
          All plans start with a free trial. Setup fee may apply. Questions?{' '}
          <a href="mailto:tobinroberts22@gmail.com" className="text-blue-500 underline">Contact us</a>
        </p>
      </div>
    </div>
  )
}
