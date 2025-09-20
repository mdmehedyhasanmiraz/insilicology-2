'use server';

import { supabaseAdmin } from '@/lib/supabase/server';

export interface AdminPayment {
  id: string;
  user_id: string;
  course_id?: string;
  amount: number;
  currency: string;
  payment_channel: string;
  transaction_id?: string;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  paid_at?: string;
  created_at: string;
  bkash_payment_id?: string;
  bkash_intent_id?: string;
  bkash_url?: string;
  is_verified: boolean;
  book_id?: string;
  type: 'course' | 'book' | 'workshop';
  workshop_id?: string;
  purpose: 'course' | 'workshop' | 'book' | 'other';
  updated_at: string;
  user?: {
    name: string | null;
    email: string | null;
    whatsapp?: string | null;
    district?: string | null;
    university?: string | null;
    department?: string | null;
  };
  course?: {
    title: string;
    slug: string;
  };
  workshop?: {
    title: string;
    slug: string;
  };
  book?: {
    title: string;
    slug: string;
  };
}

export async function getAllPayments(): Promise<AdminPayment[]> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return [];
    }

    // Fetch all payments with related data using admin client
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        user:users(name, email, whatsapp, district, university, department),
        course:courses(title, slug),
        workshop:workshops(title, slug),
        book:books(title, slug)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllPayments:', error);
    return [];
  }
}

export async function updatePaymentStatus(paymentId: string, newStatus: string): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return false;
    }

    const { error } = await supabaseAdmin
      .from('payments')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (error) {
      console.error('Error updating payment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    return false;
  }
}

export async function updatePaymentDetails(paymentId: string, payload: Partial<Pick<AdminPayment, 'transaction_id' | 'bkash_payment_id' | 'payment_channel' | 'amount' | 'currency' | 'paid_at' | 'is_verified' | 'status'>>): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return false;
    }

    const { error } = await supabaseAdmin
      .from('payments')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    if (error) {
      console.error('Error updating payment details:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updatePaymentDetails:', error);
    return false;
  }
}
