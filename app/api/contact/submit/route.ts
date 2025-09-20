import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "নাম, ইমেইল, বিষয় এবং বার্তা আবশ্যক"
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        statusCode: 400,
        statusMessage: "সঠিক ইমেইল ঠিকানা দিন"
      });
    }

    // Get client information
    const forwarded = req.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const pageUrl = req.headers.get('referer') || 'unknown';

    // Create contact submission
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "সার্ভার ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।"
      });
    }

    const { data: submission, error } = await supabaseAdmin
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject.trim(),
        message: message.trim(),
        ip_address: ipAddress,
        user_agent: userAgent,
        page_url: pageUrl,
        source: 'contact_form'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating contact submission:', error);
      return NextResponse.json({
        statusCode: 500,
        statusMessage: "বার্তা পাঠানো যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।"
      });
    }

    console.log('Contact submission created:', submission);

    // Here you could add additional logic like:
    // - Sending email notifications to admin
    // - Sending confirmation email to user
    // - Creating tasks in project management tools
    // - Logging to external services

    return NextResponse.json({
      statusCode: 200,
      statusMessage: "আপনার বার্তা সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
      data: {
        id: submission.id,
        submitted_at: submission.created_at
      }
    });

  } catch (error) {
    console.error('Error in contact submission:', error);
    return NextResponse.json({
      statusCode: 500,
      statusMessage: "সার্ভার ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।"
    });
  }
} 