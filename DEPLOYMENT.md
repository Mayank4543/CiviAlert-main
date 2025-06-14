# CiviAlert Deployment Checklist

This checklist will help you ensure that your CiviAlert application is properly secured and deployed to Vercel.

## Pre-Deployment Checklist

### Environment Variables Setup

- [ ] Create a `.env` file for local development with all required variables
- [ ] Create a `.env.example` file (without actual values) to document required environment variables
- [ ] Ensure `.env` is in `.gitignore` to prevent committing secrets

### Code Security

- [x] Remove all hardcoded Firebase credentials from source code
- [x] Remove all hardcoded EmailJS keys from source code
- [x] Create a modular config system to load environment variables
- [x] Set up fallbacks for development that display warnings

### Local Testing

- [ ] Test application with environment variables locally
- [ ] Verify Firebase authentication works
- [ ] Verify OTP functionality works
- [ ] Test all CRUD operations with secured configuration

## Vercel Deployment Steps

1. **Create Environment Variables on Vercel**

   - [ ] Add `FIREBASE_API_KEY`
   - [ ] Add `FIREBASE_AUTH_DOMAIN`
   - [ ] Add `FIREBASE_PROJECT_ID`
   - [ ] Add `FIREBASE_STORAGE_BUCKET`
   - [ ] Add `FIREBASE_MESSAGING_SENDER_ID`
   - [ ] Add `FIREBASE_APP_ID`
   - [ ] Add `FIREBASE_MEASUREMENT_ID`
   - [ ] Add `EMAILJS_PUBLIC_KEY`

2. **Deploy to Vercel**

   - [ ] Connect your GitHub repository to Vercel
   - [ ] Configure the build settings (or use vercel.json)
   - [ ] Deploy the application

3. **Post-Deployment Verification**
   - [ ] Verify environment variables are loaded correctly
   - [ ] Test user registration and login
   - [ ] Test OTP verification
   - [ ] Test incident reporting functionality
   - [ ] Test dashboard and reports views

## Firebase Security Setup

1. **Authentication**

   - [ ] Configure Firebase authentication providers
   - [ ] Set up email verification if needed
   - [ ] Configure multi-factor authentication for admin accounts

2. **Firestore Rules**

   - [ ] Implement proper security rules for all collections
   - [ ] Test security rules to ensure they work as expected
   - [ ] Set up rate limiting for sensitive operations

3. **Storage Rules**
   - [ ] Configure access controls for user-uploaded content
   - [ ] Set up size and file type limitations

## Production Considerations

1. **Performance**

   - [ ] Enable caching for static assets
   - [ ] Optimize image loading and processing
   - [ ] Implement pagination for large data sets

2. **Monitoring**

   - [ ] Set up Firebase Analytics for usage tracking
   - [ ] Configure error logging
   - [ ] Set up uptime monitoring

3. **Backups**
   - [ ] Configure regular Firestore backups
   - [ ] Document backup and restore procedures

## SMS Provider Integration

For production-ready OTP verification:

1. **Select an SMS Provider**

   - [ ] Twilio
   - [ ] MessageBird
   - [ ] AWS SNS
   - [ ] Other: ******\_******

2. **Integration**
   - [ ] Create serverless function for SMS sending
   - [ ] Update code to use the SMS provider's API
   - [ ] Test SMS delivery and verification flow
   - [ ] Implement retry mechanisms for failed SMS deliveries

## Additional Security Measures

- [ ] Implement CORS configuration
- [ ] Set up Content Security Policy (CSP)
- [ ] Configure HTTP security headers
- [ ] Implement rate limiting for API endpoints
- [ ] Set up monitoring for unusual activity
