import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export async function getRedirectPath(userId: string, intendedPath?: string): Promise<string> {
  const supabase = createClientComponentClient();
  
  try {
    const { data: userInfo } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    // Admins always go to /admin
    if (userInfo?.role === 'admin') {
      return '/admin';
    }

    // Regular users go to their intended path or dashboard
    return intendedPath || '/dashboard';
  } catch (error) {
    console.error('Error fetching user role:', error);
    // Fallback to dashboard if there's an error
    return intendedPath || '/dashboard';
  }
}

export function getLoginUrlWithRedirect(currentPath: string): string {
  const loginUrl = new URL('/login', window.location.origin);
  loginUrl.searchParams.set('next', currentPath);
  return loginUrl.toString();
} 