import { NextRequest, NextResponse } from "next/server";
import { createPaymentRecord } from "@/lib/supabase/paymentUtils";
import { supabaseAdmin } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { user_id, course_id, amount, purpose } = await req.json();
    
    if (!user_id || !course_id || !amount || !purpose) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "user_id, course_id, amount, purpose required"
      });
    }

    console.log('Testing payment record creation with:', { user_id, course_id, amount, purpose });

    if (!supabaseAdmin) {
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Supabase admin client not available"
      });
    }

    // First validate that user and course exist
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        statusCode: 404,
        statusMessage: `User not found: ${user_id}`,
        error: userError
      });
    }

    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, title')
      .eq('id', course_id)
      .single();

    if (courseError || !course) {
      return NextResponse.json({
        statusCode: 404,
        statusMessage: `Course not found: ${course_id}`,
        error: courseError
      });
    }

    console.log('Found user and course:', { user, course });

    const paymentRecord = await createPaymentRecord({
      user_id: user_id,
      course_id: course_id,
      amount: amount,
      payment_channel: 'bkash',
      transaction_id: uuidv4().substring(0, 10),
      purpose: purpose,
    });

    if (paymentRecord) {
      return NextResponse.json({
        statusCode: 200,
        statusMessage: "Payment record created successfully",
        data: paymentRecord
      });
    } else {
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Failed to create payment record"
      });
    }
  } catch (error) {
    console.error('Error in test payment record:', error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error
    });
  }
} 