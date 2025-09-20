'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LogIn } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { getLoginUrlWithRedirect } from '@/utils/redirectUtils';

export default function AuthButton() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    }
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      // Capture current page for redirect after login
      const loginUrl = getLoginUrlWithRedirect(pathname);
      router.push(loginUrl);
    }
  };

  return (
    <div className="block">
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-yellow-400 text-black rounded-md flex items-center cursor-pointer"
      >
        {isLoggedIn === null ? 'লগইন' : isLoggedIn ? 'ড্যাশবোর্ড' : 'লগইন'}
        <LogIn size={14} className="ml-1" />
      </button>
    </div>
  );
}
