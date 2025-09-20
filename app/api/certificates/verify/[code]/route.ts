import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })
    }
    const { code } = await params
    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

    console.log('Looking for certificate with tracking code:', code)

    // First try to get the certificate without user join
    const { data: certs, error } = await supabaseAdmin
      .from('certificates')
      .select('id, user_id, entity_type, entity_id, certificate_type, title, tracking_code, issued_at, pdf_url')
      .ilike('tracking_code', code)

    console.log('Certificate query result:', { certs, error, count: certs?.length })

    if (error) {
      return NextResponse.json({ valid: false, message: 'Database error', debug: { error: error.message, code } }, { status: 200 })
    }

    if (!certs || certs.length === 0) {
      return NextResponse.json({ valid: false, message: 'Certificate not found', debug: { code } }, { status: 200 })
    }

    if (certs.length > 1) {
      console.log('Multiple certificates found with same tracking code:', certs.length)
    }

    const cert = certs[0] // Take the first one if multiple exist

    // Now get the user details separately
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('id', cert.user_id)
      .single()

    console.log('User query result:', { user, userError })

    return NextResponse.json({ 
      valid: true, 
      certificate: {
        ...cert,
        users: user
      }
    })
  } catch (e) {
    console.error('Verification API error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}


