import { NextRequest, NextResponse } from "next/server";
import emailService from "@/utils/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email, fullName } = await req.json();

    if (!email || !fullName) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "Email and fullName are required"
      });
    }

    console.log('Testing workshop email with:', { email, fullName });

    const emailResult = await emailService.sendWorkshopPaymentConfirmation(
      fullName,
      email,
      'Test Workshop Title',
      'Monday, January 1, 2025',
      '10:00 AM - 12:00 PM',
      'Test Speaker',
      1000,
      'https://wa.me/1234567890'
    );

    if (emailResult) {
      return NextResponse.json({
        statusCode: 200,
        statusMessage: "Test workshop email sent successfully"
      });
    } else {
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Failed to send test workshop email"
      });
    }

  } catch (error) {
    console.error("Error in test workshop email:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 