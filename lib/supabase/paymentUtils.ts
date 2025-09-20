import { supabaseAdmin } from "@/lib/supabase/server";
import emailService from "@/utils/emailService";

export interface PaymentRecord {
  id: string;
  user_id: string;
  course_id?: string | null;
  workshop_id?: string | null;
  book_id?: string | null;
  amount: number;
  currency: string;
  payment_channel: string;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  transaction_id: string;
  bkash_payment_id?: string | null;
  bkash_url?: string | null;
  is_verified: boolean;
  paid_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  purpose: 'course' | 'workshop' | 'book' | 'other';
  type: 'course' | 'workshop' | 'book';
  // Optional coupon-related fields
  coupon_id?: string | null;
  coupon_code?: string | null;
  discount_amount?: number | null;
}

export interface PaymentWithCourse extends PaymentRecord {
  course: {
    id: string;
    title: string;
    slug: string;
    type: string;
    duration: string;
    price_offer: string;
    poster: string;
  };
}

export interface UserEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  course: {
    id: string;
    title: string;
    slug: string;
    type: string;
    duration: string;
    price_offer: string;
    poster: string;
    description: string;
  };
}

export async function createPaymentRecord(data: {
  user_id: string;
  course_id?: string;
  workshop_id?: string;
  book_id?: string;
  amount: number;
  payment_channel: string;
  transaction_id: string;
  purpose: 'course' | 'workshop' | 'book' | 'other';
}): Promise<PaymentRecord | null> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return null;
    }

    console.log('Creating payment record with data:', data);
    
    const paymentData = {
      user_id: data.user_id,
      course_id: data.course_id || null,
      workshop_id: data.workshop_id || null,
      book_id: data.book_id || null,
      amount: data.amount,
      currency: 'BDT',
      payment_channel: data.payment_channel,
      status: 'pending' as const,
      transaction_id: data.transaction_id,
      is_verified: false,
      purpose: data.purpose,
      type: data.purpose as 'course' | 'workshop' | 'book',
      created_at: new Date().toISOString()
    };

    console.log('Payment data to insert:', paymentData);

    const { data: paymentRecord, error } = await supabaseAdmin
      .from('payments')
      .insert(paymentData)
      .select()
      .single<PaymentRecord>();

    if (error) {
      console.error('Error creating payment record:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log('Payment record created successfully:', paymentRecord);
    return paymentRecord;
  } catch (error) {
    console.error('Error in createPaymentRecord:', error);
    return null;
  }
}

export async function updatePaymentRecord(
  paymentId: string,
  updates: Partial<PaymentRecord>
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
      .eq('id', paymentId);

    if (error) {
      console.error('Error updating payment record:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updatePaymentRecord:', error);
    return false;
  }
}

export async function findPaymentByBkashId(bkashPaymentId: string): Promise<PaymentRecord | null> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return null;
    }

    const { data: paymentRecord, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('bkash_payment_id', bkashPaymentId)
      .single<PaymentRecord>();

    if (error) {
      console.error('Error finding payment by bKash ID:', error);
      return null;
    }

    return paymentRecord;
  } catch (error) {
    console.error('Error in findPaymentByBkashId:', error);
    return null;
  }
}

export async function getUserPayments(userId: string): Promise<PaymentWithCourse[]> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return [];
    }

    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        course:course_id (
          id,
          title,
          slug,
          type,
          duration,
          price_offer,
          poster
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting user payments:', error);
      return [];
    }

    return payments as unknown as PaymentWithCourse[] || [];
  } catch (error) {
    console.error('Error in getUserPayments:', error);
    return [];
  }
}

export async function getUserEnrolledCourses(userId: string): Promise<UserEnrollment[]> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return [];
    }

    const { data: enrollments, error } = await supabaseAdmin
      .from('user_courses')
      .select(`
        *,
        course:course_id (
          id,
          title,
          slug,
          type,
          duration,
          price_offer,
          poster,
          description
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('Error getting user enrollments:', error);
      return [];
    }

    return enrollments as unknown as UserEnrollment[] || [];
  } catch (error) {
    console.error('Error in getUserEnrolledCourses:', error);
    return [];
  }
}

export async function isUserEnrolledInCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return false;
    }

    const { data: enrollment } = await supabaseAdmin
      .from('user_courses')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    return !!enrollment;
  } catch (error) {
    console.error('Error in isUserEnrolledInCourse:', error);
    return false;
  }
}

export async function enrollUserInCourse(userId: string, courseId: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return false;
    }

    // Check if user is already enrolled
    const { data: existingEnrollment } = await supabaseAdmin
      .from('user_courses')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      console.log('User already enrolled in course');
      return true;
    }

    // Enroll user in course
    const { error } = await supabaseAdmin
      .from('user_courses')
      .insert({
        user_id: userId,
        course_id: courseId,
        enrolled_at: new Date().toISOString()
      })
      .single();

    if (error) {
      console.error('Error enrolling user in course:', error);
      return false;
    }

    console.log('User enrolled in course successfully');
    return true;
  } catch (error) {
    console.error('Error in enrollUserInCourse:', error);
    return false;
  }
}

export async function enrollUserInWorkshop(userId: string, workshopId: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return false;
    }

    // Check if user is already enrolled
    const { data: existingEnrollments, error: checkError } = await supabaseAdmin
      .from('user_workshops')
      .select('id')
      .eq('user_id', userId)
      .eq('workshop_id', workshopId);

    if (checkError) {
      console.error('Error checking workshop enrollment:', checkError);
      return false;
    }

    if (existingEnrollments && existingEnrollments.length > 0) {
      console.log('User already enrolled in workshop');
      return true;
    }

    // Enroll user in workshop
    const { error: insertError } = await supabaseAdmin
      .from('user_workshops')
      .insert({
        user_id: userId,
        workshop_id: workshopId,
        created_at: new Date().toISOString()
      })
      .single();

    if (insertError) {
      console.error('Error enrolling user in workshop:', insertError);
      return false;
    }

    console.log('User enrolled in workshop successfully');
    return true;
  } catch (error) {
    console.error('Error in enrollUserInWorkshop:', error);
    return false;
  }
}

export async function processSuccessfulPayment(
  paymentRecord: PaymentRecord,
  bkashPaymentId: string
): Promise<boolean> {
  try {
    // Update payment record to successful with bKash payment ID
    const paymentUpdated = await updatePaymentRecord(paymentRecord.id, {
      status: 'successful',
      paid_at: new Date().toISOString(),
      is_verified: true,
      bkash_payment_id: bkashPaymentId
    });

    if (!paymentUpdated) {
      console.error('Failed to update payment record');
      return false;
    }

    // Enroll user based on payment type
    if (paymentRecord.purpose === 'course' && paymentRecord.course_id) {
      const enrollmentSuccessful = await enrollUserInCourse(
        paymentRecord.user_id,
        paymentRecord.course_id
      );

      if (!enrollmentSuccessful) {
        console.error('Failed to enroll user in course');
        // Don't fail the payment if enrollment fails, just log it
      }
    } else if (paymentRecord.purpose === 'workshop' && paymentRecord.workshop_id) {
      const enrollmentSuccessful = await enrollUserInWorkshop(
        paymentRecord.user_id,
        paymentRecord.workshop_id
      );

      if (!enrollmentSuccessful) {
        console.error('Failed to enroll user in workshop');
        // Don't fail the payment if enrollment fails, just log it
      }
    }

    // Send payment confirmation email for both courses and workshops
    try {
      console.log('Sending payment confirmation email for payment ID:', paymentRecord.id);
      
      if (!supabaseAdmin) {
        console.error('Supabase admin client not available for email sending');
        return true; // Don't fail the payment if we can't send email
      }

      // Get user details
      console.log('Fetching user details for ID:', paymentRecord.user_id);
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('email')
        .eq('id', paymentRecord.user_id)
        .single();

      if (userError || !user) {
        console.error('Error fetching user details:', userError);
        return true; // Don't fail the payment if we can't get user details
      }

      const fullName = user.email?.split('@')[0] || 'User';

      if (paymentRecord.purpose === 'workshop' && paymentRecord.workshop_id) {
        // Get workshop details
        console.log('Fetching workshop details for ID:', paymentRecord.workshop_id);
        const { data: workshop, error: workshopError } = await supabaseAdmin
          .from('workshops')
          .select('title, start_time, end_time, speaker_name, group_link')
          .eq('id', paymentRecord.workshop_id)
          .single();

        if (workshopError || !workshop) {
          console.error('Error fetching workshop details:', workshopError);
          return true; // Don't fail the payment if we can't get workshop details
        }

        // Format date and time
        const startDate = new Date(workshop.start_time);
        const endDate = new Date(workshop.end_time);
        
        const workshopDate = startDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const workshopTime = `${startDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })} - ${endDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}`;

        console.log('Sending workshop payment confirmation email:', {
          fullName,
          email: user.email,
          workshopTitle: workshop.title,
          workshopDate,
          workshopTime,
          speakerName: workshop.speaker_name,
          amount: paymentRecord.amount,
          groupLink: workshop.group_link
        });

        const emailResult = await emailService.sendWorkshopPaymentConfirmation(
          fullName,
          user.email!,
          workshop.title,
          workshopDate,
          workshopTime,
          workshop.speaker_name,
          paymentRecord.amount,
          workshop.group_link || undefined
        );

        if (emailResult) {
          console.log('Workshop payment confirmation email sent successfully');
        } else {
          console.error('Failed to send workshop payment confirmation email');
        }

      } else if (paymentRecord.purpose === 'course' && paymentRecord.course_id) {
        // Get course details
        console.log('Fetching course details for ID:', paymentRecord.course_id);
        const { data: course, error: courseError } = await supabaseAdmin
          .from('courses')
          .select('title, type, duration')
          .eq('id', paymentRecord.course_id)
          .single();

        if (courseError || !course) {
          console.error('Error fetching course details:', courseError);
          return true; // Don't fail the payment if we can't get course details
        }

        console.log('Sending course payment confirmation email:', {
          fullName,
          email: user.email,
          courseTitle: course.title,
          courseType: course.type,
          courseDuration: course.duration,
          amount: paymentRecord.amount
        });

        const emailResult = await emailService.sendCoursePaymentConfirmation(
          fullName,
          user.email!,
          course.title,
          course.type,
          course.duration,
          paymentRecord.amount
        );

        if (emailResult) {
          console.log('Course payment confirmation email sent successfully');
        } else {
          console.error('Failed to send course payment confirmation email');
        }
      }
    } catch (emailError) {
      console.error('Failed to send payment confirmation email:', emailError);
      // Don't fail the payment if email fails, just log it
    }

    return true;
  } catch (error) {
    console.error('Error in processSuccessfulPayment:', error);
    return false;
  }
}

export async function processFailedPayment(
  paymentRecord: PaymentRecord
): Promise<boolean> {
  try {
    const updated = await updatePaymentRecord(paymentRecord.id, {
      status: 'failed'
    });

    return updated;
  } catch (error) {
    console.error('Error in processFailedPayment:', error);
    return false;
  }
} 