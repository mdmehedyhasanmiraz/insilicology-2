import { supabaseAdmin } from "@/lib/supabase/server";

export interface WorkshopPaymentRecord {
  id: string;
  user_id: string;
  workshop_id: string;
  course_id?: string;
  amount: number;
  currency: string;
  payment_channel: string;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  transaction_id: string;
  bkash_payment_id?: string;
  bkash_url?: string;
  is_verified: boolean;
  paid_at?: string;
  created_at: string;
  updated_at?: string;
  purpose: 'course' | 'workshop' | 'book' | 'other';
  type: 'course' | 'workshop' | 'book';
}

export interface WorkshopPaymentWithWorkshop extends WorkshopPaymentRecord {
  workshop: {
    id: string;
    title: string;
    slug: string;
    speaker_name: string;
    start_time: string;
    end_time: string;
    price_offer: number;
    banner_image_path: string;
  };
}

export interface UserWorkshopEnrollment {
  id: string;
  user_id: string;
  workshop_id: string;
  created_at: string;
  workshop: {
    id: string;
    title: string;
    slug: string;
    speaker_name: string;
    start_time: string;
    end_time: string;
    price_offer: number;
    banner_image_path: string;
    description: string;
  };
}

export async function createWorkshopPaymentRecord(data: {
  user_id: string;
  workshop_id: string;
  amount: number;
  payment_channel: string;
  transaction_id: string;
}): Promise<WorkshopPaymentRecord | null> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return null;
    }

    console.log('Creating workshop payment record with data:', data);
    
    const paymentData = {
      user_id: data.user_id,
      workshop_id: data.workshop_id,
      course_id: null, // Null for workshop payments
      amount: data.amount,
      currency: 'BDT',
      payment_channel: data.payment_channel,
      status: 'pending' as const,
      transaction_id: data.transaction_id,
      is_verified: false,
      purpose: 'workshop' as const,
      type: 'workshop' as const,
      created_at: new Date().toISOString()
    };

    console.log('Workshop payment data to insert:', paymentData);

    const { data: paymentRecord, error } = await supabaseAdmin
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      console.error('Error creating workshop payment record:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log('Workshop payment record created successfully:', paymentRecord);
    return paymentRecord;
  } catch (error) {
    console.error('Error in createWorkshopPaymentRecord:', error);
    return null;
  }
}

export async function updateWorkshopPaymentRecord(
  paymentId: string,
  updates: Partial<WorkshopPaymentRecord>
): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return false;
    }

    const { error } = await supabaseAdmin
      .from('payments')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .eq('purpose', 'workshop');

    if (error) {
      console.error('Error updating workshop payment record:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateWorkshopPaymentRecord:', error);
    return false;
  }
}

export async function findWorkshopPaymentByBkashId(bkashPaymentId: string): Promise<WorkshopPaymentRecord | null> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return null;
    }

    const { data: paymentRecord, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('bkash_payment_id', bkashPaymentId)
      .eq('purpose', 'workshop')
      .single();

    if (error) {
      console.error('Error finding workshop payment by bKash ID:', error);
      return null;
    }

    return paymentRecord;
  } catch (error) {
    console.error('Error in findWorkshopPaymentByBkashId:', error);
    return null;
  }
}

export async function getUserWorkshopPayments(userId: string): Promise<WorkshopPaymentWithWorkshop[]> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return [];
    }

    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        workshop:workshop_id (
          id,
          title,
          slug,
          speaker_name,
          start_time,
          end_time,
          price_offer,
          banner_image_path
        )
      `)
      .eq('user_id', userId)
      .eq('purpose', 'workshop')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user workshop payments:', error);
      return [];
    }

    return payments || [];
  } catch (error) {
    console.error('Error in getUserWorkshopPayments:', error);
    return [];
  }
}

export async function getUserEnrolledWorkshops(userId: string): Promise<UserWorkshopEnrollment[]> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return [];
    }

    const { data: enrollments, error } = await supabaseAdmin
      .from('user_workshops')
      .select(`
        *,
        workshop:workshop_id (
          id,
          title,
          slug,
          speaker_name,
          start_time,
          end_time,
          price_offer,
          banner_image_path,
          description
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user workshop enrollments:', error);
      return [];
    }

    return enrollments || [];
  } catch (error) {
    console.error('Error in getUserEnrolledWorkshops:', error);
    return [];
  }
}

export async function isUserEnrolledInWorkshop(userId: string, workshopId: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return false;
    }

    const { data: enrollments, error } = await supabaseAdmin
      .from('user_workshops')
      .select('id')
      .eq('user_id', userId)
      .eq('workshop_id', workshopId);

    if (error) {
      console.error('Error checking workshop enrollment:', error);
      return false;
    }

    return enrollments && enrollments.length > 0;
  } catch (error) {
    console.error('Error in isUserEnrolledInWorkshop:', error);
    return false;
  }
}

export async function enrollUserInWorkshop(userId: string, workshopId: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return false;
    }

    // Check if already enrolled
    const isEnrolled = await isUserEnrolledInWorkshop(userId, workshopId);
    if (isEnrolled) {
      console.log('User already enrolled in workshop:', { userId, workshopId });
      return true;
    }

    const { error } = await supabaseAdmin
      .from('user_workshops')
      .insert({
        user_id: userId,
        workshop_id: workshopId,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error enrolling user in workshop:', error);
      return false;
    }

    console.log('User successfully enrolled in workshop:', { userId, workshopId });
    return true;
  } catch (error) {
    console.error('Error in enrollUserInWorkshop:', error);
    return false;
  }
}

export async function processSuccessfulWorkshopPayment(
  paymentRecord: WorkshopPaymentRecord | { id: string; user_id: string; workshop_id: string },
  bkashPaymentId: string
): Promise<boolean> {
  try {
    // Update payment record to successful with bKash payment ID
    const paymentUpdated = await updateWorkshopPaymentRecord(paymentRecord.id, {
      status: 'successful',
      paid_at: new Date().toISOString(),
      is_verified: true,
      bkash_payment_id: bkashPaymentId
    });

    if (!paymentUpdated) {
      console.error('Failed to update workshop payment record');
      return false;
    }

    // Enroll user in workshop
    const enrollmentSuccessful = await enrollUserInWorkshop(
      paymentRecord.user_id,
      paymentRecord.workshop_id
    );

    if (!enrollmentSuccessful) {
      console.error('Failed to enroll user in workshop');
      // Don't fail the payment if enrollment fails, just log it
    }

    return true;
  } catch (error) {
    console.error('Error in processSuccessfulWorkshopPayment:', error);
    return false;
  }
}

export async function processFailedWorkshopPayment(
  paymentRecord: WorkshopPaymentRecord | { id: string }
): Promise<boolean> {
  try {
    const paymentUpdated = await updateWorkshopPaymentRecord(paymentRecord.id, {
      status: 'failed',
      updated_at: new Date().toISOString()
    });

    if (!paymentUpdated) {
      console.error('Failed to update workshop payment record to failed');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in processFailedWorkshopPayment:', error);
    return false;
  }
} 