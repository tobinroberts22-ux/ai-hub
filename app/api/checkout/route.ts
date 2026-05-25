import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json()

    if (!plan || !userId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const planConfig = PLANS[plan as keyof typeof PLANS]
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get or create Stripe customer
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    let customerId = business?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('businesses')
        .update({ stripe_customer_id: customerId })
        .eq('user_id', userId)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/pricing`,
      metadata: { userId, plan },
      subscription_data: {
        metadata: { userId, plan },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
