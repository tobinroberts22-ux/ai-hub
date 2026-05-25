import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({}, { status: 400 })

  const { data } = await supabaseAdmin
    .from('businesses')
    .select('name, ai_name, industry')
    .eq('id', id)
    .single()

  return NextResponse.json(data ?? {})
}
