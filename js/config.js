/**
 * Configuration file for CiviAlert application
 * This file centralizes all configuration and loads values from environment variables
 * when deployed on Vercel or other cloud platforms.
 */

// Helper function to get environment variables
function getEnv(key, defaultValue = null) {
  // For Vercel environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  
  // For Vite or other bundlers that expose env variables via import.meta
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  
  return defaultValue;
}

// Firebase configuration
export const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY') || getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN') || getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID') || getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET') || getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID') || getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID') || getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getEnv('FIREBASE_MEASUREMENT_ID') || getEnv('VITE_FIREBASE_MEASUREMENT_ID')
};

// EmailJS configuration
export const emailJSConfig = {
  publicKey: getEnv('EMAILJS_PUBLIC_KEY') || getEnv('VITE_EMAILJS_PUBLIC_KEY')
};

// Fallback configuration for development (DO NOT USE IN PRODUCTION)
// These will only be used if environment variables are not available
const fallbackConfig = {
  firebase: {
    apiKey: "AIzaSyD3Y8YBwGVXpsWaNJgbNZHhyIzaW9W_Bdo",
    authDomain: "civialert-af464.firebaseapp.com",
    projectId: "civialert-af464",
    storageBucket: "civialert-af464.appspot.com",
    messagingSenderId: "776751139563",
    appId: "1:776751139563:web:2f14aa67c2332f144f0cae",
    measurementId: "G-GXPVPKY0Q6"
  },
  emailJS: {
    publicKey: "cMX_PTg2GiI0QFlKE"
  }
};

// Use fallback config if environment variables are not set
if (!firebaseConfig.apiKey) {
  console.warn("Environment variables not found. Using fallback configuration. This is not secure for production!");
  Object.assign(firebaseConfig, fallbackConfig.firebase);
}

if (!emailJSConfig.publicKey) {
  console.warn("EmailJS environment variables not found. Using fallback configuration.");
  Object.assign(emailJSConfig, fallbackConfig.emailJS);
}

export default {
  firebase: firebaseConfig,
  emailJS: emailJSConfig
};
