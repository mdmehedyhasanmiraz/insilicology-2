import { NextResponse } from "next/server";
import { getOptimizedToken } from "@/service/bkash";

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

export async function GET() {
  try {
    const startTime = Date.now();
    
    // Test token retrieval performance
    const tokenStart = Date.now();
    const token = await getOptimizedToken(bkashConfig);
    const tokenTime = Date.now() - tokenStart;
    
    const totalTime = Date.now() - startTime;
    
    return NextResponse.json({
      statusCode: 200,
      statusMessage: "Performance test completed",
      data: {
        tokenRetrieved: !!token,
        tokenRetrievalTime: `${tokenTime}ms`,
        totalTime: `${totalTime}ms`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Performance test error:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Performance test failed",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 