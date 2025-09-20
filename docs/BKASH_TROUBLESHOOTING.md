# bKash Integration Troubleshooting Guide

## 🚨 Current Issue: 403 Forbidden Error

### **Problem Summary**
- All bKash API calls return `403 Forbidden` with `{"message":"Forbidden"}`
- This happens for Grant Token, Create Payment, and Execute Payment APIs
- Both sandbox and production URLs fail with the same error

### **Root Cause Analysis**
The 403 Forbidden error indicates one of these issues:

1. **❌ Invalid Credentials** - Wrong API key, secret, username, or password
2. **❌ Account Not Activated** - bKash account pending approval
3. **❌ Wrong Environment** - Using production credentials with sandbox or vice versa
4. **❌ Account Suspended** - Account disabled by bKash
5. **❌ IP Restrictions** - Your server IP not whitelisted

### **Current Credential Analysis**
Based on diagnostic results:
- **API Key**: `v3Zg...` (26 chars) - Doesn't match typical bKash format
- **Username**: `0191...` (11 chars) - Looks like phone number
- **Password**: `O(BJ...` (11 chars) - Contains special characters

**Expected bKash Formats:**
- **Sandbox API Key**: Usually starts with `test_` or similar
- **Production API Key**: Usually starts with `prod_` or similar
- **Username**: Usually email format or specific username
- **Password**: Usually alphanumeric

## 🔧 **Immediate Solutions**

### **Solution 1: Contact bKash Support (URGENT)**
**Send this email to bKash support:**

```
Subject: 403 Forbidden Error - Need Fresh API Credentials

Hi bKash Support,

I'm getting 403 Forbidden errors when trying to access the bKash APIs.
All authentication methods are failing with {"message":"Forbidden"}.

Please help me:
1. Verify my current credentials are correct
2. Confirm my account is active and approved
3. Tell me which environment (sandbox/production) I should use
4. Provide fresh API credentials if needed

Current credential format:
- API Key: 26 characters (starts with v3Zg...)
- Username: 11 characters (starts with 0191...)
- Password: 11 characters (contains special characters)

Error occurs on both:
- https://tokenized.sandbox.bka.sh
- https://tokenized.pay.bka.sh

Thank you!
```

### **Solution 2: Use Mock Payment System (Temporary)**
I've created a complete mock payment system for development:

**Mock Endpoints:**
- `/api/bkash/mock-create` - Creates mock payments
- `/api/bkash/mock-callback` - Handles mock callbacks

**Features:**
- Simulates entire payment flow
- Creates real database records
- Auto-enrolls users in courses
- Handles success/failure/cancel scenarios

**To use mock payments:**
1. Change frontend to call `/api/bkash/mock-create` instead of `/api/bkash/create`
2. Test the complete payment flow
3. Switch back to real bKash when credentials are fixed

### **Solution 3: Environment Variable Switch**
Add to your `.env.local`:
```env
USE_MOCK_PAYMENTS=true
```

Then modify your frontend:
```javascript
const endpoint = process.env.NEXT_PUBLIC_USE_MOCK_PAYMENTS === 'true' 
  ? '/api/bkash/mock-create' 
  : '/api/bkash/create';

const response = await fetch(endpoint, {
  // ... your code
});
```

## 📋 **Testing Steps**

### **Step 1: Test Grant Token**
```bash
# Test the grant token flow
curl http://localhost:3000/api/bkash/test-token
```

### **Step 2: Test Mock Payment**
```bash
# Test mock payment creation
curl -X POST http://localhost:3000/api/bkash/mock-create \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","course_id":"test","amount":1000}'
```

### **Step 3: Test Diagnostic Tool**
```bash
# Get detailed diagnostic information
curl http://localhost:3000/api/bkash/diagnose
```

## 🔍 **Debugging Tools**

### **1. Diagnostic Endpoint**
Visit: `http://localhost:3000/api/bkash/diagnose`
- Tests multiple authentication methods
- Provides detailed error information
- Shows credential format analysis

### **2. Configuration Check**
Visit: `http://localhost:3000/api/bkash/check-config`
- Verifies all environment variables are set
- Shows credential previews

### **3. Token Test**
Visit: `http://localhost:3000/api/bkash/test-token`
- Tests the grant token flow specifically
- Provides detailed token information

## 📞 **Contact Information**

### **bKash Support**
- **Email**: [Find bKash support email from their website]
- **Phone**: [Find bKash support phone from their website]
- **Documentation**: [bKash API documentation URL]

### **What to Ask bKash:**
1. Are my credentials correct?
2. Is my account active and approved?
3. Which environment should I use (sandbox/production)?
4. Are there any IP restrictions?
5. Can you provide fresh API credentials?

## 🚀 **Next Steps**

### **Immediate (Today):**
1. ✅ Contact bKash support
2. ✅ Use mock payment system for development
3. ✅ Test payment flow with mock system

### **When bKash Responds:**
1. Update `.env.local` with new credentials
2. Test with diagnostic tool
3. Switch back to real bKash endpoints
4. Remove mock payment code

### **Long-term:**
1. Implement proper error handling
2. Add payment retry logic
3. Implement webhook verification
4. Add payment status monitoring

## 📝 **Notes**

- The mock payment system allows you to continue development
- All database operations work normally with mock payments
- Users will be enrolled in courses after "payment"
- Switch back to real bKash when credentials are fixed

## 🔗 **Useful Links**

- [bKash API Documentation](https://developer.bkash.com)
- [bKash Support](https://www.bkash.com/support)
- [bKash Developer Portal](https://developer.bkash.com)

---

**Remember**: The 403 error is a credential/account issue, not a code issue. Contact bKash support to resolve this. 