'use server';

import { supabaseAdmin } from '@/lib/supabase/server';

export async function uploadPoster(formData: FormData) {
  try {
    if (!supabaseAdmin) {
      return { error: 'Supabase admin client not available' };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    const fileName = `${Date.now()}-${file.name}`;
    
    const { error } = await supabaseAdmin.storage
      .from('images')
      .upload(`course-banners/${fileName}`, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      return { error: error.message };
    }

    return { success: true, fileName };
  } catch (error) {
    console.error('Server upload error:', error);
    return { error: 'Upload failed' };
  }
} 