import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";

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
    console.log("Testing bKash token grant...");
    console.log("Config:", {
      base_url: bkashConfig.base_url,
      username: bkashConfig.username,
      app_key: bkashConfig.app_key,
      // Don't log password and secret
    });

    const response = await axios.post(
      bkashConfig.grant_token_url || `${bkashConfig.base_url}/tokenized/checkout/token/grant`,
      {
        app_key: bkashConfig.app_key,
        app_secret: bkashConfig.app_secret
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "username": bkashConfig.username,
          "password": bkashConfig.password
        },
      }
    );

    console.log("Token response:", response.data);

    return NextResponse.json({
      statusCode: 200,
      statusMessage: "Token test successful",
      data: {
        statusCode: response.data.statusCode,
        statusMessage: response.data.statusMessage,
        token_type: response.data.token_type,
        expires_in: response.data.expires_in,
        has_id_token: !!response.data.id_token,
        id_token_length: response.data.id_token?.length || 0
      }
    });

  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("Token test error:", axiosError.response?.data || axiosError.message);
    
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Token test failed",
      error: {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data
      }
    });
  }
} 