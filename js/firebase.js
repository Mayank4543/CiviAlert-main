// Import configuration from config.js
import config from "./config.js";

// Initialize Firebase
firebase.initializeApp(config.firebase);

// Export Firebase services
export const auth = firebase.auth();
export const db = firebase.firestore();

// Export Firebase instance
export default firebase;
