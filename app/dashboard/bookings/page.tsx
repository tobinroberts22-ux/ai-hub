'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardNav from '@/components/DashboardNav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Phone, CheckCircle, XCircle, Clock } from 'lucide-react'

type BookingRequest = {
  id: string
  customer_name: string | null
  customer_phone: string | null
  service_requested: string | null
  preferred_date: string | null
  preferred_time: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState('')
  const [plan, setPlan] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: biz } = await supabase
        .from('businesses')
        .select('id, plan, calendly_url')
        .eq('user_id', user.id)
        .single()

      if (!biz) { setLoading(false); return }
      setBusinessId(biz.id)
      setPlan(biz.plan)

      const { data } = await supabase
        .from('booking_requests')
        .select('*')
        .eq('business_id', biz.id)
        .order('created_at', { ascending: false })

      setBookings(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  async function updateStatus(id: string, status: 'confirmed' | 'cancelled') {
    await supabase.from('booking_requests').update({ status }).eq('id', id)
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  const pending = bookings.filter((b) => b.status === 'pending')
  const others = bookings.filter((b) => b.status !== 'pending')

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardNav />
      <main className="flex-1 overflow-auto p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Booking Requests</h1>
        <p className="text-gray-500 text-sm mb-8">Customers who asked to schedule through your AI assistant.</p>

        {loading ? (
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="space-y-6">
            {/* Calendly upgrade prompt for starter */}
            {plan === 'starter' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-5">
                  <p className="text-sm text-blue-800 font-medium">
                    Want your AI to book appointments automatically? Upgrade to Growth and connect your calendar — no more manual back-and-forth.
                  </p>
                  <a href="/pricing" className="text-blue-600 text-sm underline mt-1 inline-block">
                    See Growth plan →
                  </a>
                </CardContent>
              </Card>
            )}

            {/* Pending */}
            {pending.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Needs your response ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map((b) => (
                    <BookingCard key={b.id} booking={b} onConfirm={() => updateStatus(b.id, 'confirmed')} onCancel={() => updateStatus(b.id, 'cancelled')} />
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {others.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Past Requests</h2>
                <div className="space-y-3">
                  {others.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              </div>
            )}

            {bookings.length === 0 && (
              <Card>
                <CardContent className="text-center py-12 text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No booking requests yet.</p>
                  <p className="text-xs mt-1">When customers ask to schedule through your chat, they'll appear here.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function BookingCard({
  booking,
  onConfirm,
  onCancel,
}: {
  booking: BookingRequest
  onConfirm?: () => void
  onCancel?: () => void
}) {
  const statusColors = {
    pending: 'bg-orange-50 text-orange-700 border-orange-200',
    confirmed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
  }

  return (
    <Card className={booking.status !== 'pending' ? 'opacity-70' : ''}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold text-gray-900 text-sm">{booking.customer_name ?? 'Unknown'}</p>
              <Badge variant="outline" className={`text-xs ${statusColors[booking.status]}`}>
                {booking.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {booking.customer_phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {booking.customer_phone}
                </span>
              )}
              {booking.preferred_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {booking.preferred_date} {booking.preferred_time ?? ''}
                </span>
              )}
            </div>
            {booking.service_requested && (
              <p className="text-xs text-gray-500 mt-1">Service: {booking.service_requested}</p>
            )}
            {booking.notes && (
              <p className="text-xs text-gray-400 mt-1 truncate">{booking.notes}</p>
            )}
          </div>

          {booking.status === 'pending' && onConfirm && onCancel && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={onConfirm}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <CheckCircle className="w-3 h-3" />
                Confirm
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                <XCircle className="w-3 h-3" />
                Decline
              </button>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-300 mt-2">{new Date(booking.created_at).toLocaleString()}</p>
      </CardContent>
    </Card>
  )
}
