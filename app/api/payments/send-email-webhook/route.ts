import { NextRequest, NextResponse } from "next/server";
import { sendPaymentConfirmationEmail } from "@/app/(public)/success/actions";

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "Payment ID is required"
      });
    }

    console.log('Webhook: Sending payment confirmation email for payment ID:', paymentId);
    
    // Send the email using the server action
    const result = await sendPaymentConfirmationEmail(paymentId);
    
    if (result.success) {
      console.log('Webhook: Payment confirmation email sent successfully:', result.message);
      return NextResponse.json({
        statusCode: 200,
        statusMessage: "Payment confirmation email sent successfully",
        details: result
      });
    } else {
      console.error('Webhook: Failed to send payment confirmation email:', result.error);
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Failed to send payment confirmation email",
        error: result.error
      });
    }

  } catch (error) {
    console.error("Error in payment email webhook:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 