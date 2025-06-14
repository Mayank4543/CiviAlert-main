# Deploying CiviAlert to Vercel with SMS OTP

This guide will help you deploy the CiviAlert application to Vercel with full SMS OTP functionality.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. A Twilio account (https://twilio.com)
3. A Firebase project

## Step 1: Set up Twilio

1. Create an account on [Twilio](https://www.twilio.com) if you haven't already
2. Navigate to the Twilio Console and find your Account SID and Auth Token
3. Purchase a phone number with SMS capabilities from Twilio

## Step 2: Deploy to Vercel

1. Push your CiviAlert codebase to a GitHub repository
2. Log in to your Vercel account
3. Click "Add New..." > "Project"
4. Import your GitHub repository
5. Configure your project settings:
   - **Framework Preset:** Other
   - **Root Directory:** ./
   - **Build Command:** Leave as default (since the project is static)
   - **Output Directory:** ./

## Step 3: Configure Environment Variables

In your Vercel project settings, go to "Environment Variables" and add the following:

```
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## Step 4: Deploy

1. Click "Deploy"
2. Wait for the deployment to complete
3. Once deployed, you can access your application via the provided Vercel URL

## Testing SMS OTP

After deployment:

1. Register a new user
2. Enter your phone number when prompted
3. The system will now send a real SMS with the OTP to your phone
4. Enter the OTP to verify your account

## Troubleshooting

If SMS OTP is not working:

1. Check the browser console for any error messages
2. Verify that your Twilio credentials are correct
3. Make sure the Twilio phone number has SMS capabilities
4. Check Vercel Function logs for any errors in the API endpoint

## Production Maintenance

- Monitor your Twilio usage to avoid unexpected charges
- Implement rate limiting to prevent abuse
- Consider setting up SMS delivery status notifications

For any questions or support, please refer to the [Twilio documentation](https://www.twilio.com/docs) or [Vercel documentation](https://vercel.com/docs).
