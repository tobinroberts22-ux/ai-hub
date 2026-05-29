'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardNav from '@/components/DashboardNav'
import { ChevronLeft, ChevronRight, Plus, X, Clock, User, Phone, Briefcase, Users } from 'lucide-react'

const HOUR_HEIGHT = 64
const START_HOUR = 7
const END_HOUR = 19
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type Crew = { id: string; name: string; color: string }
type Booking = {
  id: string
  customer_name: string | null
  customer_phone: string | null
  service: string | null
  crew_id: string | null
  scheduled_start: string
  scheduled_end: string
  status: string
  notes: string | null
  address: string | null
}
type JobType = { id: string; name: string; duration_minutes: number }

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function fmt(date: Date, opts: Intl.DateTimeFormatOptions): string {
  return date.toLocaleDateString('en-US', opts)
}

function fmtTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function SchedulePage() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [crews, setCrews] = useState<Crew[]>([])
  const [jobTypes, setJobTypes] = useState<JobType[]>([])
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Booking | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', service: '', crewId: '',
    date: '', startTime: '09:00', durationMinutes: 60, notes: '', address: '',
  })
  const [saving, setSaving] = useState(false)

  const weekEnd = addDays(weekStart, 6)

  const loadBookings = useCallback(async () => {
    if (!businessId) return
    const start = weekStart.toISOString()
    const end = addDays(weekStart, 7).toISOString()
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('business_id', businessId)
      .gte('scheduled_start', start)
      .lt('scheduled_start', end)
      .neq('status', 'cancelled')
    setBookings(data ?? [])
  }, [businessId, weekStart])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: biz } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
      if (!biz) return
      setBusinessId(biz.id)
      const [{ data: crewData }, { data: jtData }] = await Promise.all([
        supabase.from('crews').select('id,name,color').eq('business_id', biz.id).eq('active', true).order('created_at'),
        supabase.from('job_types').select('id,name,duration_minutes').eq('business_id', biz.id).order('created_at'),
      ])
      setCrews(crewData ?? [])
      setJobTypes(jtData ?? [])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => { loadBookings() }, [loadBookings])

  function crewColor(id: string | null) { return id ? (crews.find(c => c.id === id)?.color ?? '#6B7280') : '#6B7280' }
  function crewName(id: string | null) { return id ? (crews.find(c => c.id === id)?.name ?? 'Unknown') : 'Unassigned' }

  function bookingStyle(b: Booking) {
    const s = new Date(b.scheduled_start), e = new Date(b.scheduled_end)
    const sh = s.getHours() + s.getMinutes() / 60
    const eh = e.getHours() + e.getMinutes() / 60
    return {
      top: Math.max(0, (sh - START_HOUR) * HOUR_HEIGHT),
      height: Math.max(28, (eh - sh) * HOUR_HEIGHT),
    }
  }

  function dayBookings(i: number) {
    const dayStr = addDays(weekStart, i).toISOString().slice(0, 10)
    return bookings.filter(b => b.scheduled_start.slice(0, 10) === dayStr)
  }

  function handleJobTypeChange(jtId: string) {
    const jt = jobTypes.find(j => j.id === jtId)
    setForm(f => ({ ...f, service: jt?.name ?? f.service, durationMinutes: jt?.duration_minutes ?? f.durationMinutes }))
  }

  async function createBooking() {
    if (!businessId || !form.customerName || !form.date || !form.startTime) return
    setSaving(true)
    const start = new Date(`${form.date}T${form.startTime}:00`)
    const end = new Date(start.getTime() + form.durationMinutes * 60000)
    await supabase.from('bookings').insert({
      business_id: businessId,
      crew_id: form.crewId || null,
      customer_name: form.customerName,
      customer_phone: form.customerPhone || null,
      service: form.service || null,
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
      address: form.address || null,
      notes: form.notes || null,
      status: 'confirmed',
    })
    await loadBookings()
    setShowAdd(false)
    setForm({ customerName: '', customerPhone: '', service: '', crewId: '', date: '', startTime: '09:00', durationMinutes: 60, notes: '', address: '' })
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('bookings').update({ status }).eq('id', id)
    setSelected(null)
    await loadBookings()
  }

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

  if (loading) return (
    <div className="flex h-screen"><DashboardNav />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1 overflow-hidden flex flex-col">

        {/* Toolbar */}
        <div className="border-b bg-white px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekStart(w => addDays(w, -7))} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-900 w-44 text-center">
              {fmt(weekStart, { month: 'short', day: 'numeric' })} – {fmt(weekEnd, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button onClick={() => setWeekStart(w => addDays(w, 7))} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setWeekStart(getWeekStart(new Date()))} className="text-xs text-blue-600 hover:underline px-2">
            Today
          </button>

          {/* Crew legend */}
          <div className="flex gap-3 ml-1 overflow-x-auto">
            {crews.length === 0 ? (
              <span className="text-xs text-gray-400 whitespace-nowrap">No crews yet — add them in Settings → Scheduling</span>
            ) : crews.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                <span className="text-xs text-gray-500">{c.name}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Booking
          </button>
        </div>

        {/* Calendar */}
        <div className="flex-1 overflow-auto">
          <div className="flex min-w-[700px]">

            {/* Time column */}
            <div className="w-14 flex-shrink-0 border-r border-gray-200 bg-white sticky left-0 z-10">
              <div className="h-12 border-b border-gray-200" />
              {hours.map(h => (
                <div key={h} className="relative" style={{ height: HOUR_HEIGHT }}>
                  <span className="absolute -top-2.5 right-2 text-[10px] text-gray-400 font-medium select-none">
                    {h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAY_LABELS.map((label, i) => {
              const date = addDays(weekStart, i)
              const isToday = date.toDateString() === new Date().toDateString()
              const dBookings = dayBookings(i)

              return (
                <div key={label} className="flex-1 border-r border-gray-200 min-w-0">
                  {/* Day header */}
                  <div className={`h-12 border-b border-gray-200 flex flex-col items-center justify-center sticky top-0 z-10 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
                    <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>{date.getDate()}</span>
                  </div>

                  {/* Hour grid */}
                  <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
                    {hours.map(h => (
                      <div key={h} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: (h - START_HOUR) * HOUR_HEIGHT }} />
                    ))}

                    {/* Booking blocks */}
                    {dBookings.map(b => {
                      const { top, height } = bookingStyle(b)
                      const color = crewColor(b.crew_id)
                      const startTime = fmtTime(new Date(b.scheduled_start))
                      return (
                        <button
                          key={b.id}
                          onClick={() => setSelected(b)}
                          className="absolute left-1 right-1 rounded-lg px-2 py-1 text-left overflow-hidden hover:opacity-90 transition-opacity shadow-sm border-l-[3px]"
                          style={{ top, height, background: color + '18', borderLeftColor: color }}
                        >
                          <p className="text-[11px] font-semibold truncate leading-tight" style={{ color }}>
                            {b.customer_name ?? 'Customer'}
                          </p>
                          {height > 40 && (
                            <p className="text-[10px] truncate opacity-70 leading-tight" style={{ color }}>
                              {startTime}{b.service ? ` · ${b.service}` : ''}
                            </p>
                          )}
                          {height > 60 && b.crew_id && (
                            <p className="text-[10px] truncate opacity-60 leading-tight" style={{ color }}>
                              {crewName(b.crew_id)}
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Booking detail modal */}
      {selected && (
        <Modal onClose={() => setSelected(null)} title="Booking Details">
          <div className="space-y-3 mb-5">
            <DetailRow icon={<User className="w-4 h-4" />} label="Customer" value={selected.customer_name ?? 'Unknown'} />
            <DetailRow icon={<Phone className="w-4 h-4" />} label="Phone" value={selected.customer_phone ?? 'Not provided'} />
            <DetailRow icon={<Briefcase className="w-4 h-4" />} label="Service" value={selected.service ?? 'Not specified'} />
            <DetailRow
              icon={<Clock className="w-4 h-4" />}
              label="Time"
              value={`${fmt(new Date(selected.scheduled_start), { weekday: 'short', month: 'short', day: 'numeric' })} · ${fmtTime(new Date(selected.scheduled_start))} – ${fmtTime(new Date(selected.scheduled_end))}`}
            />
            {selected.crew_id && (
              <DetailRow
                icon={<div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: crewColor(selected.crew_id) }} />}
                label="Crew"
                value={crewName(selected.crew_id)}
              />
            )}
            {selected.address && <DetailRow icon={<Users className="w-4 h-4" />} label="Address" value={selected.address} />}
            {selected.notes && <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 mt-2">{selected.notes}</div>}
          </div>
          <div className="flex gap-2">
            {selected.status !== 'completed' && (
              <button onClick={() => updateStatus(selected.id, 'completed')} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                ✓ Complete
              </button>
            )}
            <button onClick={() => updateStatus(selected.id, 'cancelled')} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-2.5 rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* Add booking modal */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="Add Booking">
          <div className="space-y-3 mb-5">
            <MField label="Customer Name *" value={form.customerName} onChange={v => setForm(f => ({ ...f, customerName: v }))} placeholder="John Smith" />
            <MField label="Phone Number" value={form.customerPhone} onChange={v => setForm(f => ({ ...f, customerPhone: v }))} placeholder="(555) 000-0000" type="tel" />

            {jobTypes.length > 0 ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Service</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  value=""
                  onChange={e => { handleJobTypeChange(e.target.value); setForm(f => ({ ...f, service: jobTypes.find(j => j.id === e.target.value)?.name ?? f.service })) }}
                >
                  <option value="">— Pick a service —</option>
                  {jobTypes.map(j => <option key={j.id} value={j.id}>{j.name} ({j.duration_minutes < 60 ? `${j.duration_minutes}m` : `${j.duration_minutes / 60}hr`})</option>)}
                </select>
                <input type="text" value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} placeholder="Or type custom..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 mt-1.5" />
              </div>
            ) : (
              <MField label="Service" value={form.service} onChange={v => setForm(f => ({ ...f, service: v }))} placeholder="Lawn mowing, HVAC repair..." />
            )}

            <div className="grid grid-cols-2 gap-3">
              <MField label="Date *" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} type="date" />
              <MField label="Start Time *" value={form.startTime} onChange={v => setForm(f => ({ ...f, startTime: v }))} type="time" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
              <select value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {[30, 60, 90, 120, 150, 180, 240, 300, 480].map(m => (
                  <option key={m} value={m}>{m < 60 ? `${m} min` : m === 480 ? 'Full day (8hr)' : `${m / 60} hr${m > 60 ? 's' : ''}`}</option>
                ))}
              </select>
            </div>

            {crews.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Assign Crew</label>
                <select value={form.crewId} onChange={e => setForm(f => ({ ...f, crewId: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  <option value="">— Unassigned —</option>
                  {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}

            <MField label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="123 Main St, Tampa FL" />
            <MField label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Any special instructions..." />
          </div>
          <button
            onClick={createBooking}
            disabled={saving || !form.customerName || !form.date}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Save Booking
          </button>
        </Modal>
      )}
    </div>
  )
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>
      <div><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-medium text-gray-900">{value}</p></div>
    </div>
  )
}

function MField({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
    </div>
  )
}
