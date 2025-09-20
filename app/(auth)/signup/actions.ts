'use server'

import { createClient } from '@/utils/supabase/server'

export async function signupWithEmail({
  email,
  password,
  phone,
  fullName,
  university,
  department,
  academic_year,
  academic_session,
}: {
  email: string
  password: string
  phone?: string
  fullName?: string
  university?: string
  department?: string
  academic_year?: string
  academic_session?: string
}) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          phone: phone || null,
          fullName: fullName || null,
          university: university || null,
          department: department || null,
          academic_year: academic_year || null,
          academic_session: academic_session || null,
        },
      },
    })

    if (error) {
      return { error: { message: error.message } }
    }

    // If user was created successfully, create/update profile in public.users
    if (data.user) {
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: data.user.id,
          email: data.user.email as string,
          name: fullName || null,
          whatsapp: phone || null,
          university: university || null,
          department: department || null,
          academic_year: academic_year || null,
          academic_session: academic_session || null,
        }, { onConflict: 'id' })
      
      if (upsertError) {
        console.error('users upsert failed:', upsertError.message)
        // Still return success as the user was created, just profile update failed
      }
    }

    return { error: null }
  } catch (err: unknown) {
    console.error("Signup error:", err)

    return {
      error: {
        message: "সাইনআপ করতে সমস্যা হয়েছে। দয়া করে একটু পর চেষ্টা করুন।",
      },
    }
  }
}
