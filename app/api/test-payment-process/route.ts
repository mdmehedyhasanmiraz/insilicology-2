import { NextRequest, NextResponse } from "next/server";
import { processSuccessfulPayment, findPaymentByBkashId } from "@/lib/supabase/paymentUtils";

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "Payment ID is required"
      });
    }

    console.log('Testing payment processing for payment ID:', paymentId);

    // First, let's find the payment record
    const paymentRecord = await findPaymentByBkashId(paymentId);
    
    if (!paymentRecord) {
      return NextResponse.json({
        statusCode: 404,
        statusMessage: "Payment record not found"
      });
    }

    console.log('Found payment record:', paymentRecord);

    // Test the payment processing function
    const success = await processSuccessfulPayment(paymentRecord, paymentId);

    if (success) {
      return NextResponse.json({
        statusCode: 200,
        statusMessage: "Payment processing completed successfully",
        paymentRecord: paymentRecord
      });
    } else {
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Payment processing failed"
      });
    }

  } catch (error) {
    console.error("Error in test payment process:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 