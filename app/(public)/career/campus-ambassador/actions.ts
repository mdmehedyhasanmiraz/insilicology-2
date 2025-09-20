'use server';

import { createClient } from '@/utils/supabase/server';
import { CampusAmbassadorFormData } from '@/types/form.type';
import emailService from '@/utils/emailService';

export async function submitCampusAmbassadorApplication(
  formData: CampusAmbassadorFormData,
  fileUrl: string | null
) {
  try {
    const supabase = await createClient();
    
    // Insert the application data
    const { error: insertError } = await supabase
      .from('campus_ambassadors')
      .insert([
        {
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number,
          university_name: formData.university_name,
          department_name: formData.department_name,
          current_year: formData.current_year,
          course_duration: formData.course_duration,
          why_join: formData.why_join,
          linkedin_url: formData.linkedin_url || null,
          facebook_url: formData.facebook_url,
          cv_url: fileUrl,
        }
      ])
      .select();

    if (insertError) {
      console.error('Supabase error:', insertError);
      if (insertError.code === '23505') {
        throw new Error('An application with this email already exists. Please use a different email address or contact us if you need to update your application.');
      } else {
        throw new Error('Failed to submit application. Please try again.');
      }
    }

    // Send confirmation email
    try {
      await emailService.sendCampusAmbassadorConfirmation(
        formData.full_name,
        formData.email,
        formData.university_name
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't throw error here - we don't want to fail the application submission
      // just because email failed
    }

    // Success - let the client handle the redirect
    return { success: true };
    
  } catch (error) {
    console.error('Submission error:', error);
    throw error;
  }
}

export async function validateSuccessToken(token: string): Promise<boolean> {
  // For now, just validate that token exists and has the expected format
  // In a production environment, you might want to implement more secure validation
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // Check if token has the expected format (timestamp-randomPart)
  const tokenParts = token.split('-');
  if (tokenParts.length !== 2) {
    return false;
  }
  
  const timestamp = parseInt(tokenParts[0]);
  const currentTime = Date.now();
  
  // Token should be created within the last 5 minutes
  if (isNaN(timestamp) || currentTime - timestamp > 5 * 60 * 1000) {
    return false;
  }
  
  return true;
} 