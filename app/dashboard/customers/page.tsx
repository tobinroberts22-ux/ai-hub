'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardNav from '@/components/DashboardNav'
import Link from 'next/link'
import { Search, Plus, X, Users, Loader2 } from 'lucide-react'

type Customer = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  tags: string[]
  source: string
  last_contact_at: string
  created_at: string
}

type JobRow = {
  customer_id: string
  service: string
  completed_at: string | null
  price: number | null
  status: string
}

const ALL_TAGS = ['Lead', 'Repeat', 'VIP', 'Inactive']

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [jobMap, setJobMap] = useState<Record<string, { count: number; lastService: string | null; spend: number }>>({})
  const [businessId, setBusinessId] = useState('')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', tags: [] as string[], notes: '', source: 'manual' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: biz } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
      if (!biz) return
      setBusinessId(biz.id)

      const [{ data: custs }, { data: jobs }] = await Promise.all([
        supabase.from('customers').select('*').eq('business_id', biz.id).order('last_contact_at', { ascending: false }),
        supabase.from('customer_jobs').select('customer_id,service,completed_at,price,status').eq('business_id', biz.id),
      ])
      setCustomers(custs ?? [])

      const map: Record<string, { count: number; lastService: string | null; spend: number }> = {}
      for (const j of (jobs ?? []) as JobRow[]) {
        if (!map[j.customer_id]) map[j.customer_id] = { count: 0, lastService: null, spend: 0 }
        map[j.customer_id].count++
        if (j.price) map[j.customer_id].spend += Number(j.price)
        if (j.status === 'completed') map[j.customer_id].lastService = j.service
      }
      setJobMap(map)
      setLoading(false)
    }
    init()
  }, [])

  async function addCustomer() {
    if (!businessId || !form.name.trim()) return
    setSaving(true)
    const { data } = await supabase.from('customers').insert({
      business_id: businessId,
      name: form.name.trim(),
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      tags: form.tags,
      notes: form.notes || null,
      source: form.source,
    }).select('*').single()
    if (data) setCustomers(c => [data as Customer, ...c])
    setShowAdd(false)
    setForm({ name: '', phone: '', email: '', address: '', tags: [], notes: '', source: 'manual' })
    setSaving(false)
  }

  const filtered = customers.filter(c => {
    const s = search.toLowerCase()
    const matchSearch = !s || c.name.toLowerCase().includes(s) || c.phone?.includes(s) || c.email?.toLowerCase().includes(s)
    const matchTag = filterTag === 'All' || c.tags.includes(filterTag)
    return matchSearch && matchTag
  })

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
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-500 text-sm mt-1">Every lead and past customer in one place.</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Customers', value: customers.length },
              { label: 'Leads', value: customers.filter(c => c.tags.includes('Lead')).length },
              { label: 'Repeat Customers', value: customers.filter(c => c.tags.includes('Repeat')).length },
              { label: 'VIP', value: customers.filter(c => c.tags.includes('VIP')).length },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Search + tag filter */}
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, or email..." className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white" />
            </div>
            <div className="flex gap-1.5">
              {['All', ...ALL_TAGS].map(tag => (
                <button key={tag} onClick={() => setFilterTag(tag)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterTag === tag ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  {search || filterTag !== 'All' ? 'No customers match that filter.' : 'No customers yet.'}
                </p>
                <p className="text-xs mt-1 text-gray-300">
                  {!search && filterTag === 'All' ? 'They\'ll appear here automatically when the AI captures a lead, or add them manually.' : ''}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {['Customer', 'Contact', 'Tags', 'Jobs', 'Last Service', 'Last Contact'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => {
                    const j = jobMap[c.id] ?? { count: 0, lastService: null, spend: 0 }
                    return (
                      <tr key={c.id} className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5">
                          <Link href={`/dashboard/customers/${c.id}`} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">{c.name[0].toUpperCase()}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900 hover:text-blue-600">{c.name}</span>
                          </Link>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-xs text-gray-700">{c.phone ?? '—'}</p>
                          {c.email && <p className="text-xs text-gray-400 truncate max-w-[140px]">{c.email}</p>}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {c.tags.map(t => <TagBadge key={t} tag={t} />)}
                            {c.tags.length === 0 && <span className="text-xs text-gray-300">—</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-semibold text-gray-900">{j.count}</span>
                          {j.spend > 0 && <p className="text-xs text-gray-400">${j.spend.toFixed(0)} total</p>}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-600">{j.lastService ?? <span className="text-gray-300">None yet</span>}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-400">{timeAgo(c.last_contact_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Add Customer</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3 mb-5">
              <F label="Full Name *" value={form.name} set={v => setForm(f => ({ ...f, name: v }))} ph="John Smith" />
              <F label="Phone" value={form.phone} set={v => setForm(f => ({ ...f, phone: v }))} ph="(555) 000-0000" type="tel" />
              <F label="Email" value={form.email} set={v => setForm(f => ({ ...f, email: v }))} ph="john@email.com" type="email" />
              <F label="Address" value={form.address} set={v => setForm(f => ({ ...f, address: v }))} ph="Tampa, FL" />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] }))} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.tags.includes(t) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">How did they find you?</label>
                <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  <option value="chat">AI Chat</option>
                  <option value="referral">Referral</option>
                  <option value="google">Google</option>
                  <option value="social">Social Media</option>
                  <option value="manual">Added manually</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <F label="Notes" value={form.notes} set={v => setForm(f => ({ ...f, notes: v }))} ph="Any important details about this customer..." />
            </div>
            <button onClick={addCustomer} disabled={saving || !form.name.trim()} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Customer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = { Lead: 'bg-blue-50 text-blue-700', Repeat: 'bg-green-50 text-green-700', VIP: 'bg-amber-50 text-amber-700', Inactive: 'bg-gray-100 text-gray-500' }
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${colors[tag] ?? 'bg-gray-100 text-gray-600'}`}>{tag}</span>
}

function F({ label, value, set, ph, type = 'text' }: { label: string; value: string; set: (v: string) => void; ph?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={ph} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
    </div>
  )
}

function timeAgo(d: string) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}
