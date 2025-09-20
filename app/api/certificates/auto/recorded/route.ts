import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, courseId } = await req.json()
    if (!userId || !courseId) return NextResponse.json({ error: 'userId and courseId required' }, { status: 400 })
    if (userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    if (!supabaseAdmin) return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 })

    // Count total lessons in course
    const { data: modules, error: modErr } = await supabaseAdmin
      .from('modules')
      .select('id')
      .eq('course_id', courseId)
    if (modErr) return NextResponse.json({ error: modErr.message }, { status: 500 })
    const moduleIds = (modules || []).map(m => m.id)
    if (moduleIds.length === 0) return NextResponse.json({ done: false, message: 'No modules' })

    const { count: totalLessons, error: lesErr } = await supabaseAdmin
      .from('lessons')
      .select('id', { count: 'exact', head: true })
      .in('module_id', moduleIds)
    if (lesErr) return NextResponse.json({ error: lesErr.message }, { status: 500 })
    if (!totalLessons || totalLessons === 0) return NextResponse.json({ done: false, message: 'No lessons' })

    // Count completed lessons by user
    const { count: completedLessons, error: compErr } = await supabaseAdmin
      .from('user_course_progress')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('completed', true)
    if (compErr) return NextResponse.json({ error: compErr.message }, { status: 500 })

    if ((completedLessons || 0) < totalLessons) {
      return NextResponse.json({ done: false, message: 'Not fully completed yet', totalLessons, completedLessons })
    }

    // Check existing certificate
    const { data: existing } = await supabaseAdmin
      .from('certificates')
      .select('id')
      .eq('user_id', userId)
      .eq('entity_type', 'course')
      .eq('entity_id', courseId)
      .maybeSingle()
    if (existing) return NextResponse.json({ done: true, alreadyIssued: true })

    // Fetch course title and user name
    const [{ data: course }, { data: userRow }] = await Promise.all([
      supabaseAdmin.from('courses').select('title').eq('id', courseId).single(),
      supabaseAdmin.from('users').select('name').eq('id', userId).single()
    ])

    // Generate simple tracking code
    const tracking = Math.random().toString(36).slice(2, 12).toUpperCase()

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from('certificates')
      .insert({
        user_id: userId,
        entity_type: 'course',
        entity_id: courseId,
        certificate_type: 'completion',
        title: course?.title || 'Course Completion',
        tracking_code: tracking,
        meta: { auto: true, holder: userRow?.name || null }
      })
      .select('id')
      .single()
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })

    return NextResponse.json({ done: true, certificate_id: inserted?.id })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}


