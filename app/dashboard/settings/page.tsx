'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardNav from '@/components/DashboardNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Check, Loader2, Plus, Trash2 } from 'lucide-react'

type Crew = { id: string; name: string; color: string }
type JobType = { id: string; name: string; duration_minutes: number; buffer_minutes: number }

const CREW_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316']

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

type FAQ = { q: string; a: string }

export default function SettingsPage() {
  const [userId, setUserId] = useState('')
  const [businessId, setBusinessId] = useState('')
  const [plan, setPlan] = useState('starter')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Crews state
  const [crews, setCrews] = useState<Crew[]>([])
  const [newCrewName, setNewCrewName] = useState('')
  const [newCrewColor, setNewCrewColor] = useState(CREW_COLORS[0])
  const [addingCrew, setAddingCrew] = useState(false)

  // Job types state
  const [jobTypes, setJobTypes] = useState<JobType[]>([])
  const [newJtName, setNewJtName] = useState('')
  const [newJtDuration, setNewJtDuration] = useState(60)
  const [newJtBuffer, setNewJtBuffer] = useState(30)
  const [addingJt, setAddingJt] = useState(false)

  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [aiName, setAiName] = useState('Alex')
  const [aiPersonality, setAiPersonality] = useState('friendly and professional')
  const [services, setServices] = useState('')
  const [hours, setHours] = useState<Record<string, string>>({})
  const [faqs, setFaqs] = useState<FAQ[]>([{ q: '', a: '' }])
  const [calendlyUrl, setCalendlyUrl] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setName(data.name ?? '')
        setIndustry(data.industry ?? '')
        setPhone(data.phone ?? '')
        setEmail(data.email ?? '')
        setAddress(data.address ?? '')
        setAiName(data.ai_name ?? 'Alex')
        setAiPersonality(data.ai_personality ?? 'friendly and professional')
        setServices((data.services ?? []).join('\n'))
        setHours(data.hours ?? {})
        setFaqs(data.faqs?.length ? data.faqs : [{ q: '', a: '' }])
        setCalendlyUrl(data.calendly_url ?? '')
        setPlan(data.plan ?? 'starter')
        setBusinessId(data.id)

        // Load crews and job types
        const [{ data: crewData }, { data: jtData }] = await Promise.all([
          supabase.from('crews').select('id,name,color').eq('business_id', data.id).eq('active', true).order('created_at'),
          supabase.from('job_types').select('id,name,duration_minutes,buffer_minutes').eq('business_id', data.id).order('created_at'),
        ])
        setCrews(crewData ?? [])
        setJobTypes(jtData ?? [])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function addCrew() {
    if (!newCrewName.trim() || !businessId) return
    setAddingCrew(true)
    const { data } = await supabase.from('crews').insert({ business_id: businessId, name: newCrewName.trim(), color: newCrewColor }).select('id,name,color').single()
    if (data) setCrews(c => [...c, data])
    setNewCrewName('')
    setNewCrewColor(CREW_COLORS[(crews.length + 1) % CREW_COLORS.length])
    setAddingCrew(false)
  }

  async function deleteCrew(id: string) {
    await supabase.from('crews').update({ active: false }).eq('id', id)
    setCrews(c => c.filter(x => x.id !== id))
  }

  async function addJobType() {
    if (!newJtName.trim() || !businessId) return
    setAddingJt(true)
    const { data } = await supabase.from('job_types').insert({ business_id: businessId, name: newJtName.trim(), duration_minutes: newJtDuration, buffer_minutes: newJtBuffer }).select('id,name,duration_minutes,buffer_minutes').single()
    if (data) setJobTypes(j => [...j, data])
    setNewJtName('')
    setNewJtDuration(60)
    setNewJtBuffer(30)
    setAddingJt(false)
  }

  async function deleteJobType(id: string) {
    await supabase.from('job_types').delete().eq('id', id)
    setJobTypes(j => j.filter(x => x.id !== id))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const faqsCleaned = faqs.filter((f) => f.q.trim() && f.a.trim())

    await fetch('/api/onboarding', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        name,
        industry,
        phone,
        email,
        address,
        ai_name: aiName,
        ai_personality: aiPersonality,
        services: services.split('\n').map((s) => s.trim()).filter(Boolean),
        hours,
        faqs: faqsCleaned,
        calendly_url: calendlyUrl || null,
      }),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <DashboardNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
          <p className="text-gray-500 text-sm mb-8">Update your business info and AI assistant configuration.</p>

          <form onSubmit={save} className="space-y-6">
            {/* Business Info */}
            <Card>
              <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="Business Name" value={name} onChange={setName} required />
                <Field label="Industry (e.g. Landscaping, Plumbing, HVAC)" value={industry} onChange={setIndustry} />
                <Field label="Phone Number" value={phone} onChange={setPhone} type="tel" />
                <Field label="Email" value={email} onChange={setEmail} type="email" />
                <Field label="Address" value={address} onChange={setAddress} />
              </CardContent>
            </Card>

            {/* AI Config */}
            <Card>
              <CardHeader><CardTitle className="text-base">AI Assistant</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Field label="Assistant Name (e.g. Alex, Maya, Sam)" value={aiName} onChange={setAiName} />
                <div>
                  <Label className="text-sm">Personality / Tone</Label>
                  <Input
                    value={aiPersonality}
                    onChange={(e) => setAiPersonality(e.target.value)}
                    placeholder="friendly and professional"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-400 mt-1">Examples: "casual and upbeat", "formal and precise", "warm and helpful"</p>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader><CardTitle className="text-base">Services</CardTitle></CardHeader>
              <CardContent>
                <Label className="text-sm">One service per line</Label>
                <Textarea
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder={"Lawn mowing\nTree trimming\nLeaf removal\nFertilization"}
                  className="mt-1.5 min-h-[100px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Hours */}
            <Card>
              <CardHeader><CardTitle className="text-base">Business Hours</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-600 capitalize">{day}</span>
                    <Input
                      value={hours[day] ?? ''}
                      onChange={(e) => setHours((h) => ({ ...h, [day]: e.target.value }))}
                      placeholder="9am-5pm or Closed"
                      className="flex-1 text-sm h-8"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* FAQs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">FAQs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                    <Input
                      value={faq.q}
                      onChange={(e) => setFaqs((f) => f.map((x, j) => j === i ? { ...x, q: e.target.value } : x))}
                      placeholder="Question (e.g. Do you offer free estimates?)"
                      className="text-sm"
                    />
                    <Textarea
                      value={faq.a}
                      onChange={(e) => setFaqs((f) => f.map((x, j) => j === i ? { ...x, a: e.target.value } : x))}
                      placeholder="Answer"
                      className="text-sm min-h-[60px]"
                    />
                    {faqs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setFaqs((f) => f.filter((_, j) => j !== i))}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
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
                  + Add another FAQ
                </button>
              </CardContent>
            </Card>

            {/* Crews */}
            <Card>
              <CardHeader><CardTitle className="text-base">Crews / Teams</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-400">Add each crew or team. They'll appear color-coded on your schedule calendar.</p>
                {crews.map(crew => (
                  <div key={crew.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: crew.color }} />
                    <span className="text-sm font-medium text-gray-800 flex-1">{crew.name}</span>
                    <button onClick={() => deleteCrew(crew.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <input
                    value={newCrewName}
                    onChange={e => setNewCrewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCrew()}
                    placeholder="Crew name (e.g. Crew A, Team Martinez)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <div className="flex gap-1">
                    {CREW_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewCrewColor(c)}
                        className={`w-6 h-6 rounded-full transition-transform ${newCrewColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addCrew}
                    disabled={addingCrew || !newCrewName.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    {addingCrew ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Job Types */}
            <Card>
              <CardHeader><CardTitle className="text-base">Job Types</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-400">Define your services with estimated durations. The AI will use this when scheduling jobs.</p>
                {jobTypes.map(jt => (
                  <div key={jt.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                    <span className="text-sm font-medium text-gray-800 flex-1">{jt.name}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {jt.duration_minutes < 60 ? `${jt.duration_minutes}m` : `${jt.duration_minutes / 60}hr`}
                      {jt.buffer_minutes > 0 ? ` + ${jt.buffer_minutes}m buffer` : ''}
                    </span>
                    <button onClick={() => deleteJobType(jt.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  <input
                    value={newJtName}
                    onChange={e => setNewJtName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addJobType()}
                    placeholder="Service name (e.g. Lawn mowing)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                  <select value={newJtDuration} onChange={e => setNewJtDuration(Number(e.target.value))} className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-blue-400">
                    {[30,45,60,90,120,150,180,240,300,480].map(m => (
                      <option key={m} value={m}>{m < 60 ? `${m}m` : `${m/60}hr`}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addJobType}
                    disabled={addingJt || !newJtName.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    {addingJt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Scheduling — Calendly for Growth/Pro */}
            {(plan === 'growth' || plan === 'pro') && (
              <Card>
                <CardHeader><CardTitle className="text-base">Scheduling (Calendly)</CardTitle></CardHeader>
                <CardContent>
                  <Label className="text-sm">Your Calendly booking URL</Label>
                  <Input
                    value={calendlyUrl}
                    onChange={(e) => setCalendlyUrl(e.target.value)}
                    placeholder="https://calendly.com/yourbusiness"
                    className="mt-1.5"
                    type="url"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Your AI will share this link when customers want to book. Get yours free at{' '}
                    <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      calendly.com
                    </a>
                  </p>
                </CardContent>
              </Card>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

function Field({
  label, value, onChange, type = 'text', required = false,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        required={required}
        className="mt-1.5"
      />
    </div>
  )
}
