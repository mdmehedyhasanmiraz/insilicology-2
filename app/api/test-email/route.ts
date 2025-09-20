import { NextRequest, NextResponse } from 'next/server';
import emailService from '@/utils/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email, name, jobTitle } = await request.json();

    if (!email || !name || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: email, name, jobTitle' },
        { status: 400 }
      );
    }

    // Test job application email
    const result = await emailService.sendJobApplicationConfirmation(
      name,
      email,
      jobTitle
    );

    if (result) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Test email sent successfully',
          details: {
            to: email,
            subject: `Job Application Received - ${jobTitle} at Skilltori`,
            type: 'job_application_confirmation'
          }
        }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to send test email',
          note: 'Check console logs for details'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test email endpoint',
    usage: {
      method: 'POST',
      body: {
        email: 'test@example.com',
        name: 'Test User',
        jobTitle: 'Software Developer'
      }
    }
  });
} 