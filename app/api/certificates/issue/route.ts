import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

function generateTrackingCode(length: number = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      userId,
      entityType, // 'course' | 'workshop'
      entityId,
      certificateType, // 'achievement' | 'completion' | 'participation'
      title,
      meta
    } = body || {}

    if (!userId || !entityType || !entityId || !certificateType || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }

    // Generate unique tracking code
    let tracking = generateTrackingCode(10)
    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabaseAdmin.from('certificates').select('id').eq('tracking_code', tracking).maybeSingle()
      if (!existing) break
      tracking = generateTrackingCode(10)
    }

    const { data, error } = await supabaseAdmin
      .from('certificates')
      .insert({
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        certificate_type: certificateType,
        title,
        tracking_code: tracking,
        meta: meta || null
      })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, certificate: data })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}


