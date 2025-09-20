import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface UserProfileData {
  id: string;
  email: string;
  name?: string;
  whatsapp?: string;
  university?: string;
  department?: string;
  academic_year?: string;
  academic_session?: string;
}

export async function ensureUserProfile(profileData: UserProfileData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientComponentClient();
    
    const { error } = await supabase
      .from('users')
      .upsert({
        id: profileData.id,
        email: profileData.email,
        name: profileData.name || null,
        whatsapp: profileData.whatsapp || null,
        university: profileData.university || null,
        department: profileData.department || null,
        academic_year: profileData.academic_year || null,
        academic_session: profileData.academic_session || null,
      }, { onConflict: 'id' });
    
    if (error) {
      console.error('Failed to create/update user profile:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error ensuring user profile:', err);
    return { success: false, error: 'Failed to create user profile' };
  }
}

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  try {
    const supabase = createClientComponentClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error getting user profile:', err);
    return null;
  }
}
