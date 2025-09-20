import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import emailService from "@/utils/emailService";

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "Payment ID is required"
      });
    }

    console.log('Sending confirmation email for payment ID:', paymentId);

    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "Database connection not available"
      });
    }

    // Get the payment record
    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !paymentRecord) {
      console.error('Error fetching payment record:', paymentError);
      return NextResponse.json({
        statusCode: 404,
        statusMessage: "Payment record not found"
      });
    }

    // Check if payment is successful
    if (paymentRecord.status !== 'successful') {
      console.log('Payment is not successful, skipping email. Status:', paymentRecord.status);
      return NextResponse.json({
        statusCode: 200,
        statusMessage: "Payment is not successful, email not sent"
      });
    }

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', paymentRecord.user_id)
      .single();

    if (userError || !user) {
      console.error('Error fetching user details:', userError);
      return NextResponse.json({
        statusCode: 404,
        statusMessage: "User not found"
      });
    }

    const fullName = user.email?.split('@')[0] || 'User';

    // Send email based on payment purpose
    if (paymentRecord.purpose === 'workshop' && paymentRecord.workshop_id) {
      // Get workshop details
      const { data: workshop, error: workshopError } = await supabaseAdmin
        .from('workshops')
        .select('title, start_time, end_time, speaker_name, group_link')
        .eq('id', paymentRecord.workshop_id)
        .single();

      if (workshopError || !workshop) {
        console.error('Error fetching workshop details:', workshopError);
        return NextResponse.json({
          statusCode: 404,
          statusMessage: "Workshop not found"
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

      console.log('Sending workshop payment confirmation email:', {
        fullName,
        email: user.email,
        workshopTitle: workshop.title,
        workshopDate,
        workshopTime,
        speakerName: workshop.speaker_name,
        amount: paymentRecord.amount,
        groupLink: workshop.group_link
      });

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

      if (emailResult) {
        console.log('Workshop payment confirmation email sent successfully');
        return NextResponse.json({
          statusCode: 200,
          statusMessage: "Workshop payment confirmation email sent successfully"
        });
      } else {
        console.error('Failed to send workshop payment confirmation email');
        return NextResponse.json({
          statusCode: 500,
          statusMessage: "Failed to send workshop payment confirmation email"
        });
      }

    } else if (paymentRecord.purpose === 'course' && paymentRecord.course_id) {
      // Get course details
      const { data: course, error: courseError } = await supabaseAdmin
        .from('courses')
        .select('title, type, duration, price_offer')
        .eq('id', paymentRecord.course_id)
        .single();

      if (courseError || !course) {
        console.error('Error fetching course details:', courseError);
        return NextResponse.json({
          statusCode: 404,
          statusMessage: "Course not found"
        });
      }

      console.log('Sending course payment confirmation email:', {
        fullName,
        email: user.email,
        courseTitle: course.title,
        courseType: course.type,
        courseDuration: course.duration,
        amount: paymentRecord.amount
      });

      const emailResult = await emailService.sendCoursePaymentConfirmation(
        fullName,
        user.email!,
        course.title,
        course.type,
        course.duration,
        paymentRecord.amount
      );

      if (emailResult) {
        console.log('Course payment confirmation email sent successfully');
        return NextResponse.json({
          statusCode: 200,
          statusMessage: "Course payment confirmation email sent successfully"
        });
      } else {
        console.error('Failed to send course payment confirmation email');
        return NextResponse.json({
          statusCode: 500,
          statusMessage: "Failed to send course payment confirmation email"
        });
      }

    } else {
      console.log('Unknown payment purpose:', paymentRecord.purpose);
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "Unknown payment purpose"
      });
    }

  } catch (error) {
    console.error("Error in send confirmation email:", error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 