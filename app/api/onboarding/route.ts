import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, ...businessData } = body

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if business already exists for this user
    const { data: existing } = await supabaseAdmin
      .from('businesses')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Update existing business
      const { data, error } = await supabaseAdmin
        .from('businesses')
        .update({ ...businessData, onboarding_complete: true })
        .eq('user_id', userId)
        .select('id')
        .single()

      if (error) throw error
      return NextResponse.json({ businessId: data.id })
    }

    // Create new business
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .insert({ user_id: userId, ...businessData, onboarding_complete: true })
      .select('id')
      .single()

    if (error) throw error
    return NextResponse.json({ businessId: data.id })
  } catch (err) {
    console.error('Onboarding error:', err)
    return NextResponse.json({ error: 'Failed to save business' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, ...updates } = body

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('businesses')
      .update(updates)
      .eq('user_id', userId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Settings update error:', err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
