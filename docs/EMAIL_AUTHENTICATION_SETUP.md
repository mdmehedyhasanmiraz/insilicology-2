# Email Authentication Setup Guide

## Problem
Gmail and other email providers are flagging password reset emails as dangerous/spam because they lack proper email authentication.

## Solution
Set up proper email authentication (SPF, DKIM, DMARC) to establish email reputation and prevent spam flags.

## 1. SPF Record Setup

Add this SPF record to your domain's DNS settings:

```
TXT record: v=spf1 include:stackmail.com ~all
```

### How to add SPF record:
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Navigate to DNS management
3. Add a new TXT record:
   - **Name**: @ (or your domain)
   - **Value**: `v=spf1 include:stackmail.com ~all`
   - **TTL**: 3600

## 2. DKIM Setup (Stackmail)

### Enable DKIM in Stackmail:
1. Log into your Stackmail account
2. Go to Domain Settings
3. Enable DKIM signing
4. Copy the DKIM public key

### Add DKIM record to DNS:
```
TXT record: v=DKIM1; k=rsa; p=YOUR_DKIM_PUBLIC_KEY_HERE
```

## 3. DMARC Policy

Add this DMARC record to your DNS:

```
TXT record: v=DMARC1; p=quarantine; rua=mailto:dmarc@skilltori.com; ruf=mailto:dmarc@skilltori.com; fo=1
```

### DMARC Record Breakdown:
- `p=quarantine`: Quarantine suspicious emails
- `rua=mailto:dmarc@skilltori.com`: Send aggregate reports
- `ruf=mailto:dmarc@skilltori.com`: Send forensic reports
- `fo=1`: Generate reports for all failures

## 4. Email Headers Optimization

The custom email template includes proper headers:

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>পাসওয়ার্ড রিসেট - Skilltori</title>
```

## 5. Professional Email Template Features

✅ **Professional Design**: Clean, branded template  
✅ **Bengali Language Support**: Proper UTF-8 encoding  
✅ **Security Warnings**: Clear security instructions  
✅ **Fallback Link**: Text version for accessibility  
✅ **Company Branding**: Skilltori logo and colors  
✅ **Contact Information**: Proper footer with links  

## 6. Email Content Best Practices

### Avoid Spam Triggers:
- ❌ "URGENT", "ACT NOW", "LIMITED TIME"
- ❌ Excessive exclamation marks (!!!)
- ❌ All caps text
- ❌ Suspicious links
- ❌ Poor grammar/spelling

### Use Professional Language:
- ✅ Clear, professional subject lines
- ✅ Proper grammar and spelling
- ✅ Legitimate business information
- ✅ Clear call-to-action buttons

## 7. Testing Email Deliverability

### Test with these tools:
1. **Mail Tester**: https://www.mail-tester.com/
2. **MXToolbox**: https://mxtoolbox.com/spamcheck.aspx
3. **Google Postmaster Tools**: https://postmaster.google.com/

### Test Steps:
1. Send test email to your Gmail
2. Check spam folder
3. Verify authentication records
4. Monitor delivery rates

## 8. Environment Variables

Ensure these are set in your `.env.local`:

```bash
# SMTP Configuration
SMTP_HOST=smtp.stackmail.com
SMTP_PORT=465
SMTP_USER=no-reply@skilltori.com
SMTP_PASS=your_secure_password

# Site URL for email links
NEXT_PUBLIC_SITE_URL=https://skilltori.com
```

## 9. Monitoring and Maintenance

### Regular Checks:
- Monitor email delivery rates
- Check DMARC reports
- Update DKIM keys if needed
- Monitor spam complaints

### Tools for Monitoring:
- Stackmail dashboard
- Google Postmaster Tools
- DMARC report analysis

## 10. Alternative Solutions

If Stackmail continues to have issues:

### Option 1: SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### Option 2: Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

### Option 3: AWS SES
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_username
SMTP_PASS=your_ses_password
```

## 11. Verification Steps

After setup, verify with:

```bash
# Check SPF record
dig TXT skilltori.com | grep spf

# Check DKIM record
dig TXT default._domainkey.skilltori.com

# Check DMARC record
dig TXT _dmarc.skilltori.com
```

## Expected Results

After proper setup:
- ✅ Emails land in inbox, not spam
- ✅ Professional appearance
- ✅ High deliverability rates
- ✅ Trusted sender reputation
- ✅ No security warnings

## Troubleshooting

### Still going to spam?
1. Check all DNS records are correct
2. Wait 24-48 hours for DNS propagation
3. Test with different email providers
4. Check email content for spam triggers
5. Consider using a different SMTP provider

### Common Issues:
- **SPF too strict**: Change `~all` to `-all` gradually
- **DKIM not working**: Verify key format and DNS record
- **DMARC too strict**: Start with `p=none` then increase
