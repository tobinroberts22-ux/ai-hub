import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 97,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    conversations: 100,
    features: [
      'AI chat widget for your website',
      'Up to 100 conversations/month',
      'Lead capture (name + phone)',
      'Booking requests saved to dashboard',
      'View all conversation history',
      'Email support',
    ],
  },
  growth: {
    name: 'Growth',
    price: 197,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
    conversations: 300,
    features: [
      'Everything in Starter',
      'Up to 300 conversations/month',
      'Google Calendar / Calendly integration',
      'AI books appointments in real time',
      'Customer confirmations sent automatically',
      'Review response drafts',
      'Follow-up message templates',
      'Priority email support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 397,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    conversations: 1000,
    features: [
      'Everything in Growth',
      'Up to 1,000 conversations/month',
      'Automated appointment reminders',
      'AI handles rescheduling and cancellations',
      'Buffer times between jobs',
      'Emergency vs routine job routing',
      'AI content generation (social posts, promos)',
      'Custom AI personality',
      'Priority onboarding call',
      'Same-day support',
    ],
  },
}
