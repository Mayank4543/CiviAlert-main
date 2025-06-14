/**
 * Firebase Configuration for Production
 *
 * This file is used to initialize Firebase with the correct
 * configuration settings based on the environment.
 *
 * For production deployments, make sure to:
 * 1. Add your deployed domain to Firebase's "Authorized domains"
 * 2. Remove all test phone numbers from Firebase Authentication settings
 * 3. Upgrade to the Blaze Plan for real SMS OTPs
 */

// Check if we're in a production environment
const isProduction =
  window.location.hostname !== "localhost" &&
  !window.location.hostname.includes("127.0.0.1");

// Log environment information
console.log(`Running in ${isProduction ? "PRODUCTION" : "DEVELOPMENT"} mode`);
console.log(`Host: ${window.location.hostname}`);

// Firebase configuration - ideally this would be loaded from environment variables
// For this implementation, we're using direct values for simplicity
const firebaseConfig = {
  apiKey: "AIzaSyD3Y8YBwGVXpsWaNJgbNZHhyIzaW9W_Bdo",
  authDomain: "civialert-af464.firebaseapp.com",
  projectId: "civialert-af464",
  storageBucket: "civialert-af464.firebasestorage.app",
  messagingSenderId: "776751139563",
  appId: "1:776751139563:web:2f14aa67c2332f144f0cae",
  measurementId: "G-GXPVPKY0Q6",
};

// Initialize Firebase if not already initialized
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} else {
  console.log("Firebase already initialized");
}

// Export Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Force SMS for authentication in production
if (isProduction) {
  firebase.auth().settings.appVerificationDisabledForTesting = false;
  console.log("SMS verification enabled for production");
} else {
  // In development, you might want to enable this for testing
  // firebase.auth().settings.appVerificationDisabledForTesting = true;
  console.log("Using real SMS verification (recommended for testing)");
}

// Additional Firebase configuration
// Set persistence to SESSION to improve security in production
firebase
  .auth()
  .setPersistence(firebase.auth.Auth.Persistence.SESSION)
  .then(() => {
    console.log("Firebase auth persistence set to SESSION");
  })
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Initialize EmailJS if loaded
if (typeof emailjs !== "undefined") {
  emailjs.init({
    publicKey: "cMX_PTg2GiI0QFlKE",
  });
  console.log("EmailJS initialized");
}
