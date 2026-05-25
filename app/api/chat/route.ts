import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { anthropic, MODEL, PLAN_LIMITS } from '@/lib/anthropic'
import { buildSystemPrompt } from '@/lib/buildSystemPrompt'

export async function POST(req: NextRequest) {
  try {
    const { businessId, conversationId, message } = await req.json()

    if (!businessId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch business data
    const { data: business, error: bizError } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single()

    if (bizError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check usage limits
    const currentMonth = new Date().toISOString().slice(0, 7) // "2026-05"
    const { data: usageData } = await supabaseAdmin
      .from('usage')
      .select('conversation_count')
      .eq('business_id', businessId)
      .eq('month', currentMonth)
      .single()

    const limit = PLAN_LIMITS[business.plan] ?? PLAN_LIMITS['trialing']
    const currentCount = usageData?.conversation_count ?? 0

    // If no conversationId, this is a new conversation — check limit
    if (!conversationId && currentCount >= limit) {
      return NextResponse.json({ limitReached: true }, { status: 200 })
    }

    // Get or create conversation
    let activeConversationId = conversationId

    if (!activeConversationId) {
      const { data: newConv, error: convError } = await supabaseAdmin
        .from('conversations')
        .insert({ business_id: businessId })
        .select('id')
        .single()

      if (convError || !newConv) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
      }

      activeConversationId = newConv.id

      // Increment conversation count
      await supabaseAdmin.rpc('increment_usage', {
        p_business_id: businessId,
        p_month: currentMonth,
      })
    }

    // Fetch conversation history
    const { data: history } = await supabaseAdmin
      .from('messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    const messages = [
      ...(history || []).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ]

    // Save user message
    await supabaseAdmin.from('messages').insert({
      conversation_id: activeConversationId,
      role: 'user',
      content: message,
    })

    // Build system prompt and call Claude
    const systemPrompt = buildSystemPrompt(business)

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      messages,
    })

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : ''

    // Save assistant message
    await supabaseAdmin.from('messages').insert({
      conversation_id: activeConversationId,
      role: 'assistant',
      content: assistantMessage,
    })

    // Update conversation metadata
    await supabaseAdmin
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        message_count: (history?.length ?? 0) + 2,
      })
      .eq('id', activeConversationId)

    // Track token usage
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens
    await supabaseAdmin.rpc('increment_tokens', {
      p_business_id: businessId,
      p_month: currentMonth,
      p_tokens: tokensUsed,
    })

    // Detect if lead info was shared in this message
    await detectAndSaveLead(message, assistantMessage, activeConversationId, businessId, business)

    return NextResponse.json({
      message: assistantMessage,
      conversationId: activeConversationId,
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function detectAndSaveLead(
  userMessage: string,
  _assistantMessage: string,
  conversationId: string,
  businessId: string,
  business: { plan: string; calendly_url: string | null }
) {
  // Simple regex to detect phone numbers
  const phoneRegex = /(\+?1?\s?)?(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/
  const phoneMatch = userMessage.match(phoneRegex)

  if (phoneMatch) {
    const phone = phoneMatch[0].trim()

    // Update conversation as lead captured
    await supabaseAdmin
      .from('conversations')
      .update({ customer_phone: phone, lead_captured: true })
      .eq('id', conversationId)
  }

  // Detect booking intent for Starter plan
  if (business.plan === 'starter') {
    const bookingKeywords = ['schedule', 'book', 'appointment', 'quote', 'estimate', 'available', 'come out', 'visit']
    const hasBookingIntent = bookingKeywords.some((kw) =>
      userMessage.toLowerCase().includes(kw)
    )

    if (hasBookingIntent && phoneMatch) {
      // Save as a booking request
      const { data: conv } = await supabaseAdmin
        .from('conversations')
        .select('customer_name, customer_phone')
        .eq('id', conversationId)
        .single()

      await supabaseAdmin.from('booking_requests').insert({
        business_id: businessId,
        conversation_id: conversationId,
        customer_name: conv?.customer_name ?? null,
        customer_phone: phoneMatch[0].trim(),
        notes: userMessage,
      })
    }
  }
}
