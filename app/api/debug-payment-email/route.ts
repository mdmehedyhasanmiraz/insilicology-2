import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server';
import emailService from '@/utils/emailService';

export async function POST(req: NextRequest) {
  try {
    const { paymentId, testMode = false } = await req.json();

    if (!paymentId) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "Payment ID is required"
      });
    }

    console.log('=== PAYMENT EMAIL DEBUG START ===');
    console.log('Payment ID:', paymentId);
    console.log('Test Mode:', testMode);

    const debugSteps = [];

    // Step 1: Check if Supabase client is available
    try {
      // const supabase = await createClient();
      debugSteps.push({ step: 1, status: 'SUCCESS', message: 'Supabase client created' });
      console.log('✅ Step 1: Supabase client created');
    } catch (error) {
      debugSteps.push({ step: 1, status: 'FAILED', message: 'Failed to create Supabase client', error: error instanceof Error ? error.message : String(error) });
      console.log('❌ Step 1: Failed to create Supabase client', error);
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Failed to create Supabase client",
        debugSteps
      });
    }

    // Step 2: Fetch payment record by UUID
    let paymentRecord;
    try {
      const supabase = await createClient();
      
      console.log('Searching for payment with UUID:', paymentId);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error || !data) {
        debugSteps.push({ step: 2, status: 'FAILED', message: 'Payment record not found by UUID', error: error?.message });
        console.log('❌ Step 2: Payment record not found by UUID', error);
        return NextResponse.json({
          statusCode: 404,
          statusMessage: "Payment record not found by UUID",
          debugSteps
        });
      }

      paymentRecord = data;
      debugSteps.push({ step: 2, status: 'SUCCESS', message: 'Payment record found by UUID', data: { id: data.id, status: data.status, purpose: data.purpose } });
      console.log('✅ Step 2: Payment record found by UUID', { id: data.id, status: data.status, purpose: data.purpose });
    } catch (error) {
      debugSteps.push({ step: 2, status: 'FAILED', message: 'Error fetching payment record', error: error instanceof Error ? error.message : String(error) });
      console.log('❌ Step 2: Error fetching payment record', error);
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Error fetching payment record",
        debugSteps
      });
    }

    // Step 3: Check payment status
    if (paymentRecord.status !== 'successful') {
      debugSteps.push({ step: 3, status: 'FAILED', message: `Payment status is not successful (current: ${paymentRecord.status})` });
      console.log('❌ Step 3: Payment status is not successful', paymentRecord.status);
      return NextResponse.json({
        statusCode: 400,
        statusMessage: `Payment status is not successful (current: ${paymentRecord.status})`,
        debugSteps
      });
    }

    debugSteps.push({ step: 3, status: 'SUCCESS', message: 'Payment status is successful' });
    console.log('✅ Step 3: Payment status is successful');

    // Step 4: Fetch user details
    let user;
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', paymentRecord.user_id)
        .single();

      if (error || !data) {
        debugSteps.push({ step: 4, status: 'FAILED', message: 'User not found', error: error?.message });
        console.log('❌ Step 4: User not found', error);
        return NextResponse.json({
          statusCode: 404,
          statusMessage: "User not found",
          debugSteps
        });
      }

      user = {
        email: data.email,
        user_metadata: null // We'll use email fallback for name
      };

      debugSteps.push({ step: 4, status: 'SUCCESS', message: 'User found', data: { email: user.email } });
      console.log('✅ Step 4: User found', { email: user.email });
    } catch (error) {
      debugSteps.push({ step: 4, status: 'FAILED', message: 'Error fetching user', error: error instanceof Error ? error.message : String(error) });
      console.log('❌ Step 4: Error fetching user', error);
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Error fetching user",
        debugSteps
      });
    }

    // Step 5: Test email service directly
    try {
      console.log('Testing email service with simple test email...');
      const testResult = await emailService.sendEmail({
        to: user.email!,
        subject: 'Payment Email Debug Test',
        html: '<h1>This is a test email</h1><p>If you receive this, the email service is working.</p>',
        text: 'This is a test email. If you receive this, the email service is working.'
      });

      debugSteps.push({ step: 5, status: 'SUCCESS', message: 'Email service test completed', result: testResult });
      console.log('✅ Step 5: Email service test completed', testResult);
    } catch (error) {
      debugSteps.push({ step: 5, status: 'FAILED', message: 'Email service test failed', error: error instanceof Error ? error.message : String(error) });
      console.log('❌ Step 5: Email service test failed', error);
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Email service test failed",
        debugSteps
      });
    }

    // Step 6: Send actual payment email
    if (!testMode) {
      try {
        const fullName = user.email?.split('@')[0] || 'User';

        if (paymentRecord.purpose === 'workshop' && paymentRecord.workshop_id) {
          // Get workshop details
          const supabase = await createClient();
          const { data: workshop, error: workshopError } = await supabase
            .from('workshops')
            .select('title, start_time, end_time, speaker_name, group_link')
            .eq('id', paymentRecord.workshop_id)
            .single();

          if (workshopError || !workshop) {
            debugSteps.push({ step: 6, status: 'FAILED', message: 'Workshop not found', error: workshopError?.message });
            console.log('❌ Step 6: Workshop not found', workshopError);
            return NextResponse.json({
              statusCode: 404,
              statusMessage: "Workshop not found",
              debugSteps
            });
          }

          // Format date and time
          const startDate = new Date(workshop.start_time);
          const endDate = new Date(workshop.end_time);
          
          const workshopDate = startDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          
          const workshopTime = `${startDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })} - ${endDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}`;

          console.log('Sending workshop payment confirmation email...');
          const emailResult = await emailService.sendWorkshopPaymentConfirmation(
            fullName,
            user.email!,
            workshop.title,
            workshopDate,
            workshopTime,
            workshop.speaker_name,
            paymentRecord.amount,
            workshop.group_link || undefined
          );

          debugSteps.push({ step: 6, status: 'SUCCESS', message: 'Workshop payment email sent', result: emailResult });
          console.log('✅ Step 6: Workshop payment email sent', emailResult);

        } else if (paymentRecord.purpose === 'course' && paymentRecord.course_id) {
          // Get course details
          const supabase = await createClient();
          const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('title, type, duration')
            .eq('id', paymentRecord.course_id)
            .single();

          if (courseError || !course) {
            debugSteps.push({ step: 6, status: 'FAILED', message: 'Course not found', error: courseError?.message });
            console.log('❌ Step 6: Course not found', courseError);
            return NextResponse.json({
              statusCode: 404,
              statusMessage: "Course not found",
              debugSteps
            });
          }

          console.log('Sending course payment confirmation email...');
          const emailResult = await emailService.sendCoursePaymentConfirmation(
            fullName,
            user.email!,
            course.title,
            course.type,
            course.duration,
            paymentRecord.amount
          );

          debugSteps.push({ step: 6, status: 'SUCCESS', message: 'Course payment email sent', result: emailResult });
          console.log('✅ Step 6: Course payment email sent', emailResult);
        }
      } catch (error) {
        debugSteps.push({ step: 6, status: 'FAILED', message: 'Error sending payment email', error: error instanceof Error ? error.message : String(error) });
        console.log('❌ Step 6: Error sending payment email', error);
        return NextResponse.json({
          statusCode: 500,
          statusMessage: "Error sending payment email",
          debugSteps
        });
      }
    }

    console.log('=== PAYMENT EMAIL DEBUG END ===');

    return NextResponse.json({
      statusCode: 200,
      statusMessage: "Debug completed successfully",
      debugSteps,
      paymentRecord: {
        id: paymentRecord.id,
        status: paymentRecord.status,
        purpose: paymentRecord.purpose,
        amount: paymentRecord.amount
      },
      user: {
        email: user.email,
        hasMetadata: !!user.user_metadata
      }
    });

  } catch (error) {
    console.error("Error in payment email debug:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error instanceof Error ? error.message : String(error)
    });
  }
} 