import { createClient } from '@supabase/supabase-js';
import { Job } from '@/types/job.type';

// Create a direct Supabase client for public pages (no cookies needed)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

export async function getPublishedJobs(): Promise<Job[]> {
  try {
    // Check if environment variables are properly configured
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn('Supabase environment variables not configured. Returning empty jobs array.');
      return [];
    }

    console.log('Attempting to fetch published jobs...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key exists:', !!supabaseKey);
    
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_published', true)
      .gte('application_deadline', new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('Successfully fetched jobs:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('Unexpected error in getPublishedJobs:', err);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  try {
    // Check if environment variables are properly configured
    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://placeholder.supabase.co') {
      console.warn('Supabase environment variables not configured. Returning null for job.');
      return null;
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .gte('application_deadline', new Date().toISOString().split('T')[0])
      .single();

    if (error) {
      console.error('Error fetching job by slug:', {
        slug,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getJobBySlug:', err);
    return null;
  }
} 