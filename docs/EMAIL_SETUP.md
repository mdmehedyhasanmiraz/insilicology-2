# Email Setup Guide

## Overview

This project uses Nodemailer with SMTP for sending transactional emails. The email system is configured to send confirmation emails for job applications and campus ambassador applications.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# SMTP Configuration
SMTP_HOST=smtp.stackmail.com
SMTP_PORT=465
SMTP_USER=no-reply@skilltori.com
SMTP_PASS=your_smtp_password_here
```

## Email Types

### 1. Job Application Confirmation
- **Trigger**: When a user submits a job application
- **Recipient**: Job applicant
- **Content**: Confirmation of application receipt, job details, next steps
- **Template**: Professional HTML email with Skilltori branding

### 2. Campus Ambassador Confirmation
- **Trigger**: When a user submits a campus ambassador application
- **Recipient**: Campus ambassador applicant
- **Content**: Confirmation of application receipt, university details, next steps
- **Template**: Professional HTML email with Skilltori branding

## Email Service Features

### Rate Limiting
- Emails are rate-limited to prevent spam
- Minimum 60-second interval between emails
- Automatic fallback mode if SMTP fails

### Fallback Mode
- If SMTP connection fails, emails are logged instead of sent
- Prevents application failures due to email issues
- Logs include recipient, subject, and content

### Error Handling
- Graceful handling of SMTP errors
- Detailed error logging
- Non-blocking email failures (application submission continues)

## Testing

### Test Email Endpoint
You can test the email system using the test endpoint:

```bash
# Test SMTP connection
curl -X POST http://localhost:3000/api/test-smtp

# Test email sending
curl -X POST http://localhost:3000/api/test-email
```

### Manual Testing
1. Submit a job application
2. Check console logs for email sending status
3. Verify email is received by the applicant
4. Check fallback mode if SMTP fails

## Adding New Email Types

To add a new email type:

1. **Add method to EmailService class** in `utils/emailService.ts`:
```typescript
async sendNewEmailType(
  param1: string,
  param2: string
): Promise<boolean> {
  const subject = 'Your Email Subject';
  const html = `Your HTML template`;
  const text = `Your plain text version`;
  
  return await this.sendEmail({
    to: email,
    subject,
    html,
    text
  });
}
```

2. **Call the email method** in your server action:
```typescript
try {
  await emailService.sendNewEmailType(param1, param2);
  console.log('Email sent successfully');
} catch (emailError) {
  console.error('Failed to send email:', emailError);
  // Don't throw error - don't fail the main operation
}
```

## SMTP Providers

### Recommended Providers
- **Stackmail**: Currently configured
- **SendGrid**: Popular choice for transactional emails
- **Mailgun**: Good for high-volume sending
- **AWS SES**: Cost-effective for high volume

### Configuration Examples

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

#### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

## Troubleshooting

### Common Issues

1. **SMTP Connection Failed**
   - Check SMTP credentials
   - Verify port and security settings
   - Check firewall/network restrictions

2. **Emails Not Sending**
   - Check console logs for errors
   - Verify fallback mode status
   - Check rate limiting

3. **Emails Going to Spam**
   - Configure SPF/DKIM records
   - Use reputable SMTP provider
   - Avoid spam trigger words

### Debug Mode
Enable debug logging by adding to your environment:
```bash
DEBUG=nodemailer:*
```

## Security Considerations

1. **Never commit SMTP credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** to prevent abuse
4. **Validate email addresses** before sending
5. **Use HTTPS** for SMTP connections

## Monitoring

### Logs to Monitor
- Email sending success/failure
- SMTP connection status
- Rate limiting events
- Fallback mode activations

### Metrics to Track
- Email delivery rate
- Bounce rate
- Open rate (if using tracking)
- Response time

## Future Enhancements

1. **Email Templates**: Move to external template system
2. **Email Queue**: Implement queue for high-volume sending
3. **Email Tracking**: Add open/click tracking
4. **A/B Testing**: Test different email templates
5. **Analytics**: Track email performance metrics 