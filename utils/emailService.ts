import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private lastEmailTime: number = 0;
  private minInterval: number = 60000; // 60 seconds in milliseconds
  private fallbackMode: boolean = false;

  constructor() {
    // Use environment variables if available, otherwise fall back to hardcoded values
    const smtpConfig = {
      host: process.env.SMTP_HOST || 'smtp.stackmail.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // use SSL
      auth: {
        user: process.env.SMTP_USER || 'no-reply@skilltori.com',
        pass: process.env.SMTP_PASS || 'no-reply@skilltori.com'
      },
      // Add timeout and connection settings
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000,   // 30 seconds
      socketTimeout: 60000,     // 60 seconds
    };

    console.log('SMTP Configuration:', {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.auth.user,
      // Don't log the password for security
    });

    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastEmail = now - this.lastEmailTime;
    
    if (timeSinceLastEmail < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastEmail;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastEmailTime = Date.now();
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      await this.waitForRateLimit();

      // If in fallback mode, just log the email
      if (this.fallbackMode) {
        console.log('📧 FALLBACK MODE - Email would be sent:');
        console.log('To:', emailData.to);
        console.log('Subject:', emailData.subject);
        console.log('Text content:', emailData.text);
        return true;
      }

      // Verify SMTP connection first
      try {
        await this.transporter.verify();
        console.log('SMTP connection verified successfully');
      } catch (verifyError) {
        console.error('SMTP verification failed, switching to fallback mode:', verifyError);
        this.fallbackMode = true;
        return await this.sendEmail(emailData); // Retry in fallback mode
      }

      const mailOptions = {
        from: {
          name: 'Skilltori',
          address: process.env.SMTP_USER || 'no-reply@skilltori.com'
        },
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        replyTo: 'info@skilltori.com'
      };

      console.log('Attempting to send email to:', emailData.to);
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      
      // Log more detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Switch to fallback mode for future emails
      this.fallbackMode = true;
      console.log('Switched to fallback mode. Future emails will be logged instead of sent.');
      
      return false;
    }
  }

  async sendCampusAmbassadorConfirmation(
    fullName: string,
    email: string,
    universityName: string,
  ): Promise<boolean> {
    const subject = 'Campus Ambassador Application Received - Skilltori';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Campus Ambassador Application Confirmation</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
            padding: 20px;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          
          .logo-container {
            margin-bottom: 20px;
            text-align: center;
          }
          
          .logo {
            width: 140px;
            height: 42px;
            margin: 0 auto;
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
          }
          
          .header h2 {
            color: #ffffff;
            font-size: 18px;
            font-weight: 500;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
            background-color: #ffffff;
          }
          
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 24px;
          }
          
          .highlight {
            color: #f59e0b;
            font-weight: 600;
          }
          
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 32px;
            line-height: 1.7;
          }
          
          .details-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .details-card h3 {
            color: #92400e;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .details-list {
            list-style: none;
            margin: 0;
            padding: 0;
          }
          
          .details-list li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(251, 191, 36, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .details-list li:last-child {
            border-bottom: none;
          }
          
          .details-list strong {
            color: #92400e;
            font-weight: 600;
          }
          
          .details-list span {
            color: #4b5563;
            font-weight: 500;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
          }
          
          .contact-info {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .contact-info h3 {
            color: #1f2937;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            color: #4b5563;
            font-size: 14px;
          }
          
          .contact-item:last-child {
            margin-bottom: 0;
          }
          
          .contact-label {
            font-weight: 600;
            color: #1f2937;
            min-width: 60px;
          }
          
          .contact-value {
            color: #4b5563;
          }
          
          .contact-value a {
            color: #f59e0b;
            text-decoration: none;
            font-weight: 500;
          }
          
          .contact-value a:hover {
            text-decoration: underline;
          }
          
          .footer {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }
          
          .social-links {
            margin-bottom: 20px;
          }
          
          .social-links a {
            color: #fbbf24;
            text-decoration: none;
            margin: 0 15px;
            font-weight: 500;
            transition: color 0.3s ease;
          }
          
          .social-links a:hover {
            color: #ffffff;
          }
          
          .legal-links {
            margin-bottom: 20px;
          }
          
          .legal-links a {
            color: #9ca3af;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
            transition: color 0.3s ease;
          }
          
          .legal-links a:hover {
            color: #fbbf24;
          }
          
          .footer-text {
            font-size: 14px;
            color: #9ca3af;
            margin-top: 20px;
          }
          
          .footer-text strong {
            color: #fbbf24;
          }
          
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .email-container {
              border-radius: 12px;
            }
            
            .header, .content, .footer {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .header h2 {
              font-size: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-container">
              <svg class="logo" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                <text x="10" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" style="text-align: center; font-size: 24px; font-weight: bold; font-color: white;">Skilltori.com</text>
                <circle cx="180" cy="30" r="8" fill="white" opacity="0.9"/>
                <path d="M175 30 L185 30 M180 25 L180 35" stroke="white" stroke-width="2" opacity="0.9"/>
              </svg>
            </div>
            <h1>🎓 Campus Ambassador Application</h1>
            <h2>Application Received Successfully!</h2>
          </div>
          
          <div class="content">
            <p class="greeting">Dear <span class="highlight">${fullName}</span>,</p>
            
            <p class="message">
              Thank you for your interest in becoming a Campus Ambassador for Skilltori! We have successfully received your application and are excited about the possibility of working together.
            </p>

						<p class="message">
							You can now sign up to Skilltori and start exploring our courses.
						</p>
            
            <div style="text-align: center">
              <a href="https://skilltori.com/signup" class="cta-button" style="color: white;">
                🚀 Sign Up to Skilltori
              </a>
            </div>
            
            <div class="details-card">
              <h3>📋 Application Details</h3>
              <ul class="details-list">
                <li>
                  <strong>Full Name:</strong>
                  <span style="margin-left: 10px;">${fullName}</span>
                </li>
                <li>
                  <strong>Email:</strong>
                  <span style="margin-left: 10px;">${email}</span>
                </li>
                <li>
                  <strong>University:</strong>
                  <span style="margin-left: 10px;">${universityName}</span>
                </li>
              </ul>
            </div>
            
            <p class="message">
              Our team will carefully review your application and get back to you within the next few days. We'll contact you via email or phone to discuss the next steps and answer any questions you may have.
            </p>
            
            <div class="contact-info">
              <h3>📞 Contact Information</h3>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Phone:</span>
                <span class="contact-value">
                  <a href="tel:+8801842221872">+88 01842-221872</a>
                </span>
              </div>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Email:</span>
                <span class="contact-value">
                  <a href="mailto:info@skilltori.com">info@skilltori.com</a>
                </span>
              </div>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Address:</span>
                <span class="contact-value">Savar, Dhaka 1340, Bangladesh</span>
              </div>
            </div>
            
            <p class="message">
              In the meantime, feel free to explore our courses and stay connected with us on social media for the latest updates and opportunities!
            </p>
            
            <p class="message">
              Best regards,<br>
              <strong>The Skilltori Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <div class="social-links">
              <a href="https://facebook.com/skilltori">Facebook</a>
              <a href="https://linkedin.com/company/skilltori">LinkedIn</a>
              <a href="https://youtube.com/@skilltori">YouTube</a>
            </div>
            
            <div class="legal-links">
              <a href="https://skilltori.com/terms">Terms of Service</a>
              <a href="https://skilltori.com/privacy-policy">Privacy Policy</a>
            </div>
            
            <p class="footer-text">
              © 2024 <strong>Skilltori</strong>. All rights reserved.<br>
              Empowering students with practical skills for the digital age.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Campus Ambassador Application Received - Skilltori

Dear ${fullName},

Thank you for your interest in becoming a Campus Ambassador for Skilltori! We have successfully received your application.

Application Details:
- Name: ${fullName}
- Email: ${email}
- University: ${universityName}

Our team will review your application and get back to you within the next few days. We'll contact you via email or phone to discuss the next steps.

Need to reach us?
Phone: +88 01842-221872
Email: info@skilltori.com
Address: Savar, Dhaka 1340, Bangladesh

In the meantime, feel free to explore our courses and stay connected with us on social media!

Best regards,
The Skilltori Team

© 2024 Skilltori. All rights reserved.
Empowering students with practical skills for the digital age.
    `;

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    const subject = 'পাসওয়ার্ড রিসেট করুন - Skilltori';
    const html = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>পাসওয়ার্ড রিসেট - Skilltori</title>
        <style>
          body { font-family: 'Hind Siliguri', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
          .logo { color: #ffffff; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .header-text { color: #e2e8f0; font-size: 16px; }
          .content { padding: 40px 30px; }
          .title { color: #1e293b; font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
          .message { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; text-align: center; margin: 20px 0; }
          .button:hover { background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%); }
          .security-note { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 30px 0; }
          .security-title { color: #92400e; font-weight: bold; margin-bottom: 10px; }
          .security-text { color: #92400e; font-size: 14px; line-height: 1.5; }
          .footer { background-color: #f1f5f9; padding: 30px; text-align: center; }
          .footer-text { color: #64748b; font-size: 14px; margin-bottom: 10px; }
          .footer-links { margin-top: 20px; }
          .footer-links a { color: #667eea; text-decoration: none; margin: 0 10px; }
          .divider { height: 1px; background-color: #e2e8f0; margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Skilltori</div>
            <div class="header-text">আপনার শিক্ষার যাত্রা শুরু করুন</div>
          </div>
          
          <div class="content">
            <h1 class="title">পাসওয়ার্ড রিসেট করুন</h1>
            
            <div class="message">
              <p>আপনার Skilltori একাউন্টের জন্য পাসওয়ার্ড রিসেটের অনুরোধ পেয়েছি।</p>
              <p>নিচের বাটনে ক্লিক করে আপনার নতুন পাসওয়ার্ড সেট করুন:</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">পাসওয়ার্ড রিসেট করুন</a>
            </div>
            
            <div class="security-note">
              <div class="security-title">🔒 নিরাপত্তা নোট</div>
              <div class="security-text">
                • এই লিংক ২৪ ঘন্টা বৈধ থাকবে<br>
                • যদি আপনি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন<br>
                • আপনার পাসওয়ার্ড কখনো কারো সাথে শেয়ার করবেন না<br>
                • সন্দেহজনক কার্যক্রম দেখলে আমাদের সাথে যোগাযোগ করুন
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="message">
              <p><strong>লিংক কাজ করছে না?</strong></p>
              <p>নিচের লিংকটি কপি করে আপনার ব্রাউজারে পেস্ট করুন:</p>
              <p style="word-break: break-all; background-color: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">${resetUrl}</p>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-text">
              এই ইমেইলটি Skilltori থেকে পাঠানো হয়েছে
            </div>
            <div class="footer-text">
              © 2024 Skilltori. সকল অধিকার সংরক্ষিত।
            </div>
            <div class="footer-links">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}">ওয়েবসাইট</a>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact">যোগাযোগ</a>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy">গোপনীয়তা নীতি</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const text = `
পাসওয়ার্ড রিসেট করুন - Skilltori

আপনার Skilltori একাউন্টের জন্য পাসওয়ার্ড রিসেটের অনুরোধ পেয়েছি।

নিচের লিংকে ক্লিক করে আপনার নতুন পাসওয়ার্ড সেট করুন:
${resetUrl}

নিরাপত্তা নোট:
• এই লিংক ২৪ ঘন্টা বৈধ থাকবে
• যদি আপনি এই অনুরোধ না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন
• আপনার পাসওয়ার্ড কখনো কারো সাথে শেয়ার করবেন না
• সন্দেহজনক কার্যক্রম দেখলে আমাদের সাথে যোগাযোগ করুন

লিংক কাজ করছে না?
নিচের লিংকটি কপি করে আপনার ব্রাউজারে পেস্ট করুন:
${resetUrl}

এই ইমেইলটি Skilltori থেকে পাঠানো হয়েছে
© 2024 Skilltori. সকল অধিকার সংরক্ষিত।

ওয়েবসাইট: ${process.env.NEXT_PUBLIC_SITE_URL}
যোগাযোগ: ${process.env.NEXT_PUBLIC_SITE_URL}/contact
    `;
    
    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  async sendJobApplicationConfirmation(
    fullName: string,
    email: string,
    jobTitle: string,
    jobCompany: string = 'Skilltori'
  ): Promise<boolean> {
    const subject = `Job Application Received - ${jobTitle} at ${jobCompany}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Application Confirmation</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
            padding: 20px;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          
          .logo-container {
            margin-bottom: 20px;
            text-align: center;
          }
          
          .logo {
            width: 140px;
            height: 42px;
            margin: 0 auto;
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
          }
          
          .header h2 {
            color: #ffffff;
            font-size: 18px;
            font-weight: 500;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
            background-color: #ffffff;
          }
          
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 24px;
          }
          
          .highlight {
            color: #f59e0b;
            font-weight: 600;
          }
          
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 32px;
            line-height: 1.7;
          }
          
          .details-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .details-card h3 {
            color: #92400e;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .details-list {
            list-style: none;
            margin: 0;
            padding: 0;
          }
          
          .details-list li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(251, 191, 36, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .details-list li:last-child {
            border-bottom: none;
          }
          
          .details-list strong {
            color: #92400e;
            font-weight: 600;
          }
          
          .details-list span {
            color: #4b5563;
            font-weight: 500;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
          }
          
          .contact-info {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .contact-info h3 {
            color: #1f2937;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            color: #4b5563;
            font-size: 14px;
          }
          
          .contact-item:last-child {
            margin-bottom: 0;
          }
          
          .contact-label {
            font-weight: 600;
            color: #1f2937;
            min-width: 60px;
          }
          
          .contact-value {
            color: #4b5563;
          }
          
          .contact-value a {
            color: #f59e0b;
            text-decoration: none;
            font-weight: 500;
          }
          
          .contact-value a:hover {
            text-decoration: underline;
          }
          
          .footer {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }
          
          .social-links {
            margin-bottom: 20px;
          }
          
          .social-links a {
            color: #fbbf24;
            text-decoration: none;
            margin: 0 15px;
            font-weight: 500;
            transition: color 0.3s ease;
          }
          
          .social-links a:hover {
            color: #ffffff;
          }
          
          .legal-links {
            margin-bottom: 20px;
          }
          
          .legal-links a {
            color: #9ca3af;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
            transition: color 0.3s ease;
          }
          
          .legal-links a:hover {
            color: #fbbf24;
          }
          
          .footer-text {
            font-size: 14px;
            color: #9ca3af;
            margin-top: 20px;
          }
          
          .footer-text strong {
            color: #fbbf24;
          }
          
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .email-container {
              border-radius: 12px;
            }
            
            .header, .content, .footer {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .header h2 {
              font-size: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-container">
              <svg class="logo" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                <text x="10" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" style="text-align: center; font-size: 24px; font-weight: bold; font-color: white;">Skilltori.com</text>
                <circle cx="180" cy="30" r="8" fill="white" opacity="0.9"/>
                <path d="M175 30 L185 30 M180 25 L180 35" stroke="white" stroke-width="2" opacity="0.9"/>
              </svg>
            </div>
            <h1>💼 Job Application</h1>
            <h2>Application Received Successfully!</h2>
          </div>
          
          <div class="content">
            <p class="greeting">Dear <span class="highlight">${fullName}</span>,</p>
            
            <p class="message">
              Thank you for your interest in the <strong>${jobTitle}</strong> position at ${jobCompany}! We have successfully received your application and are excited to review your qualifications.
            </p>

            <p class="message">
              You can now sign up to Skilltori and start exploring our courses while we review your application.
            </p>
            
            <div style="text-align: center">
              <a href="https://skilltori.com/signup" class="cta-button" style="color: white;">
                🚀 Sign Up to Skilltori
              </a>
            </div>
            
            <div class="details-card">
              <h3>📋 Application Details</h3>
              <ul class="details-list">
                <li>
                  <strong>Full Name:</strong>
                  <span style="margin-left: 10px;">${fullName}</span>
                </li>
                <li>
                  <strong>Email:</strong>
                  <span style="margin-left: 10px;">${email}</span>
                </li>
                <li>
                  <strong>Position:</strong>
                  <span style="margin-left: 10px;">${jobTitle}</span>
                </li>
                <li>
                  <strong>Company:</strong>
                  <span style="margin-left: 10px;">${jobCompany}</span>
                </li>
              </ul>
            </div>
            
            <p class="message">
              Our hiring team will carefully review your application and resume. We typically respond within 3-5 business days. If your qualifications match our requirements, we'll contact you to schedule an interview or discuss the next steps in our hiring process.
            </p>
            
            <div class="contact-info">
              <h3>📞 Contact Information</h3>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Phone:</span>
                <span class="contact-value">
                  <a href="tel:+8801842221872">+88 01842-221872</a>
                </span>
              </div>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Email:</span>
                <span class="contact-value">
                  <a href="mailto:info@skilltori.com">info@skilltori.com</a>
                </span>
              </div>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Address:</span>
                <span class="contact-value">Savar, Dhaka 1340, Bangladesh</span>
              </div>
            </div>
            
            <p class="message">
              In the meantime, feel free to explore our courses and stay connected with us on social media for the latest updates and opportunities!
            </p>
            
            <p class="message">
              Best regards,<br>
              <strong>The Skilltori Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <div class="social-links">
              <a href="https://facebook.com/skilltori">Facebook</a>
              <a href="https://linkedin.com/company/skilltori">LinkedIn</a>
              <a href="https://youtube.com/@skilltori">YouTube</a>
            </div>
            
            <div class="legal-links">
              <a href="https://skilltori.com/terms">Terms of Service</a>
              <a href="https://skilltori.com/privacy-policy">Privacy Policy</a>
            </div>
            
            <p class="footer-text">
              © 2024 <strong>Skilltori</strong>. All rights reserved.<br>
              Empowering students with practical skills for the digital age.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Job Application Received - ${jobTitle} at ${jobCompany}

Dear ${fullName},

Thank you for your interest in the ${jobTitle} position at ${jobCompany}! We have successfully received your application.

Application Details:
- Name: ${fullName}
- Email: ${email}
- Position: ${jobTitle}
- Company: ${jobCompany}

Our hiring team will carefully review your application and resume. We typically respond within 3-5 business days. If your qualifications match our requirements, we'll contact you to schedule an interview or discuss the next steps.

Need to reach us?
Phone: +88 01842-221872
Email: info@skilltori.com
Address: Savar, Dhaka 1340, Bangladesh

In the meantime, feel free to explore our courses and stay connected with us on social media!

Best regards,
The Skilltori Team

© 2024 Skilltori. All rights reserved.
Empowering students with practical skills for the digital age.
    `;

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  async sendWorkshopPaymentConfirmation(
    fullName: string,
    email: string,
    workshopTitle: string,
    workshopDate: string,
    workshopTime: string,
    speakerName: string,
    amount: number,
    groupLink?: string
  ): Promise<boolean> {
    const subject = `Workshop Payment Confirmation - ${workshopTitle}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Workshop Payment Confirmation</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
            padding: 20px;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          
          .logo-container {
            margin-bottom: 20px;
            text-align: center;
          }
          
          .logo {
            width: 140px;
            height: 42px;
            margin: 0 auto;
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
          }
          
          .header h2 {
            color: #ffffff;
            font-size: 18px;
            font-weight: 500;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
            background-color: #ffffff;
          }
          
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 24px;
          }
          
          .highlight {
            color: #f59e0b;
            font-weight: 600;
          }
          
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 32px;
            line-height: 1.7;
          }
          
          .details-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .details-card h3 {
            color: #92400e;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .details-list {
            list-style: none;
            margin: 0;
            padding: 0;
          }
          
          .details-list li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(251, 191, 36, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .details-list li:last-child {
            border-bottom: none;
          }
          
          .details-list strong {
            color: #92400e;
            font-weight: 600;
          }
          
          .details-list span {
            color: #4b5563;
            font-weight: 500;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
          }

          .whatsapp-button {
            display: inline-block;
            background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
          }
          
          .whatsapp-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
          }
          
          .contact-info {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .contact-info h3 {
            color: #1f2937;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            color: #4b5563;
            font-size: 14px;
          }
          
          .contact-item:last-child {
            margin-bottom: 0;
          }
          
          .contact-label {
            font-weight: 600;
            color: #1f2937;
            min-width: 60px;
          }
          
          .contact-value {
            color: #4b5563;
          }
          
          .contact-value a {
            color: #f59e0b;
            text-decoration: none;
            font-weight: 500;
          }
          
          .contact-value a:hover {
            text-decoration: underline;
          }
          
          .footer {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }
          
          .social-links {
            margin-bottom: 20px;
          }
          
          .social-links a {
            color: #fbbf24;
            text-decoration: none;
            margin: 0 15px;
            font-weight: 500;
            transition: color 0.3s ease;
          }
          
          .social-links a:hover {
            color: #ffffff;
          }
          
          .legal-links {
            margin-bottom: 20px;
          }
          
          .legal-links a {
            color: #9ca3af;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
            transition: color 0.3s ease;
          }
          
          .legal-links a:hover {
            color: #fbbf24;
          }
          
          .footer-text {
            font-size: 14px;
            color: #9ca3af;
            margin-top: 20px;
          }
          
          .footer-text strong {
            color: #fbbf24;
          }
          
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .email-container {
              border-radius: 12px;
            }
            
            .header, .content, .footer {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .header h2 {
              font-size: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-container">
              <svg class="logo" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                <text x="10" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" style="text-align: center; font-size: 24px; font-weight: bold; font-color: white;">Skilltori.com</text>
                <circle cx="180" cy="30" r="8" fill="white" opacity="0.9"/>
                <path d="M175 30 L185 30 M180 25 L180 35" stroke="white" stroke-width="2" opacity="0.9"/>
              </svg>
            </div>
            <h1>🎓 Workshop Payment</h1>
            <h2>Payment Successful!</h2>
          </div>
          
          <div class="content">
            <p class="greeting">Dear <span class="highlight">${fullName}</span>,</p>
            
            <p class="message">
              Congratulations! Your payment for the <strong>${workshopTitle}</strong> workshop has been successfully processed. You are now officially enrolled and ready to participate in this exciting learning experience.
            </p>

            <p class="message">
              We're excited to have you join us for this workshop and can't wait to see you there!
            </p>
            
            <div style="text-align: center">
              <a href="https://skilltori.com/dashboard" class="cta-button" style="color: white;">
                🚀 Go to Dashboard
              </a>
            </div>
            
            <div class="details-card">
              <h3>📋 Workshop Details</h3>
              <ul class="details-list">
                <li>
                  <strong>Workshop:</strong>
                  <span style="margin-left: 10px;">${workshopTitle}</span>
                </li>
                <li>
                  <strong>Date:</strong>
                  <span style="margin-left: 10px;">${workshopDate}</span>
                </li>
                <li>
                  <strong>Time:</strong>
                  <span style="margin-left: 10px;">${workshopTime}</span>
                </li>
                <li>
                  <strong>Speaker:</strong>
                  <span style="margin-left: 10px;">${speakerName}</span>
                </li>
                <li>
                  <strong>Amount Paid:</strong>
                  <span style="margin-left: 10px;">৳${amount.toLocaleString('bn-BD')}</span>
                </li>
              </ul>
            </div>

            ${groupLink ? `
            <div style="text-align: center; margin: 24px 0;">
              <p class="message" style="margin-bottom: 16px;">
                Join our WhatsApp group to connect with other participants and get workshop updates!
              </p>
              <a href="${groupLink}" class="whatsapp-button" style="color: white;">
                📱 Join WhatsApp Group
              </a>
            </div>
            ` : ''}
            
            <div class="contact-info">
              <h3>📞 Contact Information</h3>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Phone:</span>
                <span class="contact-value">
                  <a href="tel:+8801842221872">+88 01842-221872</a>
                </span>
              </div>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Email:</span>
                <span class="contact-value">
                  <a href="mailto:info@skilltori.com">info@skilltori.com</a>
                </span>
              </div>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Address:</span>
                <span class="contact-value">Savar, Dhaka 1340, Bangladesh</span>
              </div>
            </div>
            
            <p class="message">
              If you have any questions about the workshop or need assistance, please don't hesitate to reach out to us. We're here to help make your learning experience as smooth as possible!
            </p>
            
            <p class="message">
              Best regards,<br>
              <strong>The Skilltori Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <div class="social-links">
              <a href="https://facebook.com/skilltori">Facebook</a>
              <a href="https://linkedin.com/company/skilltori">LinkedIn</a>
              <a href="https://youtube.com/@skilltori">YouTube</a>
            </div>
            
            <div class="legal-links">
              <a href="https://skilltori.com/terms">Terms of Service</a>
              <a href="https://skilltori.com/privacy-policy">Privacy Policy</a>
            </div>
            
            <p class="footer-text">
              © 2024 <strong>Skilltori</strong>. All rights reserved.<br>
              Empowering students with practical skills for the digital age.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Workshop Payment Confirmation - ${workshopTitle}

Dear ${fullName},

Congratulations! Your payment for the ${workshopTitle} workshop has been successfully processed. You are now officially enrolled and ready to participate in this exciting learning experience.

Workshop Details:
- Workshop: ${workshopTitle}
- Date: ${workshopDate}
- Time: ${workshopTime}
- Speaker: ${speakerName}
- Amount Paid: ৳${amount.toLocaleString('bn-BD')}

${groupLink ? `
WhatsApp Group: ${groupLink}
Join our WhatsApp group to connect with other participants and get workshop updates!
` : ''}

Need to reach us?
Phone: +88 01842-221872
Email: info@skilltori.com
Address: Savar, Dhaka 1340, Bangladesh

If you have any questions about the workshop or need assistance, please don't hesitate to reach out to us. We're here to help make your learning experience as smooth as possible!

Best regards,
The Skilltori Team

© 2024 Skilltori. All rights reserved.
Empowering students with practical skills for the digital age.
    `;

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }

  async sendCoursePaymentConfirmation(
    fullName: string,
    email: string,
    courseTitle: string,
    courseType: string,
    courseDuration: string,
    amount: number
  ): Promise<boolean> {
    const subject = `Course Payment Confirmation - ${courseTitle}`;
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Course Payment Confirmation</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f9fafb;
            padding: 20px;
          }
          
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            opacity: 0.3;
          }
          
          .logo-container {
            margin-bottom: 20px;
            text-align: center;
          }
          
          .logo {
            width: 140px;
            height: 42px;
            margin: 0 auto;
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
          }
          
          .header h2 {
            color: #ffffff;
            font-size: 18px;
            font-weight: 500;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .content {
            padding: 40px 30px;
            background-color: #ffffff;
          }
          
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 24px;
          }
          
          .highlight {
            color: #f59e0b;
            font-weight: 600;
          }
          
          .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 32px;
            line-height: 1.7;
          }
          
          .details-card {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .details-card h3 {
            color: #92400e;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .details-list {
            list-style: none;
            margin: 0;
            padding: 0;
          }
          
          .details-list li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(251, 191, 36, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .details-list li:last-child {
            border-bottom: none;
          }
          
          .details-list strong {
            color: #92400e;
            font-weight: 600;
          }
          
          .details-list span {
            color: #4b5563;
            font-weight: 500;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
          }
          
          .contact-info {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .contact-info h3 {
            color: #1f2937;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .contact-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            color: #4b5563;
            font-size: 14px;
          }
          
          .contact-item:last-child {
            margin-bottom: 0;
          }
          
          .contact-label {
            font-weight: 600;
            color: #1f2937;
            min-width: 60px;
          }
          
          .contact-value {
            color: #4b5563;
          }
          
          .contact-value a {
            color: #f59e0b;
            text-decoration: none;
            font-weight: 500;
          }
          
          .contact-value a:hover {
            text-decoration: underline;
          }
          
          .footer {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }
          
          .social-links {
            margin-bottom: 20px;
          }
          
          .social-links a {
            color: #fbbf24;
            text-decoration: none;
            margin: 0 15px;
            font-weight: 500;
            transition: color 0.3s ease;
          }
          
          .social-links a:hover {
            color: #ffffff;
          }
          
          .legal-links {
            margin-bottom: 20px;
          }
          
          .legal-links a {
            color: #9ca3af;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
            transition: color 0.3s ease;
          }
          
          .legal-links a:hover {
            color: #fbbf24;
          }
          
          .footer-text {
            font-size: 14px;
            color: #9ca3af;
            margin-top: 20px;
          }
          
          .footer-text strong {
            color: #fbbf24;
          }
          
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            
            .email-container {
              border-radius: 12px;
            }
            
            .header, .content, .footer {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .header h2 {
              font-size: 16px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo-container">
              <svg class="logo" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                <text x="10" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" style="text-align: center; font-size: 24px; font-weight: bold; font-color: white;">Skilltori.com</text>
                <circle cx="180" cy="30" r="8" fill="white" opacity="0.9"/>
                <path d="M175 30 L185 30 M180 25 L180 35" stroke="white" stroke-width="2" opacity="0.9"/>
              </svg>
            </div>
            <h1>📚 Course Payment</h1>
            <h2>Payment Successful!</h2>
          </div>
          
          <div class="content">
            <p class="greeting">Dear <span class="highlight">${fullName}</span>,</p>
            
            <p class="message">
              Congratulations! Your payment for the <strong>${courseTitle}</strong> course has been successfully processed. You are now officially enrolled and ready to start your learning journey!
            </p>

            <p class="message">
              We're excited to have you join us and can't wait to see you grow with our comprehensive course content.
            </p>
            
            <div style="text-align: center">
              <a href="https://skilltori.com/dashboard/my-courses" class="cta-button" style="color: white;">
                🚀 Start Learning
              </a>
            </div>
            
            <div class="details-card">
              <h3>📋 Course Details</h3>
              <ul class="details-list">
                <li>
                  <strong>Course:</strong>
                  <span style="margin-left: 10px;">${courseTitle}</span>
                </li>
                <li>
                  <strong>Type:</strong>
                  <span style="margin-left: 10px;">${courseType}</span>
                </li>
                <li>
                  <strong>Duration:</strong>
                  <span style="margin-left: 10px;">${courseDuration}</span>
                </li>
                <li>
                  <strong>Amount Paid:</strong>
                  <span style="margin-left: 10px;">৳${amount.toLocaleString('bn-BD')}</span>
                </li>
              </ul>
            </div>
            
            <div class="contact-info">
              <h3>📞 Contact Information</h3>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Phone:</span>
                <span class="contact-value">
                  <a href="tel:+8801842221872">+88 01842-221872</a>
                </span>
              </div>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Email:</span>
                <span class="contact-value">
                  <a href="mailto:info@skilltori.com">info@skilltori.com</a>
                </span>
              </div>
              <div class="contact-item">
                <span class="contact-label" style="margin-right: 10px;">Address:</span>
                <span class="contact-value">Savar, Dhaka 1340, Bangladesh</span>
              </div>
            </div>
            
            <p class="message">
              If you have any questions about the course or need assistance, please don't hesitate to reach out to us. We're here to help make your learning experience as smooth as possible!
            </p>
            
            <p class="message">
              Best regards,<br>
              <strong>The Skilltori Team</strong>
            </p>
          </div>
          
          <div class="footer">
            <div class="social-links">
              <a href="https://facebook.com/skilltori">Facebook</a>
              <a href="https://linkedin.com/company/skilltori">LinkedIn</a>
              <a href="https://youtube.com/@skilltori">YouTube</a>
            </div>
            
            <div class="legal-links">
              <a href="https://skilltori.com/terms">Terms of Service</a>
              <a href="https://skilltori.com/privacy-policy">Privacy Policy</a>
            </div>
            
            <p class="footer-text">
              © 2024 <strong>Skilltori</strong>. All rights reserved.<br>
              Empowering students with practical skills for the digital age.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Course Payment Confirmation - ${courseTitle}

Dear ${fullName},

Congratulations! Your payment for the ${courseTitle} course has been successfully processed. You are now officially enrolled and ready to start your learning journey!

Course Details:
- Course: ${courseTitle}
- Type: ${courseType}
- Duration: ${courseDuration}
- Amount Paid: ৳${amount.toLocaleString('bn-BD')}

Need to reach us?
Phone: +88 01842-221872
Email: info@skilltori.com
Address: Savar, Dhaka 1340, Bangladesh

If you have any questions about the course or need assistance, please don't hesitate to reach out to us. We're here to help make your learning experience as smooth as possible!

Best regards,
The Skilltori Team

© 2024 Skilltori. All rights reserved.
Empowering students with practical skills for the digital age.
    `;

    return await this.sendEmail({
      to: email,
      subject,
      html,
      text
    });
  }
}

// Create a singleton instance
const emailService = new EmailService();

export default emailService; 