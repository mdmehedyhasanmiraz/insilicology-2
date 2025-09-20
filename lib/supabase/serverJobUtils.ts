import { createClient } from '@/utils/supabase/server';
import { Job } from '@/types/job.type';

export async function getPublishedJobs(): Promise<Job[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_published', true)
    .gte('application_deadline', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published jobs:', error);
    throw error;
  }

  return data || [];
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const supabase = await createClient();
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