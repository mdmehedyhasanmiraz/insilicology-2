import { JobApplication } from '@/types/job.type';
import emailService from '@/utils/emailService';

// Note: This file contains server-side only functions
// For client-side functions, use clientJobUtils.ts instead

export async function submitJobApplication(application: Omit<JobApplication, 'id' | 'created_at'>, jobTitle?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { error } = await supabase
      .from('applications')
      .insert(application);

    if (error) {
      console.error('Error submitting job application:', error);
      return { success: false, error: error.message };
    }

    // Send confirmation email
    try {
      await emailService.sendJobApplicationConfirmation(
        application.full_name,
        application.email,
        jobTitle || 'Position at Skilltori'
      );
      console.log('Job application confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send job application confirmation email:', emailError);
      // Don't throw error here - we don't want to fail the application submission
      // just because email failed
    }

    return { success: true };
  } catch (error) {
    console.error('Error in submitJobApplication:', error);
    return { success: false, error: 'Failed to submit application' };
  }
} 