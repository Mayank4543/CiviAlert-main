// Serverless function for sending SMS via Twilio
// This file should be placed in the /api directory for Vercel to detect it as a serverless function

const twilio = require("twilio");

module.exports = async (req, res) => {
  // Set CORS headers to allow requests from your Vercel-hosted domain
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST requests for sending SMS
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  // Get the request data
  const { to, message, name } = req.body;

  // Validate request data
  if (!to || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing required parameters: to and message are required",
    });
  }

  try {
    // Initialize Twilio client with environment variables
    // These should be set in your Vercel project settings
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    // Check if Twilio credentials are configured
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error("Twilio credentials not properly configured");
      return res.status(500).json({
        success: false,
        error: "SMS service not properly configured",
      });
    }

    // Create Twilio client
    const client = twilio(accountSid, authToken);

    // Send the SMS
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to,
    });

    console.log(`SMS sent successfully to ${to}, SID: ${result.sid}`);

    // Return success response
    return res.status(200).json({
      success: true,
      messageId: result.sid,
    });
  } catch (error) {
    console.error("Error sending SMS:", error);

    // Return error response with appropriate status code
    return res.status(500).json({
      success: false,
      error: "Failed to send SMS",
      details: error.message,
    });
  }
};
