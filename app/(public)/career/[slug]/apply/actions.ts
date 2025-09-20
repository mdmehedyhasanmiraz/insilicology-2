'use server';

import { createClient } from '@/utils/supabase/server';
import { JobApplication } from '@/types/job.type';
import emailService from '@/utils/emailService';

export async function submitJobApplicationAction(
  application: Omit<JobApplication, 'id' | 'created_at'>,
  jobTitle: string
) {
  console.log('Server action called with:', { jobTitle, applicationEmail: application.email });
  
  try {
    console.log('Creating Supabase client...');
    const supabase = await createClient();
    console.log('Supabase client created successfully');
    
    // Insert the application data
    console.log('Inserting application data...');
    console.log('Application data to insert:', application);
    
    const { data: insertData, error: insertError } = await supabase
      .from('applications')
      .insert(application)
      .select();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      console.error('Error code:', insertError.code);
      console.error('Error message:', insertError.message);
      console.error('Error details:', insertError.details);
      
      if (insertError.code === '23505') {
        throw new Error('An application with this email already exists for this position. Please use a different email address or contact us if you need to update your application.');
      } else {
        throw new Error(`Database error: ${insertError.message}`);
      }
    }

    console.log('Application data inserted successfully:', insertData);

    // Send confirmation email
    try {
      console.log('Sending confirmation email...');
      await emailService.sendJobApplicationConfirmation(
        application.full_name,
        application.email,
        jobTitle
      );
      console.log('Job application confirmation email sent successfully');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't throw error here - we don't want to fail the application submission
      // just because email failed
    }

    console.log('Server action completed successfully');
    // Success - let the client handle the redirect
    return { success: true };
    
  } catch (error) {
    console.error('Submission error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit application' 
    };
  }
} 