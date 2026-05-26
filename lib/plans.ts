// Plan config — safe to import on both client and server
// Keep Stripe SDK imports in lib/stripe.ts (server only)

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 97,
    priceId: process.env.STRIPE_STARTER_PRICE_ID ?? '',
    conversations: 100,
    features: [
      'AI chat widget for your website',
      'Up to 100 conversations/month',
      'Lead capture (name + phone saved automatically)',
      'Booking requests saved to your dashboard',
      'View all conversation history',
      'Email support',
    ],
  },
  growth: {
    name: 'Growth',
    price: 197,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID ?? '',
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
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? '',
    conversations: 1000,
    features: [
      'Everything in Growth',
      'Up to 1,000 conversations/month',
      'Professional website built for your business',
      'Automated appointment reminders',
      'AI handles rescheduling and cancellations',
      'AI content generation (social posts, promos)',
      'Custom AI personality & branding',
      'Priority onboarding call with Toby',
      'Same-day support',
    ],
  },
}

export type PlanKey = keyof typeof PLANS
