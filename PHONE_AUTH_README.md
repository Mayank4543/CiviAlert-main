# CiviAlert - Phone OTP Implementation Guide

## Overview

This document provides instructions for deploying CiviAlert with production-ready phone number OTP authentication using Firebase Authentication.

## Prerequisites

- Firebase project on Blaze plan (required for SMS verification)
- Vercel account (for deployment)
- Firebase Authentication with Phone provider enabled

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Add your production domain to Firebase's "Authorized domains" list:

   - In your Firebase project, go to Authentication > Settings > Authorized domains
   - Add your Vercel deployment domain (e.g., `your-app.vercel.app`)

3. Remove all test phone numbers from Firebase Authentication settings:

   - Go to Authentication > Settings > Phone providers
   - Remove any test phone numbers in the "Phone numbers for testing" section

4. Make sure you're on the Blaze Plan:
   - Go to the left sidebar and click "Upgrade"
   - Choose the "Blaze" pay-as-you-go plan

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. During setup, set the following environment variables:

   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`
   - `NODE_ENV=production`

4. Deploy your application

## Local Development Testing

For local testing, you can still use the SMS verification by:

1. Running the app on a local server (e.g., `python -m http.server` or VSCode Live Server)
2. Adding `localhost` to the authorized domains in Firebase
3. Using a real phone number for testing

## Implementation Details

- Firebase Phone Authentication with `signInWithPhoneNumber`
- reCAPTCHA verification in "invisible" mode
- Production-ready error handling
- Auto-detection of development vs. production environments
- Mobile-responsive OTP input UI

## Troubleshooting

- If SMS is not being received:

  - Verify you're on the Blaze plan
  - Check if your Firebase project has billing enabled
  - Ensure the phone number format is correct (e.g., +1XXXXXXXXXX)
  - Check Firebase Authentication logs for errors

- If reCAPTCHA is not working:
  - Ensure your domain is added to authorized domains
  - Check browser console for reCAPTCHA errors
  - Try clearing browser cache

## Security Notes

- Phone authentication is handled entirely by Firebase, ensuring secure OTP delivery
- User data is stored in Firestore with proper security rules
- Session persistence is set to "SESSION" for improved security
- The implementation follows Firebase best practices

For more information, refer to the [Firebase Phone Auth documentation](https://firebase.google.com/docs/auth/web/phone-auth).
