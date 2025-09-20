import { NextResponse } from "next/server";
import { refreshTokenInBackground } from "@/service/bkash";

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

export async function POST() {
  try {
    // Start background token refresh
    refreshTokenInBackground(bkashConfig);
    
    return NextResponse.json({
      statusCode: 200,
      statusMessage: "Token refresh initiated in background"
    });
  } catch (error) {
    console.error("Error initiating token refresh:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Failed to initiate token refresh",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 