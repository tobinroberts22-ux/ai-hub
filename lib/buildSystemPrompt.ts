type FAQ = { q: string; a: string }
type Hours = Record<string, string>

interface Business {
  name: string
  industry: string | null
  phone: string | null
  email: string | null
  address: string | null
  hours: Hours | null
  services: string[] | null
  faqs: FAQ[] | null
  ai_name: string | null
  ai_personality: string | null
  plan: string | null
  calendly_url: string | null
}

export function buildSystemPrompt(business: Business): string {
  const aiName = business.ai_name || 'Alex'
  const personality = business.ai_personality || 'friendly and professional'
  const plan = business.plan || 'starter'

  const hoursText = business.hours
    ? Object.entries(business.hours)
        .map(([day, hours]) => `  ${capitalize(day)}: ${hours}`)
        .join('\n')
    : '  (Hours not set — tell customers to contact us for availability)'

  const servicesText =
    business.services && business.services.length > 0
      ? business.services.map((s) => `  - ${s}`).join('\n')
      : '  (Services not listed — say you offer a full range of services and someone will follow up)'

  const faqsText =
    business.faqs && business.faqs.length > 0
      ? business.faqs.map((f) => `  Q: ${f.q}\n  A: ${f.a}`).join('\n\n')
      : '  (No FAQs set)'

  const schedulingSection = buildSchedulingSection(plan, business.calendly_url)

  return `You are ${aiName}, the AI assistant for ${business.name}.
Your personality: ${personality}.
${business.industry ? `We are a ${business.industry} business.` : ''}
${business.address ? `Located at: ${business.address}` : ''}
${business.phone ? `Phone: ${business.phone}` : ''}

BUSINESS HOURS:
${hoursText}

OUR SERVICES:
${servicesText}

FREQUENTLY ASKED QUESTIONS:
${faqsText}

${schedulingSection}

YOUR ROLE:
1. Welcome customers warmly and answer questions about our services, pricing, and availability
2. ALWAYS try to capture the customer's name and phone number — this is your top priority
3. Be ${personality} in every response
4. Keep responses concise — no long paragraphs
5. If you genuinely don't know the answer, say "Let me have our team follow up with you on that" and ask for their contact info
6. When a customer shares their contact info, acknowledge it warmly: "Perfect! I've got your info — someone from our team will be in touch soon."
7. Never make up prices, availability, or services we don't offer
8. If asked about emergency services outside business hours, capture their info immediately and let them know the team will respond ASAP

LEAD CAPTURE:
When a customer seems interested or asks about pricing/scheduling, naturally work in: "I'd love to help get that set up for you — what's the best name and phone number to reach you?"

Remember: Every conversation is a potential customer. Make them feel heard and valued.`
}

function buildSchedulingSection(plan: string, calendlyUrl: string | null): string {
  if (plan === 'starter') {
    return `SCHEDULING:
When a customer wants to book an appointment or get a quote:
1. Ask what service they need
2. Ask what day and time works best for them
3. Capture their name and phone number
4. Tell them: "I've noted your preferred time and our team will confirm the appointment with you shortly."
Do NOT promise a specific time slot — the owner will confirm manually.`
  }

  if (plan === 'growth' || plan === 'pro') {
    if (calendlyUrl) {
      return `SCHEDULING:
You have real-time booking available via our scheduling system.
When a customer wants to book:
1. Ask what service they need
2. Send them this booking link: ${calendlyUrl}
3. Tell them: "You can book directly at that link and you'll get an instant confirmation."
4. Still capture their name and phone as a backup: "And just in case, what's the best number to reach you?"
If they can't use the link, take their preferred date/time and name/phone and tell them the team will confirm.`
    }
    return `SCHEDULING:
When a customer wants to book:
1. Ask what service they need
2. Ask what day and time works best for them
3. Capture their name and phone number
4. Tell them: "I've noted your preferred time and you'll receive a confirmation shortly."
(Note to admin: Connect a Calendly URL in Settings to enable direct booking)`
  }

  return ''
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
