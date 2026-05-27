'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardNav from '@/components/DashboardNav'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, Users, TrendingUp, Calendar, Zap, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Conversation = {
  id: string
  customer_name: string | null
  customer_phone: string | null
  lead_captured: boolean
  message_count: number
  last_message_at: string
  started_at: string
}

type Business = {
  id: string
  name: string
  plan: string
  subscription_status: string
  onboarding_complete: boolean
}

type UsageData = {
  conversation_count: number
  token_count: number
}

const PLAN_LIMITS: Record<string, number> = {
  trialing: 20,
  starter: 100,
  growth: 300,
  pro: 1000,
}

export default function DashboardPage() {
  const router = useRouter()
  const [business, setBusiness] = useState<Business | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: biz } = await supabase
        .from('businesses')
        .select('id, name, plan, subscription_status, onboarding_complete')
        .eq('user_id', user.id)
        .single()

      if (!biz) { router.push('/onboarding'); return }
      if (!biz.onboarding_complete) { router.push('/onboarding'); return }

      setBusiness(biz)

      const [{ data: convs }, { data: usageData }] = await Promise.all([
        supabase
          .from('conversations')
          .select('id, customer_name, customer_phone, lead_captured, message_count, last_message_at, started_at')
          .eq('business_id', biz.id)
          .order('last_message_at', { ascending: false })
          .limit(20),
        supabase
          .from('usage')
          .select('conversation_count, token_count')
          .eq('business_id', biz.id)
          .eq('month', new Date().toISOString().slice(0, 7))
          .single(),
      ])

      setConversations(convs ?? [])
      setUsage(usageData)
      setLoading(false)
    }
    load()
  }, [router])

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

  if (!business) return null

  const limit = PLAN_LIMITS[business.plan] ?? 20
  const used = usage?.conversation_count ?? 0
  const leads = conversations.filter((c) => c.lead_captured).length
  const isTrialing = business.subscription_status === 'trialing'
  const trialExpired = isTrialing && used >= limit

  // Hard paywall — trial used up and no active subscription
  if (trialExpired) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardNav />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Zap className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your free trial has ended</h2>
            <p className="text-gray-500 mb-2">
              You&apos;ve used all {limit} free conversations.
            </p>
            <p className="text-gray-500 mb-8">
              Pick a plan to keep your AI assistant running 24/7 and never miss another lead.
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-blue-600 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-700 transition-colors"
            >
              Choose a Plan →
            </Link>
            <p className="text-sm text-gray-400 mt-4">Starting at $97/month · No contracts · Cancel anytime</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening with your AI assistant</p>
            </div>
            <Badge
              variant={business.subscription_status === 'active' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {business.plan} plan
            </Badge>
          </div>

          {/* Trial banner */}
          {isTrialing && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">
                    Free trial — {Math.max(0, limit - used)} of {limit} conversations remaining
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    Upgrade before you hit the limit so your AI keeps running without interruption.
                  </p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
              label="Conversations this month"
              value={`${used} / ${limit}`}
              sub={`${Math.round((used / limit) * 100)}% of limit used`}
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-green-600" />}
              label="Leads captured"
              value={leads.toString()}
              sub="this month"
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
              label="Total conversations"
              value={conversations.length.toString()}
              sub="all time"
            />
            <StatCard
              icon={<Calendar className="w-5 h-5 text-orange-600" />}
              label="Plan"
              value={business.plan.charAt(0).toUpperCase() + business.plan.slice(1)}
              sub={business.subscription_status === 'trialing' ? 'Free trial' : 'Active'}
            />
          </div>

          {/* Conversation list */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No conversations yet.</p>
                  <p className="text-xs mt-1">Install your chat widget to start getting messages.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {conversations.map((c) => (
                    <div key={c.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {c.customer_name ?? 'Unknown visitor'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {c.customer_phone ?? 'No phone'} · {c.message_count} messages · {timeAgo(c.last_message_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.lead_captured && (
                          <Badge variant="secondary" className="text-green-700 bg-green-50 text-xs">
                            Lead
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center gap-2 mb-2">{icon}<p className="text-xs text-gray-500">{label}</p></div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
