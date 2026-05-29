'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Zap, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DEFAULT_HOURS: Record<string, string> = {
  monday: '8am-5pm', tuesday: '8am-5pm', wednesday: '8am-5pm',
  thursday: '8am-5pm', friday: '8am-5pm', saturday: 'Closed', sunday: 'Closed',
}

type FAQ = { q: string; a: string }

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [userId, setUserId] = useState('')
  const [saving, setSaving] = useState(false)

  // Step 1 — Business basics
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // Step 2 — Services + Hours
  const [services, setServices] = useState('')
  const [hours, setHours] = useState<Record<string, string>>(DEFAULT_HOURS)

  // Step 3 — FAQs
  const [faqs, setFaqs] = useState<FAQ[]>([
    { q: 'Do you offer free estimates?', a: 'Yes! We offer free estimates for all jobs.' },
    { q: '', a: '' },
  ])

  // Step 4 — AI config
  const [aiName, setAiName] = useState('Alex')
  const [aiPersonality, setAiPersonality] = useState('friendly and professional')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/login')
      else setUserId(user.id)
    })
  }, [router])

  async function finish() {
    setSaving(true)
    const faqsCleaned = faqs.filter((f) => f.q.trim() && f.a.trim())

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        name,
        industry,
        phone,
        address,
        ai_name: aiName,
        ai_personality: aiPersonality,
        services: services.split('\n').map((s) => s.trim()).filter(Boolean),
        hours,
        faqs: faqsCleaned,
      }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      setSaving(false)
      alert('Something went wrong. Please try again.')
    }
  }

  const totalSteps = 4

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Axon Setup</span>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${i + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about your business</h2>
              <p className="text-gray-500 text-sm mb-6">This is how your AI will introduce itself to customers.</p>
              <div className="space-y-4">
                <Field label="Business Name *" value={name} onChange={setName} placeholder="Mike's Landscaping" required />
                <Field label="Industry" value={industry} onChange={setIndustry} placeholder="Landscaping, Plumbing, HVAC..." />
                <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="(555) 000-0000" type="tel" />
                <Field label="Address (City, State is fine)" value={address} onChange={setAddress} placeholder="Tampa, FL" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">What do you offer?</h2>
              <p className="text-gray-500 text-sm mb-6">Your AI will use this to answer customer questions.</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Services (one per line)</label>
                  <textarea
                    value={services}
                    onChange={(e) => setServices(e.target.value)}
                    placeholder={"Lawn mowing\nTree trimming\nLeaf removal\nSprinkler repair"}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 min-h-[100px] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
                  <div className="space-y-2">
                    {DAYS.map((day) => (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-24 text-sm text-gray-600 capitalize">{day}</span>
                        <input
                          value={hours[day] ?? ''}
                          onChange={(e) => setHours((h) => ({ ...h, [day]: e.target.value }))}
                          placeholder="9am-5pm or Closed"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Common questions</h2>
              <p className="text-gray-500 text-sm mb-6">Add the questions customers ask most. Your AI will answer these instantly.</p>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                    <input
                      value={faq.q}
                      onChange={(e) => setFaqs((f) => f.map((x, j) => j === i ? { ...x, q: e.target.value } : x))}
                      placeholder="Question"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />
                    <textarea
                      value={faq.a}
                      onChange={(e) => setFaqs((f) => f.map((x, j) => j === i ? { ...x, a: e.target.value } : x))}
                      placeholder="Answer"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-h-[60px]"
                    />
                    {faqs.length > 1 && (
                      <button type="button" onClick={() => setFaqs((f) => f.filter((_, j) => j !== i))} className="text-xs text-red-400">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFaqs((f) => [...f, { q: '', a: '' }])}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add question
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Meet your AI assistant</h2>
              <p className="text-gray-500 text-sm mb-6">Give your assistant a name and personality. Customers will see this in the chat.</p>
              <div className="space-y-4">
                <Field
                  label="Assistant Name"
                  value={aiName}
                  onChange={setAiName}
                  placeholder="Alex"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Personality / Tone</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {['friendly and professional', 'casual and upbeat', 'formal and precise', 'warm and helpful'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setAiPersonality(p)}
                        className={`text-sm px-3 py-2 rounded-lg border transition-colors capitalize ${
                          aiPersonality === p ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <input
                    value={aiPersonality}
                    onChange={(e) => setAiPersonality(e.target.value)}
                    placeholder="Or type your own..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-xl p-4 border">
                  <p className="text-xs text-gray-400 mb-2">Preview message</p>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{aiName[0] || 'A'}</span>
                    </div>
                    <div className="bg-white rounded-xl px-3 py-2 text-sm text-gray-700 border border-gray-100 shadow-sm">
                      Hi! I'm {aiName || 'Alex'}{name ? `, the AI assistant for ${name}` : ''}. How can I help you today?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-xs text-gray-400">Step {step} of {totalSteps}</span>

          {step < totalSteps ? (
            <button
              onClick={() => { if (step === 1 && !name.trim()) { alert('Please enter your business name'); return } setStep((s) => s + 1) }}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Launch my AI
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        required={required}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
      />
    </div>
  )
}
