import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "Payment ID is required"
      });
    }

    console.log('Testing payment confirmation email for payment ID:', paymentId);
    
    // Call the email API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payments/send-confirmation-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId: paymentId
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      return NextResponse.json({
        statusCode: 200,
        statusMessage: "Test email sent successfully",
        details: result
      });
    } else {
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Failed to send test email",
        details: result
      });
    }

  } catch (error) {
    console.error("Error in test payment email:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 