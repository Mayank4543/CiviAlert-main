# CiviAlert - Civic Reporting Platform

CiviAlert is a web-based platform that enables citizens to report civic issues in their locality.

## Features

- User registration with phone number verification
- Secure authentication with Firebase
- Incident reporting with location data
- Interactive dashboard for monitoring reports
- Profile and account management

## Phone OTP Verification Implementation

The application uses phone-based OTP verification for user registration:

1. During registration, users provide their phone number with country code (e.g., +911234567890)
2. A 6-digit OTP is generated and stored in Firebase Firestore
3. The OTP is sent to the user's phone (simulated in the demo, would use Twilio or similar in production)
4. User enters the OTP to verify their phone number and activate their account

### Production Integration

To enable actual SMS sending in production:

1. Sign up for an SMS service like Twilio
2. Set up the required environment variables in your Vercel project:
   - `TWILIO_ACCOUNT_SID` - Your Twilio account SID
   - `TWILIO_AUTH_TOKEN` - Your Twilio auth token
   - `TWILIO_PHONE_NUMBER` - Your Twilio phone number (must be purchased in Twilio)
3. The project includes a serverless API function at `/api/send-sms.js` that handles SMS sending securely
4. The `sendPhoneOTP` function in `script.js` will automatically use this endpoint in production

### Twilio Setup Instructions

1. Create an account on [Twilio](https://www.twilio.com)
2. Navigate to the Twilio Console and find your Account SID and Auth Token
3. Purchase a phone number with SMS capabilities from Twilio
4. Add the Twilio credentials as environment variables in your Vercel project settings
5. Deploy your project to Vercel

### Security Considerations

- OTPs expire after 5 minutes
- Failed verification attempts are logged
- Phone numbers are masked when displayed
- Firestore security rules should be implemented to protect verification data

## File Structure

- `index.html` - Main application HTML
- `js/config.js` - Configuration for Firebase and other services
- `js/firebase.js` - Firebase initialization and service exports
- `js/script.js` - Core application logic
- `js/otp-functions.js` - OTP handling functions
- `js/password-strength.js` - Password validation
- `style/style.css` - Main application styles
- `style/password-validation.css` - Password validation styles
- `api/send-sms.js` - Serverless function to handle SMS sending via Twilio
- `.env` - Environment variables for local development
- `vercel.json` - Vercel deployment configuration

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_EMAILJS_PUBLIC_KEY=your_emailjs_key
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Deployment to Vercel

1. Install the Vercel CLI:

   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:

   ```bash
   vercel login
   ```

3. Add your environment variables to Vercel:

   **Option 1: Using the Vercel CLI**

   ```bash
   vercel secrets add firebase_api_key your-api-key-value
   vercel secrets add firebase_auth_domain your-auth-domain-value
   vercel secrets add firebase_project_id your-project-id-value
   vercel secrets add firebase_storage_bucket your-storage-bucket-value
   vercel secrets add firebase_messaging_sender_id your-messaging-sender-id-value
   vercel secrets add firebase_app_id your-app-id-value
   vercel secrets add firebase_measurement_id your-measurement-id-value
   vercel secrets add emailjs_public_key your-emailjs-key-value
   ```

   **Option 2: Using the Vercel Dashboard**

   - Go to your project on the Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add each of the environment variables listed above

4. Deploy to Vercel:

   ```bash
   vercel
   ```

5. To deploy to production:
   ```bash
   vercel --prod
   ```

## Environment Variables

The application uses the following environment variables:

| Variable                     | Description                  |
| ---------------------------- | ---------------------------- |
| FIREBASE_API_KEY             | Firebase API key             |
| FIREBASE_AUTH_DOMAIN         | Firebase auth domain         |
| FIREBASE_PROJECT_ID          | Firebase project ID          |
| FIREBASE_STORAGE_BUCKET      | Firebase storage bucket      |
| FIREBASE_MESSAGING_SENDER_ID | Firebase messaging sender ID |
| FIREBASE_APP_ID              | Firebase app ID              |
| FIREBASE_MEASUREMENT_ID      | Firebase measurement ID      |
| EMAILJS_PUBLIC_KEY           | EmailJS public key           |

## Security Notes

1. Never commit your `.env` file to version control
2. Use environment variables in Vercel for production deployment
3. Implement Firebase security rules to protect your data
4. Consider implementing rate limiting for OTP requests in production
5. Use HTTPS for all API requests

## License

MIT

## Testing

- For testing purposes, the OTP is shown in an alert during development
- Remove the alert in production when connecting to a real SMS service

## Deployment on Vercel

This project is configured for secure deployment on Vercel:

1. Fork or clone this repository to your GitHub account
2. Sign up for a Vercel account at https://vercel.com
3. Create a new project in Vercel and connect it to your GitHub repository
4. Configure the environment variables in Vercel project settings:

   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`
   - `EMAILJS_PUBLIC_KEY`

5. Deploy the project

### Environment Variables

The application uses environment variables for secure configuration. In development, create a `.env` file with the following variables:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
VITE_EMAILJS_PUBLIC_KEY=your-emailjs-key
```

On Vercel, these are configured in the project settings under Environment Variables.

### Security Considerations

- Never commit the `.env` file to your repository
- Use Vercel's environment variables for secure deployment
- Configure proper Firebase security rules for your Firestore database
- Implement rate limiting for OTP verification attempts
