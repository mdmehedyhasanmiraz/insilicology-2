import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    console.log('Testing SMTP connection...');
    
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.stackmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'no-reply@skilltori.com',
        pass: process.env.SMTP_PASS || 'no-reply@skilltori.com'
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    };

    console.log('SMTP Config:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.auth.user,
      secure: smtpConfig.secure
    });

    const transporter = nodemailer.createTransport(smtpConfig);
    
    // Test the connection
    const verifyResult = await transporter.verify();
    console.log('SMTP verification result:', verifyResult);
    
    return NextResponse.json({
      success: true,
      message: 'SMTP connection successful',
      config: {
        host: smtpConfig.host,
        port: smtpConfig.port,
        user: smtpConfig.auth.user,
        secure: smtpConfig.secure
      }
    });
    
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.stack : 'No stack trace available'
    }, { status: 500 });
  }
} 