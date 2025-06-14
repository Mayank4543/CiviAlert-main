// Firebase Phone Authentication Module
// Production-ready implementation of phone number verification

let phoneAuthRecaptchaVerifier = null;
let phoneAuthConfirmationResult = null;

// Initialize recaptcha verifier in invisible mode
function initializePhoneAuth() {
  // Only initialize once
  if (phoneAuthRecaptchaVerifier) return;

  try {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Initializing Firebase Phone Auth`);

    // Create the reCAPTCHA verifier in invisible mode
    phoneAuthRecaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log(`[${timestamp}] reCAPTCHA verified successfully`);
        },
        "expired-callback": () => {
          // Reset the reCAPTCHA
          console.log(`[${timestamp}] reCAPTCHA expired, resetting`);
          resetPhoneAuthRecaptcha();
        },
      }
    );

    // Force render to invisibly trigger the recaptcha
    phoneAuthRecaptchaVerifier.render().then((widgetId) => {
      window.recaptchaWidgetId = widgetId;
      console.log(`[${timestamp}] reCAPTCHA rendered with ID: ${widgetId}`);
    });

    console.log(`[${timestamp}] Phone Auth initialized successfully`);
  } catch (error) {
    console.error(`Error initializing Firebase Phone Auth: ${error.message}`);
    showPhoneAuthError(
      `Failed to initialize phone verification: ${error.message}`
    );
  }
}

// Send OTP to phone number using Firebase
async function sendPhoneOTP(phone, name) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Sending OTP to phone: ${phone}`);

  try {
    // Initialize RecaptchaVerifier if not already initialized
    if (!phoneAuthRecaptchaVerifier) {
      initializePhoneAuth();
    }

    // Reset any previous confirmation result
    phoneAuthConfirmationResult = null;

    // Hide any previous error messages
    hidePhoneAuthError();

    // Start the phone verification process
    console.log(`[${timestamp}] Starting phone verification for: ${phone}`);

    // Set timer data
    const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    currentOTPData.phone = phone;
    currentOTPData.expiryTime = expiryTime;

    // Call Firebase signInWithPhoneNumber
    phoneAuthConfirmationResult = await firebase.auth.signInWithPhoneNumber(
      phone,
      phoneAuthRecaptchaVerifier
    );

    console.log(`[${timestamp}] Phone verification code sent successfully`);

    // Store confirmation result in userData
    if (currentOTPData && currentOTPData.userData) {
      currentOTPData.userData.verificationId =
        phoneAuthConfirmationResult.verificationId;
    }

    // Reset OTP inputs for new entry
    clearOTPInputs();

    // Reset OTP timer
    setupOTPTimer();

    // Reset resend timer
    setupResendTimer();

    // Alert success for development/testing purposes only
    // In production, this alert can be removed
    alert(`Verification code sent to ${maskPhoneNumber(phone)}`);

    return true;
  } catch (error) {
    console.error(`[${timestamp}] Error sending phone OTP:`, error);

    // Handle common error cases
    let errorMessage = "Failed to send verification code. ";

    switch (error.code) {
      case "auth/invalid-phone-number":
        errorMessage +=
          "Please enter a valid phone number with country code (e.g., +91XXXXXXXXXX).";
        break;
      case "auth/missing-phone-number":
        errorMessage += "Phone number is required.";
        break;
      case "auth/quota-exceeded":
        errorMessage +=
          "Too many verification attempts. Please try again later.";
        break;
      case "auth/captcha-check-failed":
        errorMessage +=
          "reCAPTCHA verification failed. Please refresh and try again.";
        // Reset the reCAPTCHA
        resetPhoneAuthRecaptcha();
        break;
      case "auth/too-many-requests":
        errorMessage +=
          "Too many requests from this device. Please try again later.";
        break;
      default:
        errorMessage += error.message || "Please try again later.";
    }

    // Show error message to user
    showPhoneAuthError(errorMessage);

    // For development/testing, also alert the error
    alert(errorMessage);

    return false;
  }
}

// Verify OTP using Firebase confirmationResult
async function verifyOTP() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Verify OTP button clicked`);

  // Check if confirmation result exists
  if (!phoneAuthConfirmationResult) {
    console.error(
      `[${timestamp}] No confirmation result found for verification`
    );
    showPhoneAuthError(
      "Verification session expired. Please request a new code."
    );
    return;
  }

  // Hide any previous error messages
  hidePhoneAuthError();

  // Get OTP from input fields
  const inputs = document.querySelectorAll(".otp-digit");
  if (!inputs || inputs.length === 0) {
    console.error(`[${timestamp}] OTP input fields not found`);
    showPhoneAuthError(
      "There was a problem with the verification form. Please try again."
    );
    return;
  }

  const enteredOTP = Array.from(inputs)
    .map((input) => input.value)
    .join("");

  if (enteredOTP.length !== 6) {
    console.warn(
      `[${timestamp}] Incomplete OTP entered: ${enteredOTP.length} digits`
    );
    showPhoneAuthError("Please enter the complete 6-digit verification code.");
    return;
  }

  // Show loading state
  const verifyBtn = document.getElementById("verifyOtpBtn");
  if (!verifyBtn) {
    console.error(`[${timestamp}] Verify button not found in DOM`);
    showPhoneAuthError(
      "There was a problem with the verification form. Please refresh the page and try again."
    );
    return;
  }

  let btnText, btnLoading;

  // Properly handle button state change
  try {
    if (verifyBtn.querySelector(".btn-text")) {
      btnText = verifyBtn.querySelector(".btn-text");
      btnLoading = verifyBtn.querySelector(".btn-loading");

      if (btnText && btnLoading) {
        btnText.classList.add("hidden");
        btnLoading.classList.remove("hidden");
      }
    } else {
      // Simple fallback if button doesn't have text/loading elements
      verifyBtn.textContent = "Verifying...";
    }

    verifyBtn.disabled = true;
  } catch (btnError) {
    console.error(`[${timestamp}] Error updating button state:`, btnError);
    // Continue with verification even if button state update fails
  }

  try {
    console.log(`[${timestamp}] Confirming OTP: ${enteredOTP}`);

    // Verify the OTP
    const userCredential = await phoneAuthConfirmationResult.confirm(
      enteredOTP
    );

    // User signed in successfully
    const user = userCredential.user;
    console.log(
      `[${timestamp}] Phone number verified successfully. User UID:`,
      user.uid
    );

    // Get current user data if available
    let userData = currentOTPData.userData || {};

    // Update user data in Firestore with verified status
    try {
      await db
        .collection("users")
        .doc(user.uid)
        .set(
          {
            name: userData.name || user.displayName || "User",
            email: userData.email || user.email || "",
            phone: currentOTPData.phone,
            displayName:
              userData.name || user.displayName || user.email || "User",
            isVerified: true,
            phoneVerified: true,
            verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt:
              userData.createdAt ||
              firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

      console.log(`[${timestamp}] User marked as verified in Firestore`);

      // Update user profile if needed
      if (userData.name && !user.displayName) {
        await user.updateProfile({
          displayName: userData.name,
        });
        console.log(`[${timestamp}] User profile updated with displayName`);
      }

      // Clear timers
      if (currentOTPData.timer) {
        clearInterval(currentOTPData.timer);
        currentOTPData.timer = null;
        console.log(`[${timestamp}] OTP timer cleared`);
      }

      if (typeof resendTimer !== "undefined" && resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
        console.log(`[${timestamp}] Resend timer cleared`);
      }

      // Hide OTP modal
      hideModal("otpVerificationModal");

      // Show success message
      alert("Phone verified successfully! Your account is now active.");

      // Reset OTP data
      currentOTPData = {
        otp: null,
        phone: null,
        email: null,
        expiryTime: null,
        timer: null,
        userData: null,
      };

      // Reset recaptcha for next use
      resetPhoneAuthRecaptcha();

      console.log(`[${timestamp}] OTP data reset`);

      // Refresh the page to ensure all auth state is updated
      console.log(`[${timestamp}] Scheduling page reload`);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (dbError) {
      console.error(
        `[${timestamp}] Error updating user verification status:`,
        dbError
      );
      showPhoneAuthError(
        "Failed to update user verification status. Please try again."
      );

      // Since Firebase Auth verification was successful but Firestore update failed,
      // we should still consider this a success but with a warning
      alert(
        "Your phone was verified, but there was an issue updating your profile. Please try logging in again."
      );
    }
  } catch (error) {
    console.error(`[${timestamp}] OTP verification error:`, error);

    // Handle common error cases
    let errorMessage = "";

    switch (error.code) {
      case "auth/invalid-verification-code":
        errorMessage = "Invalid verification code. Please check and try again.";
        break;
      case "auth/code-expired":
        errorMessage =
          "Verification code has expired. Please request a new one.";
        break;
      case "auth/missing-verification-code":
        errorMessage = "Please enter the verification code.";
        break;
      case "auth/session-expired":
        errorMessage =
          "Verification session has expired. Please request a new code.";
        break;
      default:
        errorMessage =
          error.message || "Verification failed. Please try again.";
    }

    // Show error message
    showPhoneAuthError(errorMessage);

    // Clear OTP inputs for retry
    try {
      clearOTPInputs();
      console.log(`[${timestamp}] OTP inputs cleared for retry`);
    } catch (clearError) {
      console.error(`[${timestamp}] Error clearing OTP inputs:`, clearError);
    }
  } finally {
    // Reset button state
    try {
      if (btnText && btnLoading) {
        btnText.classList.remove("hidden");
        btnLoading.classList.add("hidden");
      } else if (verifyBtn) {
        verifyBtn.textContent = "Verify";
      }

      if (verifyBtn) {
        verifyBtn.disabled = false;
      }
    } catch (btnResetError) {
      console.error(
        `[${timestamp}] Error resetting button state:`,
        btnResetError
      );
    }
  }
}

// Resend OTP using Firebase Phone Auth
async function resendPhoneOTP() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Resend OTP button clicked`);

  // Check if OTP data exists
  if (!currentOTPData || !currentOTPData.phone || !currentOTPData.userData) {
    console.error(
      `[${timestamp}] Missing OTP data for resend:`,
      currentOTPData
    );
    showPhoneAuthError(
      "Session expired. Please restart the registration process."
    );
    return;
  }

  // Get resend button and disable it during the process
  const resendBtn = document.getElementById("resendOtpBtn");
  if (!resendBtn) {
    console.error(`[${timestamp}] Resend button not found in DOM`);
    return;
  }

  const originalText = resendBtn.innerHTML;
  resendBtn.innerHTML = "Sending...";
  resendBtn.disabled = true;

  try {
    // Reset the reCAPTCHA
    resetPhoneAuthRecaptcha();

    // Get user data
    const { name, phone } = currentOTPData.userData;
    console.log(`[${timestamp}] Resending OTP to ${phone}`);

    // Send new OTP
    const smsSent = await sendPhoneOTP(phone, name);

    if (smsSent) {
      console.log(`[${timestamp}] OTP resent successfully`);

      // Show success message
      alert(
        `A new verification code has been sent to ${maskPhoneNumber(phone)}`
      );
    } else {
      console.error(`[${timestamp}] Failed to resend OTP`);
      showPhoneAuthError(
        "Failed to send verification code. Please try again later."
      );
    }
  } catch (error) {
    console.error(`[${timestamp}] Error in resend OTP:`, error);
    showPhoneAuthError(`Error: ${error.message}`);
  } finally {
    // Reset resend button after some delay
    setTimeout(() => {
      // Only restore button if it still exists in DOM
      if (document.body.contains(resendBtn)) {
        resendBtn.innerHTML = originalText;
        resendBtn.disabled = true; // Keep disabled until timer completes

        // Start new resend timer
        setupResendTimer();
      }
    }, 1000);
  }
}

// Reset reCAPTCHA for phone auth
function resetPhoneAuthRecaptcha() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Resetting reCAPTCHA`);

  try {
    // Clear old reCAPTCHA instance
    if (phoneAuthRecaptchaVerifier) {
      phoneAuthRecaptchaVerifier.clear();
      phoneAuthRecaptchaVerifier = null;
    }

    // Re-initialize phone auth with new reCAPTCHA
    initializePhoneAuth();

    console.log(`[${timestamp}] reCAPTCHA reset complete`);
  } catch (error) {
    console.error(`[${timestamp}] Error resetting reCAPTCHA:`, error);
  }
}

// Show phone auth error message
function showPhoneAuthError(message) {
  const errorElement = document.getElementById("phone-auth-error");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add("visible");
  } else {
    console.error(`Error element not found for message: ${message}`);
    // Fallback to alert if error element not found
    alert(message);
  }
}

// Hide phone auth error message
function hidePhoneAuthError() {
  const errorElement = document.getElementById("phone-auth-error");
  if (errorElement) {
    errorElement.classList.remove("visible");
  }
}

// Update user registration function to use Firebase Phone Auth
function registerUser() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value;

  // Basic validation
  if (!name || !email || !phone || !password) {
    alert("Please fill in all fields.");
    return;
  }

  // Validate phone number format
  const phoneRegex = /^\+[0-9]{1,3}[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    alert(
      "Please enter a valid phone number with country code (e.g., +91XXXXXXXXXX)"
    );
    return;
  }

  // Firebase requires passwords to be at least 6 characters
  if (password.length < 6) {
    alert("Password must be at least 6 characters long.");
    return;
  }

  // Check for password strength (recommended for better security)
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Recommend stronger password but don't block registration
  if (!(hasUpperCase && hasLowerCase && hasNumbers) && password.length < 8) {
    const proceed = confirm(
      "Your password is weak. For better security, use at least 8 characters with uppercase, lowercase, and numbers. Continue anyway?"
    );
    if (!proceed) {
      return;
    }
  }

  // Show loading state
  const registerBtn = document.querySelector(
    '#registerModal button[onclick="registerUser()"]'
  );
  if (!registerBtn) {
    alert(
      "Error: Registration button not found. Please refresh the page and try again."
    );
    return;
  }

  const originalText = registerBtn.textContent || "Register";
  registerBtn.textContent = "Creating account...";
  registerBtn.disabled = true;

  // Store user data for later use
  currentOTPData.userData = { name, email, phone, password };
  console.log("Stored user data for OTP process:", currentOTPData.userData);

  // Show a message about the registration process
  console.log("Starting registration with Firebase...");

  // Create Firebase user account first
  try {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("User account created:", user.email, "UID:", user.uid);

        // Store user data in Firestore with unverified status
        return db.collection("users").doc(user.uid).set({
          name: name,
          email: email,
          phone: phone,
          displayName: name,
          isVerified: false, // Will be set to true after phone verification
          phoneVerified: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      })
      .then(() => {
        console.log("User data stored in Firestore");

        // Hide registration modal immediately
        hideModal("registerModal");

        // Show OTP modal first
        showOTPModal(phone, email);

        // Initialize Firebase Phone Auth
        initializePhoneAuth();

        // Wait a bit to ensure modal is displayed, then send OTP via Firebase
        return new Promise((resolve) => {
          setTimeout(() => {
            sendPhoneOTP(phone, name).then(resolve);
          }, 500);
        });
      })
      .then(() => {
        console.log("Registration process completed");
      })
      .catch((error) => {
        console.error("Registration error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);

        let errorMessage = "Registration failed: ";
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage += "This email address is already in use.";
            break;
          case "auth/invalid-email":
            errorMessage += "Invalid email address format.";
            break;
          case "auth/operation-not-allowed":
            errorMessage += "Email/password accounts are not enabled.";
            break;
          case "auth/weak-password":
            errorMessage +=
              "Password is too weak. Please use a stronger password.";
            break;
          case "auth/too-many-requests":
            errorMessage += "Too many requests. Please try again later.";
            break;
          case "auth/network-request-failed":
            errorMessage +=
              "Network error. Please check your connection and try again.";
            break;
          default:
            errorMessage += error.message || "Unknown error occurred.";
        }

        alert(errorMessage);

        // Hide OTP modal if there was an error
        hideModal("otpVerificationModal");

        // Reset OTP data on error
        currentOTPData = {
          otp: null,
          email: null,
          phone: null,
          expiryTime: null,
          timer: null,
          userData: null,
        };
      })
      .finally(() => {
        // Reset button state
        if (registerBtn) {
          registerBtn.textContent = originalText || "Register";
          registerBtn.disabled = false;
        }
        console.log("Registration process finished (success or failure)");
      });
  } catch (unexpectedError) {
    // This catch block handles unexpected errors that might occur outside the Promise chain
    console.error("Unexpected error during registration:", unexpectedError);
    alert("An unexpected error occurred. Please try again later.");

    // Reset OTP data
    currentOTPData = {
      otp: null,
      email: null,
      phone: null,
      expiryTime: null,
      timer: null,
      userData: null,
    };

    // Reset button state
    if (registerBtn) {
      registerBtn.textContent = originalText || "Register";
      registerBtn.disabled = false;
    }

    // Hide modals if needed
    hideModal("otpVerificationModal");
  }
}
