'use server'

import { createClient } from '@/utils/supabase/server'

export async function resetPassword(email: string) {
  try {
    const supabase = await createClient()
    
    // Request a recovery email. If Email OTP is enabled in Supabase,
    // the email will contain an OTP code the user can enter.
    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      console.error('Password reset error:', error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Password reset error:', error)
    return { error: 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।' }
  }
}
