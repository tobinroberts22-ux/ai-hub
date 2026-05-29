'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardNav from '@/components/DashboardNav'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, MapPin, Edit2, Check, X, Plus, Star, Trash2, Loader2 } from 'lucide-react'

type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  tags: string[]
  notes: string | null
  source: string
  created_at: string
  last_contact_at: string
}

type Job = {
  id: string
  service: string
  scheduled_at: string | null
  completed_at: string | null
  duration_minutes: number | null
  price: number | null
  rating: number | null
  how_it_went: string | null
  status: string
  crew_id: string | null
  created_at: string
}

type Crew = { id: string; name: string; color: string }

const ALL_TAGS = ['Lead', 'Repeat', 'VIP', 'Inactive']
const SOURCE_LABELS: Record<string, string> = { chat: 'AI Chat', referral: 'Referral', google: 'Google', social: 'Social Media', manual: 'Added manually', other: 'Other' }

export default function CustomerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [crews, setCrews] = useState<Crew[]>([])
  const [businessId, setBusinessId] = useState('')
  const [loading, setLoading] = useState(true)

  // Edit mode state
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', address: '' })
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  // Add job modal
  const [showAddJob, setShowAddJob] = useState(false)
  const [jobForm, setJobForm] = useState({
    service: '', date: '', time: '', durationMinutes: 60,
    crewId: '', price: '', rating: 0, howItWent: '', status: 'completed',
  })
  const [savingJob, setSavingJob] = useState(false)

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: biz } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
    if (!biz) return
    setBusinessId(biz.id)

    const [{ data: cust }, { data: jobData }, { data: crewData }] = await Promise.all([
      supabase.from('customers').select('*').eq('id', customerId).eq('business_id', biz.id).single(),
      supabase.from('customer_jobs').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
      supabase.from('crews').select('id,name,color').eq('business_id', biz.id).eq('active', true),
    ])

    if (!cust) { router.push('/dashboard/customers'); return }

    setCustomer(cust as Customer)
    setNotes(cust.notes ?? '')
    setEditForm({ name: cust.name, phone: cust.phone ?? '', email: cust.email ?? '', address: cust.address ?? '' })
    setJobs((jobData ?? []) as Job[])
    setCrews((crewData ?? []) as Crew[])
    setLoading(false)
  }, [customerId, router])

  useEffect(() => { loadData() }, [loadData])

  async function saveEdit() {
    if (!editForm.name.trim()) return
    setSavingEdit(true)
    const { data } = await supabase.from('customers').update({
      name: editForm.name.trim(),
      phone: editForm.phone || null,
      email: editForm.email || null,
      address: editForm.address || null,
    }).eq('id', customerId).select('*').single()
    if (data) setCustomer(data as Customer)
    setEditing(false)
    setSavingEdit(false)
  }

  async function saveNotes() {
    setSavingNotes(true)
    await supabase.from('customers').update({ notes }).eq('id', customerId)
    setSavingNotes(false)
    setNotesSaved(true)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  async function toggleTag(tag: string) {
    if (!customer) return
    const tags = customer.tags.includes(tag) ? customer.tags.filter(t => t !== tag) : [...customer.tags, tag]
    await supabase.from('customers').update({ tags }).eq('id', customerId)
    setCustomer(c => c ? { ...c, tags } : c)
  }

  async function addJob() {
    if (!businessId || !jobForm.service.trim()) return
    setSavingJob(true)
    const scheduledAt = jobForm.date ? new Date(`${jobForm.date}T${jobForm.time || '09:00'}:00`).toISOString() : null
    const completedAt = jobForm.status === 'completed' && jobForm.date ? scheduledAt : null
    await supabase.from('customer_jobs').insert({
      business_id: businessId,
      customer_id: customerId,
      service: jobForm.service.trim(),
      crew_id: jobForm.crewId || null,
      scheduled_at: scheduledAt,
      completed_at: completedAt,
      duration_minutes: jobForm.durationMinutes || null,
      price: jobForm.price ? Number(jobForm.price) : null,
      rating: jobForm.rating || null,
      how_it_went: jobForm.howItWent || null,
      status: jobForm.status,
    })
    // Update last_contact_at
    await supabase.from('customers').update({ last_contact_at: new Date().toISOString() }).eq('id', customerId)
    await loadData()
    setShowAddJob(false)
    setJobForm({ service: '', date: '', time: '', durationMinutes: 60, crewId: '', price: '', rating: 0, howItWent: '', status: 'completed' })
    setSavingJob(false)
  }

  async function deleteJob(id: string) {
    await supabase.from('customer_jobs').delete().eq('id', id)
    setJobs(j => j.filter(x => x.id !== id))
  }

  if (loading) return (
    <div className="flex h-screen"><DashboardNav />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!customer) return null

  const totalSpend = jobs.reduce((s, j) => s + (j.price ? Number(j.price) : 0), 0)
  const completedJobs = jobs.filter(j => j.status === 'completed')
  const avgRating = completedJobs.filter(j => j.rating).reduce((s, j, _, a) => s + (j.rating! / a.length), 0)

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-4xl mx-auto">

          {/* Back */}
          <Link href="/dashboard/customers" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Customers
          </Link>

          {/* Header card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                  <span className="text-white text-xl font-black">{customer.name[0].toUpperCase()}</span>
                </div>
                {editing ? (
                  <div className="space-y-2">
                    <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="text-xl font-bold text-gray-900 border-b-2 border-blue-400 outline-none bg-transparent w-full" />
                    <div className="flex gap-2">
                      <input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-400" />
                      <input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-400" />
                    </div>
                    <input value={editForm.address} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-blue-400 w-full" />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-black text-gray-900">{customer.name}</h1>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {customer.phone && (
                        <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                          <Phone className="w-3.5 h-3.5" /> {customer.phone}
                        </a>
                      )}
                      {customer.email && (
                        <a href={`mailto:${customer.email}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                          <Mail className="w-3.5 h-3.5" /> {customer.email}
                        </a>
                      )}
                      {customer.address && (
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" /> {customer.address}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Source: {SOURCE_LABELS[customer.source] ?? customer.source} · Added {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {editing ? (
                  <>
                    <button onClick={saveEdit} disabled={savingEdit} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors">
                      {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save
                    </button>
                    <button onClick={() => { setEditing(false); setEditForm({ name: customer.name, phone: customer.phone ?? '', email: customer.email ?? '', address: customer.address ?? '' }) }} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {customer.phone && (
                      <a href={`tel:${customer.phone}`} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                        <Phone className="w-4 h-4" /> Call
                      </a>
                    )}
                    <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400 font-medium">Tags:</span>
              {ALL_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${customer.tags.includes(tag) ? tagActive(tag) : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {customer.tags.includes(tag) ? '✓ ' : '+ '}{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <StatBox label="Total Jobs" value={completedJobs.length.toString()} sub={`${jobs.length} total incl. scheduled`} />
            <StatBox label="Total Spend" value={totalSpend > 0 ? `$${totalSpend.toLocaleString()}` : '—'} sub="across all jobs" />
            <StatBox label="Avg Rating" value={avgRating > 0 ? `${avgRating.toFixed(1)} ★` : '—'} sub={`from ${completedJobs.filter(j => j.rating).length} rated jobs`} />
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Notes</h2>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add notes about this customer — preferences, property details, anything the crew should know..."
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-400 min-h-[80px] resize-none"
            />
            <button onClick={saveNotes} disabled={savingNotes} className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 transition-colors">
              {savingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : notesSaved ? <Check className="w-3.5 h-3.5 text-green-600" /> : null}
              {notesSaved ? 'Saved!' : 'Save notes'}
            </button>
          </div>

          {/* Job history */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-gray-900">Job History</h2>
              <button onClick={() => setShowAddJob(true)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Job
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-10 text-gray-300">
                <p className="text-sm">No job history yet.</p>
                <p className="text-xs mt-1">Add the first job to start building this customer&apos;s record.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => {
                  const crew = crews.find(c => c.id === job.crew_id)
                  const date = job.completed_at || job.scheduled_at
                  return (
                    <div key={job.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">{job.service}</span>
                            <StatusBadge status={job.status} />
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                            {date && <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                            {job.duration_minutes && <span>{job.duration_minutes < 60 ? `${job.duration_minutes}m` : `${job.duration_minutes / 60}hr`}</span>}
                            {crew && (
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: crew.color }} />
                                {crew.name}
                              </span>
                            )}
                            {job.price && <span className="font-semibold text-gray-600">${Number(job.price).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {job.rating && (
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3.5 h-3.5 ${s <= job.rating! ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                              ))}
                            </div>
                          )}
                          <button onClick={() => deleteJob(job.id)} className="text-gray-200 hover:text-red-400 transition-colors ml-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {job.how_it_went && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mt-2 leading-relaxed">
                          &ldquo;{job.how_it_went}&rdquo;
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Job Modal */}
      {showAddJob && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAddJob(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Add Job Record</h3>
              <button onClick={() => setShowAddJob(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3 mb-5">
              <JF label="Service *" value={jobForm.service} set={v => setJobForm(f => ({ ...f, service: v }))} ph="Lawn mowing, HVAC repair..." />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select value={jobForm.status} onChange={e => setJobForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  <option value="completed">Completed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <JF label="Date" value={jobForm.date} set={v => setJobForm(f => ({ ...f, date: v }))} type="date" />
                <JF label="Time" value={jobForm.time} set={v => setJobForm(f => ({ ...f, time: v }))} type="time" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                  <select value={jobForm.durationMinutes} onChange={e => setJobForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                    {[30,45,60,90,120,150,180,240,300,480].map(m => <option key={m} value={m}>{m < 60 ? `${m}m` : `${m/60}hr`}</option>)}
                  </select>
                </div>
                <JF label="Price ($)" value={jobForm.price} set={v => setJobForm(f => ({ ...f, price: v }))} ph="150" type="number" />
              </div>
              {crews.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Crew</label>
                  <select value={jobForm.crewId} onChange={e => setJobForm(f => ({ ...f, crewId: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                    <option value="">— Unassigned —</option>
                    {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setJobForm(f => ({ ...f, rating: f.rating === s ? 0 : s }))} className="transition-transform hover:scale-110">
                      <Star className={`w-6 h-6 ${s <= jobForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                    </button>
                  ))}
                  {jobForm.rating > 0 && <span className="text-xs text-gray-400 ml-1 self-center">{['','Poor','Fair','Good','Great','Excellent'][jobForm.rating]}</span>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">How did it go?</label>
                <textarea value={jobForm.howItWent} onChange={e => setJobForm(f => ({ ...f, howItWent: e.target.value }))} placeholder="Customer was happy, lawn looked great. Prefers morning visits. Gate code is 1234." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-h-[70px] resize-none" />
              </div>
            </div>
            <button onClick={addJob} disabled={savingJob || !jobForm.service.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              {savingJob && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Job Record
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function tagActive(tag: string) {
  const m: Record<string, string> = { Lead: 'bg-blue-600 text-white', Repeat: 'bg-green-600 text-white', VIP: 'bg-amber-500 text-white', Inactive: 'bg-gray-400 text-white' }
  return m[tag] ?? 'bg-blue-600 text-white'
}

function StatBox({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-300 mt-0.5">{sub}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = { completed: 'bg-green-50 text-green-700', scheduled: 'bg-blue-50 text-blue-700', cancelled: 'bg-gray-100 text-gray-500', no_show: 'bg-red-50 text-red-600' }
  const labels: Record<string, string> = { completed: 'Completed', scheduled: 'Scheduled', cancelled: 'Cancelled', no_show: 'No Show' }
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status] ?? 'bg-gray-100 text-gray-500'}`}>{labels[status] ?? status}</span>
}

function JF({ label, value, set, ph, type = 'text' }: { label: string; value: string; set: (v: string) => void; ph?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
    </div>
  )
}
