import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const getMetadata = (obj: { metadata?: Record<string, string> | null }) => {
    return obj.metadata ?? {}
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const { userId, plan } = session.metadata ?? {}
      if (userId && plan) {
        await supabaseAdmin
          .from('businesses')
          .update({
            subscription_status: 'active',
            plan,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('user_id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const { userId, plan } = getMetadata(sub)
      if (userId) {
        await supabaseAdmin
          .from('businesses')
          .update({
            subscription_status: sub.status,
            plan: plan ?? undefined,
          })
          .eq('user_id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const { userId } = getMetadata(sub)
      if (userId) {
        await supabaseAdmin
          .from('businesses')
          .update({ subscription_status: 'canceled' })
          .eq('user_id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
