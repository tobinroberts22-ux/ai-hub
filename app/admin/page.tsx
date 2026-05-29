'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Users, DollarSign, MessageSquare } from 'lucide-react'
import Link from 'next/link'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL

type Business = {
  id: string
  name: string
  industry: string | null
  email: string | null
  plan: string
  subscription_status: string
  created_at: string
}

type UsageSummary = { business_id: string; conversation_count: number; token_count: number }

export default function AdminPage() {
  const router = useRouter()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [usageMap, setUsageMap] = useState<Record<string, UsageSummary>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/dashboard')
        return
      }

      const [{ data: bizList }, { data: usageList }] = await Promise.all([
        supabase.from('businesses').select('id, name, industry, email, plan, subscription_status, created_at').order('created_at', { ascending: false }),
        supabase.from('usage').select('business_id, conversation_count, token_count').eq('month', new Date().toISOString().slice(0, 7)),
      ])

      setBusinesses(bizList ?? [])
      const map: Record<string, UsageSummary> = {}
      for (const u of usageList ?? []) map[u.business_id] = u
      setUsageMap(map)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const active = businesses.filter((b) => b.subscription_status === 'active')
  const trialing = businesses.filter((b) => b.subscription_status === 'trialing')
  const mrr = active.reduce((sum, b) => {
    const prices: Record<string, number> = { starter: 97, growth: 197, pro: 397 }
    return sum + (prices[b.plan] ?? 0)
  }, 0)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold">Axon Admin</span>
        <Link href="/dashboard" className="ml-auto text-sm text-gray-400 hover:text-white">
          ← Back to dashboard
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-8">Overview</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<Users className="w-5 h-5 text-blue-400" />} label="Total clients" value={businesses.length.toString()} />
          <StatCard icon={<DollarSign className="w-5 h-5 text-green-400" />} label="MRR" value={`$${mrr.toLocaleString()}`} />
          <StatCard icon={<Users className="w-5 h-5 text-purple-400" />} label="Active" value={active.length.toString()} />
          <StatCard icon={<MessageSquare className="w-5 h-5 text-orange-400" />} label="Trialing" value={trialing.length.toString()} />
        </div>

        {/* Client table */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-base text-white">All Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs">
                    <th className="text-left py-2 pr-4">Business</th>
                    <th className="text-left py-2 pr-4">Industry</th>
                    <th className="text-left py-2 pr-4">Plan</th>
                    <th className="text-left py-2 pr-4">Status</th>
                    <th className="text-right py-2 pr-4">Convos (mo)</th>
                    <th className="text-left py-2">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {businesses.map((b) => {
                    const usage = usageMap[b.id]
                    return (
                      <tr key={b.id} className="text-gray-300">
                        <td className="py-3 pr-4">
                          <p className="font-medium text-white">{b.name}</p>
                          <p className="text-xs text-gray-500">{b.email}</p>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{b.industry ?? '—'}</td>
                        <td className="py-3 pr-4 capitalize">{b.plan}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant={b.subscription_status === 'active' ? 'default' : 'secondary'}
                            className="text-xs capitalize"
                          >
                            {b.subscription_status}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-right">{usage?.conversation_count ?? 0}</td>
                        <td className="py-3 text-gray-400 text-xs">
                          {new Date(b.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {businesses.length === 0 && (
                <p className="text-center text-gray-500 py-8 text-sm">No clients yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">{icon}<p className="text-xs text-gray-400">{label}</p></div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
