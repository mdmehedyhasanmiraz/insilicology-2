import { createPayment } from "@/service/bkash";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createPaymentRecord, updatePaymentRecord } from "@/lib/supabase/paymentUtils";
import { supabaseAdmin } from "@/lib/supabase/server";

const bkashConfig = {
  base_url: process.env.BKASH_BASE_URL!,
  username: process.env.BKASH_USERNAME!,
  password: process.env.BKASH_PASSWORD!,
  app_key: process.env.BKASH_APP_KEY!,
  app_secret: process.env.BKASH_APP_SECRET!,
  grant_token_url: process.env.BKASH_GRANT_TOKEN_URL!,
  create_payment_url: process.env.BKASH_CREATE_PAYMENT_URL!,
  execute_payment_url: process.env.BKASH_EXECUTE_PAYMENT_URL!,
};

export async function POST(req: NextRequest) {
  try {
    const { user_id, course_id, workshop_id, amount, email, name, phone, coupon_id, coupon_code, discount_amount } = await req.json();
    const webUrl = req.headers.get("origin") || "https://insilicology.org";
    const paymentID = uuidv4().substring(0, 10);
    
    if (!amount || !email || !name || !user_id) {
      return NextResponse.json({
        statusCode: 2065,
        statusMessage: "amount, email, name, user_id required",
      });
    }

    if (!course_id && !workshop_id) {
      return NextResponse.json({
        statusCode: 2065,
        statusMessage: "course_id or workshop_id required",
      });
    }
    
    if (amount < 1) {
      return NextResponse.json({
        statusCode: 2065,
        statusMessage: "minimum amount 1",
      });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Supabase admin client not available"
      });
    }

    // Determine purpose and validate accordingly
    let purpose: 'course' | 'workshop' | 'book' | 'other';
    let validationQuery;

    if (course_id) {
      purpose = 'course';
      validationQuery = supabaseAdmin
        .from('courses')
        .select('id, title')
        .eq('id', course_id)
        .single();
    } else if (workshop_id) {
      purpose = 'workshop';
      validationQuery = supabaseAdmin
        .from('workshops')
        .select('id, title')
        .eq('id', workshop_id)
        .single();
    } else {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "Invalid payment purpose"
      });
    }

    // Parallel validation of user and item (course/workshop)
    const [userValidation, itemValidation] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', user_id)
        .single(),
      validationQuery
    ]);

    if (userValidation.error || !userValidation.data) {
      console.error('User not found:', user_id, userValidation.error);
      return NextResponse.json({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }

    if (itemValidation.error || !itemValidation.data) {
      console.error(`${purpose} not found:`, course_id || workshop_id, itemValidation.error);
      return NextResponse.json({
        statusCode: 404,
        statusMessage: `${purpose.charAt(0).toUpperCase() + purpose.slice(1)} not found`
      });
    }

    console.log(`Validated user and ${purpose}:`, { 
      user_id, 
      [purpose === 'course' ? 'course_id' : 'workshop_id']: course_id || workshop_id, 
      item_title: itemValidation.data.title 
    });

    // Create payment record and prepare payment details in parallel
    const [paymentRecord, paymentDetails] = await Promise.all([
      createPaymentRecord({
        user_id: user_id,
        course_id: course_id,
        workshop_id: workshop_id,
        amount: amount,
        payment_channel: 'bkash',
        transaction_id: paymentID,
        purpose: purpose
      }),
      Promise.resolve({
        amount: amount,
        name: name,
        email: email,
        phone: phone || '',
        callbackURL: `${webUrl}/api/bkash/callback`,
        orderID: paymentID,
        reference: phone || 'user',
      })
    ]);

    if (!paymentRecord) {
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Failed to create payment record"
      });
    }

    // Update payment with coupon context if provided
    if (coupon_id || coupon_code || typeof discount_amount === 'number') {
      await updatePaymentRecord(paymentRecord.id, {
        coupon_id: coupon_id || null,
        coupon_code: coupon_code || null,
        discount_amount: typeof discount_amount === 'number' ? discount_amount : 0,
      });
    }

    console.log('Created payment record:', paymentRecord);
    console.log("Creating bKash payment with details:", paymentDetails);

    const createPaymentResponse = await createPayment(
      bkashConfig,
      paymentDetails
    );
    
    console.log("bKash payment response:", createPaymentResponse);

    if (createPaymentResponse.statusCode !== "0000") {
      // Update payment record to failed status
      await updatePaymentRecord(paymentRecord.id, { status: 'failed' });

      return NextResponse.json({
        statusCode: 500,
        statusMessage: createPaymentResponse.statusMessage || "Payment Failed",
        error: createPaymentResponse
      });
    }

    // Update payment record with bKash details
    await updatePaymentRecord(paymentRecord.id, {
      bkash_payment_id: createPaymentResponse.paymentID,
      bkash_url: createPaymentResponse.bkashURL
    });

    return NextResponse.json({
      statusCode: 200,
      statusMessage: "Payment created successfully",
      data: {
        paymentID: createPaymentResponse.paymentID,
        bkashURL: createPaymentResponse.bkashURL,
        orderID: paymentID
      }
    });

  } catch (error) {
    console.error("Error in make-payment:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}