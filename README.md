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

1. Sign up for an SMS service like Twilio, MessageBird, or AWS SNS
2. Uncomment and configure the SMS sending code in `sendPhoneOTP` function in `script.js`
3. Deploy a serverless function or API endpoint to handle SMS sending securely
4. Update the fetch URL in the code to point to your API endpoint

### Security Considerations

- OTPs expire after 5 minutes
- Failed verification attempts are logged
- Phone numbers are masked when displayed
- Firestore security rules should be implemented to protect verification data

## File Structure

- `index.html` - Main application HTML
- `js/script.js` - Core application logic
- `js/otp-functions.js` - OTP handling functions
- `js/password-strength.js` - Password validation
- `style/style.css` - Main application styles
- `style/password-validation.css` - Password validation styles

## Development

1. Clone the repository
2. Configure Firebase with your own Firebase project settings
3. Open `index.html` in a web browser or use a local server

## Testing

- For testing purposes, the OTP is shown in an alert during development
- Remove the alert in production when connecting to a real SMS service
