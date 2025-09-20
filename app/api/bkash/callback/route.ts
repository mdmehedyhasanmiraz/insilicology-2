import { executePayment } from "@/service/bkash";
import { NextRequest, NextResponse } from "next/server";
import { 
  findPaymentByBkashId, 
  processSuccessfulPayment, 
  processFailedPayment
} from "@/lib/supabase/paymentUtils";
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
    const body = await req.json();
    console.log("bKash callback received:", body);

    const { paymentID, status } = body as { paymentID?: string; status?: string };

    if (!paymentID) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "Payment ID is required"
      });
    }

    // Find the payment record by bKash payment ID
    console.log('Looking for payment record with bKash payment ID:', paymentID);
    const paymentRecord = await findPaymentByBkashId(paymentID);

    if (!paymentRecord) {
      console.error('Payment record not found for bKash payment ID:', paymentID);
      return NextResponse.json({
        statusCode: 404,
        statusMessage: "Payment record not found"
      });
    }

    console.log('Found payment record:', paymentRecord);
    console.log('Payment record purpose:', paymentRecord.purpose);

    if (status === "success") {
      // Execute the payment to verify it
      const executeResponse = await executePayment(bkashConfig, paymentID);
      console.log("Execute payment response:", executeResponse);
      console.log("Execute response statusCode:", executeResponse?.statusCode);
      console.log("Execute response transactionStatus:", executeResponse?.transactionStatus);

      if (executeResponse?.statusCode === "0000" && executeResponse?.transactionStatus === "Completed") {
        // Payment is successful, process it
        const success = await processSuccessfulPayment(paymentRecord, paymentID);

        // Record coupon usage if coupon was applied
        try {
          if (success && supabaseAdmin && paymentRecord.coupon_id) {
            const couponId = paymentRecord.coupon_id;
            const couponCode = paymentRecord.coupon_code || null;
            const discountAmount = Number(paymentRecord.discount_amount || 0);
            const originalAmount = Number(paymentRecord.amount || 0) + discountAmount; // amount already discounted when charging
            const finalAmount = Number(paymentRecord.amount || 0);

            const { error: insertErr } = await supabaseAdmin
              .from('user_coupons')
              .insert({
                user_id: paymentRecord.user_id,
                coupon_id: couponId,
                coupon_code: couponCode,
                payment_id: paymentRecord.id,
                purpose: paymentRecord.purpose,
                course_id: paymentRecord.course_id || null,
                workshop_id: paymentRecord.workshop_id || null,
                original_amount: originalAmount,
                discount_amount: discountAmount,
                final_amount: finalAmount,
              });
            if (insertErr) {
              console.error('Failed to insert user_coupons record:', insertErr);
            }
          }
        } catch (ucErr) {
          console.error('Error recording user coupon usage:', ucErr);
        }

        if (success) {
          return NextResponse.json({
            statusCode: 200,
            statusMessage: "Payment processed successfully",
            paymentID: paymentID,
            transactionStatus: executeResponse.transactionStatus
          });
        } else {
          return NextResponse.json({
            statusCode: 500,
            statusMessage: "Failed to process successful payment",
            paymentID: paymentID
          });
        }
      } else {
        // Payment execution failed
        await processFailedPayment(paymentRecord);

        return NextResponse.json({
          statusCode: 400,
          statusMessage: "Payment execution failed",
          error: executeResponse
        });
      }
    } else if (status === "failure" || status === "cancel") {
      // Payment failed or was cancelled
      await processFailedPayment(paymentRecord);

      return NextResponse.json({
        statusCode: 200,
        statusMessage: `Payment ${status}`,
        paymentID: paymentID
      });
    }

    return NextResponse.json({
      statusCode: 200,
      statusMessage: "Callback processed",
      paymentID: paymentID,
      status: status
    });

  } catch (error) {
    console.error("Error in bKash callback:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error
    });
  }
}

// Also handle GET requests (for browser redirects)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentID = searchParams.get('paymentID') || undefined;
    const status = searchParams.get('status') || undefined;
    const baseUrl = req.headers.get("origin") || "https://insilicology.org";

    console.log("bKash GET callback received:", { paymentID, status });

    if (paymentID) {
      // Find the payment record by bKash payment ID
      const paymentRecord = await findPaymentByBkashId(paymentID);

      if (paymentRecord) {
        console.log('Found payment record for GET callback:', paymentRecord);

        if (status === "success") {
          // Execute the payment to verify it
          const executeResponse = await executePayment(bkashConfig, paymentID);
          console.log("Execute payment response (GET):", executeResponse);
          console.log("Execute response statusCode (GET):", executeResponse?.statusCode);
          console.log("Execute response transactionStatus (GET):", executeResponse?.transactionStatus);

          if (executeResponse?.statusCode === "0000" && executeResponse?.transactionStatus === "Completed") {
            // Payment is successful, process it
            const success = await processSuccessfulPayment(paymentRecord, paymentID);
            
            // Record coupon usage if coupon was applied
            try {
              if (success && supabaseAdmin && paymentRecord.coupon_id) {
                const couponId = paymentRecord.coupon_id;
                const couponCode = paymentRecord.coupon_code || null;
                const discountAmount = Number(paymentRecord.discount_amount || 0);
                const originalAmount = Number(paymentRecord.amount || 0) + discountAmount;
                const finalAmount = Number(paymentRecord.amount || 0);
  
                const { error: insertErr } = await supabaseAdmin
                  .from('user_coupons')
                  .insert({
                    user_id: paymentRecord.user_id,
                    coupon_id: couponId,
                    coupon_code: couponCode,
                    payment_id: paymentRecord.id,
                    purpose: paymentRecord.purpose,
                    course_id: paymentRecord.course_id || null,
                    workshop_id: paymentRecord.workshop_id || null,
                    original_amount: originalAmount,
                    discount_amount: discountAmount,
                    final_amount: finalAmount,
                  });
                if (insertErr) {
                  console.error('Failed to insert user_coupons record:', insertErr);
                }
              }
            } catch (ucErr) {
              console.error('Error recording user coupon usage (GET):', ucErr);
            }
          } else {
            // Payment execution failed
            await processFailedPayment(paymentRecord);
          }
        } else if (status === "failure" || status === "cancel") {
          // Payment failed or was cancelled
          await processFailedPayment(paymentRecord);
        }
      }
      
      // Redirect to appropriate page based on status
      
      // Determine payment type for redirect
      const paymentType = paymentRecord?.purpose === 'workshop' ? '&type=workshop' : '';
      
      if (status === "success") {
        return NextResponse.redirect(`${baseUrl}/success?paymentID=${paymentID}${paymentType}`);
      } else if (status === "failure") {
        return NextResponse.redirect(`${baseUrl}/cancel?paymentID=${paymentID}${paymentType}`);
      } else if (status === "cancel") {
        return NextResponse.redirect(`${baseUrl}/cancel?paymentID=${paymentID}${paymentType}`);
      }
    }

    // Fallback redirects if no payment record found
    
    if (status === "success") {
      return NextResponse.redirect(`${baseUrl}/success?paymentID=${paymentID}`);
    } else if (status === "failure") {
      return NextResponse.redirect(`${baseUrl}/cancel?paymentID=${paymentID}`);
    } else if (status === "cancel") {
      return NextResponse.redirect(`${baseUrl}/cancel?paymentID=${paymentID}`);
    }

    // Default redirect
    return NextResponse.redirect(`${baseUrl}/dashboard/payments`);

  } catch (error) {
    console.error("Error in bKash GET callback:", error);
    const baseUrl = req.headers.get("origin") || "https://insilicology.org";
    return NextResponse.redirect(`${baseUrl}/dashboard/payments`);
  }
}