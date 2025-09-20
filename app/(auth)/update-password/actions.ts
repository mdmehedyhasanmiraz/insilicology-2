'use server'

import { createClient } from '@/utils/supabase/server'

export async function updatePassword(newPassword: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      console.error('Password update error:', error)
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Password update error:', error)
    return { error: 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।' }
  }
}
