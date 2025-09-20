import { createClient } from '@/utils/supabase/client';
import { Job } from '@/types/job.type';

// Note: This file contains client-side only functions
// For server-side functions, use serverJobUtils.ts instead

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .gte('application_deadline', new Date().toISOString().split('T')[0])
    .single();

  if (error) {
    console.error('Error fetching job by slug:', error);
    return null;
  }

  return data;
}

export async function uploadResume(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    // Create a unique filename using timestamp and random string
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `job_application_${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;

    console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);

    const { error } = await supabase.storage
      .from('cv_uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading resume:', error);
      return { success: false, error: error.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('cv_uploads')
      .getPublicUrl(fileName);

    console.log('File uploaded successfully:', urlData.publicUrl);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('Error in uploadResume:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
} 