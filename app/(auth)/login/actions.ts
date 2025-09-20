// actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function loginWithEmail({
  email,
  password,
}: {
  email: string
  password: string
}) {
  try {
    const supabase = createRouteHandlerClient({ cookies: await cookies() });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { error: { message: error.message }, role: null };
    }

    // ✅ Fetch user's role
    // Ensure a row exists in public.users
    let role: string | null = null;
    const { data: userInfo, error: userError } = await supabase
      .from('users')
      .select('role, id')
      .eq('id', data.user.id)
      .single();

    if (userError || !userInfo) {
      const phone = (data.user.user_metadata as { phone?: string } | null)?.phone || null;
      const emailSafe = data.user.email as string;
      // Insert basic user profile if missing
      const { error: insertErr } = await supabase
        .from('users')
        .insert({ id: data.user.id, email: emailSafe, whatsapp: phone })
        .single();
      if (insertErr) {
        // Don't fail login on profile insert error
        console.warn('users insert failed (non-blocking):', insertErr.message);
      }
      role = 'student';
    } else {
      role = userInfo.role as string;
    }

    return { error: null, role };
  } catch (err: unknown) {
    console.error("Login error:", err);
    return {
      error: {
        message: "আপনার ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।",
      },
      role: null,
    };
  }
}

export async function signInWithGoogle() {
  try {
    const supabase = await createClient();
    
    // Get the current request URL to determine the correct redirect
    const requestUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    const redirectUrl = `${requestUrl.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) return { error: { message: error.message }, redirectUrl: null };

    return { error: null, redirectUrl: redirectUrl };
  } catch (err) {
    console.error("Google Auth Error:", err);
    return {
      error: {
        message: "Google সাইন-ইন/আপে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      },
      redirectUrl: null,
    };
  }
}
