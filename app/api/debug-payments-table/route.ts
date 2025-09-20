import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server';

interface PaymentSummary {
  status: string;
  purpose: string;
  count: number;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get('limit') || '10';
    const status = searchParams.get('status');
    const purpose = searchParams.get('purpose');

    console.log('=== PAYMENTS TABLE DEBUG ===');
    console.log('Limit:', limit);
    console.log('Status filter:', status);
    console.log('Purpose filter:', purpose);

    const supabase = await createClient();
    
    // Build query
    let query = supabase
      .from('payments')
      .select('id, user_id, course_id, workshop_id, amount, status, purpose, bkash_payment_id, created_at, paid_at')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (purpose) {
      query = query.eq('purpose', purpose);
    }

    // Limit results
    query = query.limit(parseInt(limit));

    const { data: payments, error } = await query;

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Error fetching payments",
        error: error.message
      });
    }

    console.log(`Found ${payments?.length || 0} payment records`);

    // Get summary statistics - get all payments and group manually
    const { data: allPayments, error: summaryError } = await supabase
      .from('payments')
      .select('status, purpose');

    let summary: PaymentSummary[] = [];
    if (!summaryError && allPayments) {
      const summaryMap = new Map();
      allPayments.forEach(payment => {
        const key = `${payment.status}-${payment.purpose}`;
        summaryMap.set(key, (summaryMap.get(key) || 0) + 1);
      });
      
      summary = Array.from(summaryMap.entries()).map(([key, count]) => {
        const [status, purpose] = key.split('-');
        return { status, purpose, count };
      });
    }

    if (summaryError) {
      console.error('Error fetching summary:', summaryError);
    }

    return NextResponse.json({
      statusCode: 200,
      statusMessage: "Payments table debug completed",
      totalRecords: payments?.length || 0,
      payments: payments?.map(payment => ({
        id: payment.id,
        user_id: payment.user_id,
        course_id: payment.course_id,
        workshop_id: payment.workshop_id,
        amount: payment.amount,
        status: payment.status,
        purpose: payment.purpose,
        bkash_payment_id: payment.bkash_payment_id,
        created_at: payment.created_at,
        paid_at: payment.paid_at
      })),
      summary: summary || [],
      filters: {
        limit: parseInt(limit),
        status,
        purpose
      }
    });

  } catch (error) {
    console.error("Error in payments table debug:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchId } = await req.json();

    if (!searchId) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "Search ID is required"
      });
    }

    console.log('=== SEARCHING FOR PAYMENT ===');
    console.log('Search ID:', searchId);

    const supabase = await createClient();
    
    // Search by ID (UUID)
    const { data: byId, error: idError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', searchId);

    // Search by bKash payment ID
    const { data: byBkashId, error: bkashError } = await supabase
      .from('payments')
      .select('*')
      .eq('bkash_payment_id', searchId);

    // Search by transaction_id
    const { data: byTransactionId, error: transactionError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', searchId);

    console.log('Search results:');
    console.log('- By ID:', byId?.length || 0, 'records');
    console.log('- By bKash ID:', byBkashId?.length || 0, 'records');
    console.log('- By Transaction ID:', byTransactionId?.length || 0, 'records');

    return NextResponse.json({
      statusCode: 200,
      statusMessage: "Payment search completed",
      searchId,
      results: {
        byId: {
          count: byId?.length || 0,
          records: byId || [],
          error: idError?.message
        },
        byBkashId: {
          count: byBkashId?.length || 0,
          records: byBkashId || [],
          error: bkashError?.message
        },
        byTransactionId: {
          count: byTransactionId?.length || 0,
          records: byTransactionId || [],
          error: transactionError?.message
        }
      }
    });

  } catch (error) {
    console.error("Error in payment search:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 