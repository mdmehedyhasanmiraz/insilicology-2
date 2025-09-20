import { createPayment } from "@/service/bkash";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createWorkshopPaymentRecord } from "@/lib/supabase/workshopPaymentUtils";
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
    const { user_id, workshop_id, amount, email, name, phone } = await req.json();
    const webUrl = req.headers.get("origin") || "https://insilicology.org";
    const paymentID = uuidv4().substring(0, 10);
    
    if (!amount || !email || !name || !user_id || !workshop_id) {
      return NextResponse.json({
        statusCode: 2065,
        statusMessage: "amount, email, name, user_id, workshop_id required",
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

    // Parallel validation of user and workshop
    const [userValidation, workshopValidation] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', user_id)
        .single(),
      supabaseAdmin
        .from('workshops')
        .select('id, title')
        .eq('id', workshop_id)
        .single()
    ]);

    if (userValidation.error || !userValidation.data) {
      console.error('User not found:', user_id, userValidation.error);
      return NextResponse.json({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }

    if (workshopValidation.error || !workshopValidation.data) {
      console.error('Workshop not found:', workshop_id, workshopValidation.error);
      return NextResponse.json({
        statusCode: 404,
        statusMessage: "Workshop not found"
      });
    }

    console.log('Validated user and workshop:', { user_id, workshop_id, workshop_title: workshopValidation.data.title });

    // Create payment record and prepare payment details in parallel
    const [paymentRecord, paymentDetails] = await Promise.all([
      createWorkshopPaymentRecord({
        user_id: user_id,
        workshop_id: workshop_id,
        amount: amount,
        payment_channel: 'bkash',
        transaction_id: paymentID
      }),
      Promise.resolve({
        amount: amount,
        name: name,
        email: email,
        phone: phone || '',
        callbackURL: `${webUrl}/api/bkash/workshop-callback`,
        orderID: paymentID,
        reference: phone || 'user',
      })
    ]);

    if (!paymentRecord) {
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Failed to create workshop payment record"
      });
    }

    console.log('Created workshop payment record:', paymentRecord);
    console.log("Creating bKash payment with details:", paymentDetails);

    const createPaymentResponse = await createPayment(
      bkashConfig,
      paymentDetails
    );
    
    console.log("bKash payment response:", createPaymentResponse);

    if (createPaymentResponse?.statusCode === "0000" && createPaymentResponse?.bkashURL) {
      // Update payment record with bKash URL
      await supabaseAdmin
        .from('payments')
        .update({ bkash_url: createPaymentResponse.bkashURL })
        .eq('id', paymentRecord.id)
        .eq('purpose', 'workshop');

      return NextResponse.json({
        statusCode: 200,
        statusMessage: "Payment created successfully",
        data: {
          bkashURL: createPaymentResponse.bkashURL,
          paymentID: paymentID,
          amount: amount
        }
      });
    } else {
      console.error("bKash payment creation failed:", createPaymentResponse);
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Failed to create bKash payment",
        error: createPaymentResponse
      });
    }

  } catch (error) {
    console.error("Error in workshop payment creation:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error
    });
  }
} 