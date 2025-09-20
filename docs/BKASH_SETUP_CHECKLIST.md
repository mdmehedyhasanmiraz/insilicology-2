# bKash Integration Setup Checklist

## 🎯 **Overview**
This checklist covers the complete setup process for integrating bKash payment gateway into the Skilltori platform. The integration includes token management, payment processing, callback handling, and performance optimization.

## 📋 **Pre-Setup Requirements**

### **1. bKash Account Setup**
- [ ] **Register for bKash Merchant Account**
  - Visit [bKash Developer Portal](https://developer.bkash.com)
  - Complete merchant registration process
  - Wait for account approval (1-3 business days)

- [ ] **Get API Credentials**
  - Request API access from bKash support
  - Receive the following credentials:
    - API Key (usually starts with `test_` for sandbox, `prod_` for production)
    - API Secret
    - Username (usually email format)
    - Password
    - Merchant ID (if required)

- [ ] **Environment Selection**
  - [ ] Sandbox environment for testing
  - [ ] Production environment for live payments
  - [ ] Confirm which environment URLs to use

### **2. Technical Prerequisites**
- [ ] **Node.js Environment**
  - Node.js 18+ installed
  - npm or yarn package manager
  - TypeScript support

- [ ] **Database Setup**
  - Supabase project configured
  - Database access credentials
  - RLS (Row Level Security) policies configured

- [ ] **Domain & SSL**
  - Production domain with SSL certificate
  - Callback URL configured
  - Webhook endpoints accessible

## 🔧 **Environment Configuration**

### **3. Environment Variables Setup**
Add the following variables to your `.env.local` file:

```env
# bKash API Configuration
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh  # Sandbox
# BKASH_BASE_URL=https://tokenized.pay.bka.sh   # Production

BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret

# bKash API Endpoints
BKASH_GRANT_TOKEN_URL=https://tokenized.sandbox.bka.sh/tokenized/checkout/token/grant
BKASH_CREATE_PAYMENT_URL=https://tokenized.sandbox.bka.sh/tokenized/checkout/create
BKASH_EXECUTE_PAYMENT_URL=https://tokenized.sandbox.bka.sh/tokenized/checkout/execute

# Cron Job Secret (for automated token refresh)
CRON_SECRET=your_secure_random_string

# Optional: Mock Payment Mode (for development)
USE_MOCK_PAYMENTS=false
```

### **4. Database Schema Setup**
- [ ] **Run bKash Table Migration**
  ```bash
  # Execute the SQL file in your Supabase dashboard
  # File: database/bkash_table.sql
  ```

- [ ] **Verify Table Creation**
  - Check `bkash` table exists
  - Verify indexes are created
  - Confirm initial record is inserted

### **5. Required Dependencies**
- [ ] **Install Required Packages**
  ```bash
  npm install axios uuid
  npm install --save-dev @types/uuid
  ```

## 🚀 **API Endpoints Setup**

### **6. Core Payment Endpoints**
- [ ] **Payment Creation** (`/api/bkash/make-payment`)
  - [ ] File exists: `app/api/bkash/make-payment/route.ts`
  - [ ] Validates user and course
  - [ ] Creates payment record
  - [ ] Calls bKash create payment API
  - [ ] Returns payment URL and ID

- [ ] **Payment Callback** (`/api/bkash/callback`)
  - [ ] File exists: `app/api/bkash/callback/route.ts`
  - [ ] Handles bKash payment notifications
  - [ ] Updates payment status
  - [ ] Enrolls user in course on success

- [ ] **Payment Execution** (internal)
  - [ ] Executes payment with bKash
  - [ ] Handles payment verification
  - [ ] Updates payment record

### **7. Token Management Endpoints**
- [ ] **Token Refresh** (`/api/bkash/refresh-token`)
  - [ ] File exists: `app/api/bkash/refresh-token/route.ts`
  - [ ] Refreshes token in background
  - [ ] Non-blocking operation

- [ ] **Token Testing** (`/api/bkash/test-token`)
  - [ ] File exists: `app/api/bkash/test-token/route.ts`
  - [ ] Tests token generation
  - [ ] Provides diagnostic information

### **8. Monitoring & Debugging Endpoints**
- [ ] **Performance Monitoring** (`/api/bkash/performance`)
  - [ ] File exists: `app/api/bkash/performance/route.ts`
  - [ ] Tracks response times
  - [ ] Monitors token performance

- [ ] **Payment Record Testing** (`/api/bkash/test-payment-record`)
  - [ ] File exists: `app/api/bkash/test-payment-record/route.ts`
  - [ ] Tests payment record creation
  - [ ] Validates database operations

### **9. Cron Job Setup**
- [ ] **Automated Token Refresh** (`/api/cron/refresh-bkash-token`)
  - [ ] File exists: `app/api/cron/refresh-bkash-token/route.ts`
  - [ ] Protected with secret
  - [ ] Refreshes token every 45 minutes

## 🔄 **Token Management System**

### **10. Token Caching Implementation**
- [ ] **In-Memory Cache**
  - [ ] Token stored in memory for fastest access
  - [ ] 55-minute expiry with 5-minute buffer
  - [ ] Automatic fallback to database

- [ ] **Database Cache**
  - [ ] Token stored in `bkash` table
  - [ ] Updated timestamp tracking
  - [ ] Automatic cleanup of expired tokens

- [ ] **Background Refresh**
  - [ ] Cron job setup for automated refresh
  - [ ] Manual refresh endpoint available
  - [ ] Non-blocking token updates

### **11. Token Optimization**
- [ ] **Performance Improvements**
  - [ ] In-memory cache reduces response time by ~500ms
  - [ ] Parallel database operations save ~300ms
  - [ ] HTTP timeouts prevent hanging requests
  - [ ] Total payment time: 2-3 seconds (70% improvement)

## 🧪 **Testing & Validation**

### **12. Sandbox Testing**
- [ ] **Token Generation Test**
  ```bash
  curl http://localhost:3000/api/bkash/test-token
  ```
  - [ ] Returns valid token
  - [ ] No authentication errors
  - [ ] Token cached successfully

- [ ] **Payment Creation Test**
  ```bash
  curl -X POST http://localhost:3000/api/bkash/make-payment \
    -H "Content-Type: application/json" \
    -d '{"user_id":"test","course_id":"test","amount":1000,"email":"test@example.com","name":"Test User"}'
  ```
  - [ ] Creates payment record
  - [ ] Returns bKash payment URL
  - [ ] No validation errors

- [ ] **Callback Testing**
  - [ ] Test successful payment callback
  - [ ] Test failed payment callback
  - [ ] Test cancelled payment callback
  - [ ] Verify user enrollment on success

### **13. Error Handling Tests**
- [ ] **Invalid Credentials**
  - [ ] Test with wrong API key
  - [ ] Test with wrong username/password
  - [ ] Verify proper error messages

- [ ] **Network Issues**
  - [ ] Test timeout scenarios
  - [ ] Test connection failures
  - [ ] Verify retry mechanisms

- [ ] **Invalid Data**
  - [ ] Test with missing required fields
  - [ ] Test with invalid amounts
  - [ ] Test with non-existent user/course

### **14. Performance Testing**
- [ ] **Response Time Validation**
  ```bash
  curl http://localhost:3000/api/bkash/performance
  ```
  - [ ] Token retrieval under 100ms (cached)
  - [ ] Payment creation under 3 seconds
  - [ ] Database operations under 500ms

- [ ] **Load Testing**
  - [ ] Test multiple concurrent payments
  - [ ] Verify token cache effectiveness
  - [ ] Check database performance under load

## 🔒 **Security & Production Setup**

### **15. Security Measures**
- [ ] **Environment Variables**
  - [ ] All credentials in environment variables
  - [ ] No hardcoded secrets
  - [ ] Production secrets properly secured

- [ ] **Input Validation**
  - [ ] All user inputs validated
  - [ ] SQL injection prevention
  - [ ] XSS protection

- [ ] **Error Handling**
  - [ ] No sensitive data in error messages
  - [ ] Proper logging without exposing secrets
  - [ ] Graceful failure handling

### **16. Production Deployment**
- [ ] **Environment Switch**
  - [ ] Update `BKASH_BASE_URL` to production
  - [ ] Update all API endpoints to production URLs
  - [ ] Verify production credentials

- [ ] **SSL Certificate**
  - [ ] HTTPS enabled for all endpoints
  - [ ] Valid SSL certificate installed
  - [ ] Callback URLs use HTTPS

- [ ] **Domain Configuration**
  - [ ] Production domain configured
  - [ ] Callback URLs updated
  - [ ] CORS settings configured

### **17. Monitoring Setup**
- [ ] **Cron Job Configuration**
  ```bash
  # Add to server crontab
  */45 * * * * curl "https://yourdomain.com/api/cron/refresh-bkash-token?secret=your_secret"
  ```
  - [ ] Automated token refresh every 45 minutes
  - [ ] Secret protection enabled
  - [ ] Error logging configured

- [ ] **Performance Monitoring**
  - [ ] Response time tracking
  - [ ] Error rate monitoring
  - [ ] Payment success rate tracking

- [ ] **Logging Setup**
  - [ ] Payment attempt logging
  - [ ] Error logging
  - [ ] Performance metrics logging

## 📱 **Frontend Integration**

### **18. Payment UI Components**
- [ ] **BkashButton Component**
  - [ ] File exists: `components/ui/BkashButton.tsx`
  - [ ] Handles payment initiation
  - [ ] Shows loading states
  - [ ] Handles errors gracefully

- [ ] **Payment Forms**
  - [ ] EnrollForm component updated
  - [ ] Payment amount validation
  - [ ] User information collection

### **19. Payment Flow Integration**
- [ ] **Course Enrollment Pages**
  - [ ] Live course enrollment: `app/(public)/courses/live/[slug]/page.tsx`
  - [ ] Recorded course enrollment: `app/(public)/courses/recorded/[slug]/page.tsx`
  - [ ] Payment integration in both flows

- [ ] **Payment Processing**
  - [ ] Payment initiation from frontend
  - [ ] Redirect to bKash payment page
  - [ ] Callback handling and user enrollment

### **20. User Experience**
- [ ] **Loading States**
  - [ ] Payment button loading state
  - [ ] Payment processing indicators
  - [ ] Success/failure messages

- [ ] **Error Handling**
  - [ ] User-friendly error messages
  - [ ] Retry mechanisms
  - [ ] Fallback options

## 🔍 **Troubleshooting & Maintenance**

### **21. Common Issues & Solutions**
- [ ] **403 Forbidden Errors**
  - [ ] Verify credentials are correct
  - [ ] Check account activation status
  - [ ] Confirm environment (sandbox/production)
  - [ ] Contact bKash support if needed

- [ ] **Token Expiry Issues**
  - [ ] Check cron job is running
  - [ ] Verify token refresh endpoint
  - [ ] Monitor token cache status

- [ ] **Payment Failures**
  - [ ] Check payment validation
  - [ ] Verify callback URL configuration
  - [ ] Monitor payment status updates

### **22. Maintenance Tasks**
- [ ] **Regular Monitoring**
  - [ ] Check payment success rates
  - [ ] Monitor response times
  - [ ] Review error logs

- [ ] **Token Management**
  - [ ] Verify cron job execution
  - [ ] Check token cache effectiveness
  - [ ] Monitor token refresh success

- [ ] **Database Maintenance**
  - [ ] Clean up old payment records
  - [ ] Monitor database performance
  - [ ] Check index effectiveness

## 📚 **Documentation & Support**

### **23. Documentation**
- [ ] **API Documentation**
  - [ ] Endpoint documentation
  - [ ] Request/response examples
  - [ ] Error code explanations

- [ ] **Integration Guide**
  - [ ] Setup instructions
  - [ ] Configuration details
  - [ ] Troubleshooting guide

### **24. Support Resources**
- [ ] **bKash Support**
  - [ ] bKash developer documentation
  - [ ] Support contact information
  - [ ] API status monitoring

- [ ] **Internal Resources**
  - [ ] Performance optimization guide
  - [ ] Troubleshooting documentation
  - [ ] Maintenance procedures

## ✅ **Final Verification**

### **25. Complete Integration Test**
- [ ] **End-to-End Payment Flow**
  1. User selects course
  2. User fills enrollment form
  3. User clicks payment button
  4. Payment created successfully
  5. User redirected to bKash
  6. Payment completed on bKash
  7. Callback received and processed
  8. User enrolled in course
  9. Success page displayed

- [ ] **Error Scenarios**
  - [ ] Payment cancellation
  - [ ] Payment failure
  - [ ] Network errors
  - [ ] Invalid data

- [ ] **Performance Validation**
  - [ ] Payment creation under 3 seconds
  - [ ] Token retrieval under 100ms (cached)
  - [ ] Database operations under 500ms
  - [ ] Overall user experience smooth

### **26. Production Readiness**
- [ ] **Security Review**
  - [ ] All credentials secured
  - [ ] Input validation complete
  - [ ] Error handling secure

- [ ] **Performance Review**
  - [ ] Response times acceptable
  - [ ] Caching working effectively
  - [ ] Database optimized

- [ ] **Monitoring Active**
  - [ ] Cron jobs running
  - [ ] Performance tracking active
  - [ ] Error logging configured

---

## 🎉 **Setup Complete!**

Once all items above are checked, your bKash integration is ready for production use. Remember to:

1. **Monitor performance** regularly
2. **Keep credentials secure** and rotate if needed
3. **Update documentation** as the system evolves
4. **Test thoroughly** before any changes
5. **Have a rollback plan** for emergencies

For ongoing support, refer to:
- [Performance Optimization Guide](BKASH_PERFORMANCE_OPTIMIZATION.md)
- [Troubleshooting Guide](BKASH_TROUBLESHOOTING.md)
- [bKash Developer Documentation](https://developer.bkash.com) 