// Import Firebase services
import { auth, db } from './firebase.js';

// Export functions for OTP system
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to mask phone number for display (only show last 4 digits)
export function maskPhoneNumber(phone) {
  if (!phone) return "";
  // Keep country code and last 4 digits, replace the rest with asterisks
  const countryCodeEnd = phone.indexOf(" ") > 0 ? phone.indexOf(" ") + 1 : 3;
  const lastFourStart = phone.length - 4;

  const countryCode = phone.substring(0, countryCodeEnd);
  const lastFour = phone.substring(lastFourStart);
  const middleLength = phone.length - countryCode.length - lastFour.length;
  const maskedMiddle = "*".repeat(middleLength);

  return `${countryCode}${maskedMiddle}${lastFour}`;
}

// Function to hide modal - exported to be used in script.js
export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
  }
}

// Function to resend OTP with proper handling for phone verification
export async function resendOTP(currentOTPData, sendPhoneOTP) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Resend OTP button clicked`);

  // Check if OTP data exists
  if (!currentOTPData || !currentOTPData.phone || !currentOTPData.userData) {
    console.error(
      `[${timestamp}] Missing OTP data for resend:`,
      currentOTPData
    );
    alert("Session expired. Please restart the registration process.");
    hideModal("otpVerificationModal");
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
    // Get user data
    const { name, phone } = currentOTPData.userData;
    console.log(`[${timestamp}] Resending OTP to ${phone}`);

    // Send new OTP
    const smsSent = await sendPhoneOTP(phone, name);

    if (smsSent) {
      console.log(`[${timestamp}] OTP resent successfully`);

      // Clear OTP inputs for new entry
      clearOTPInputs();

      // Reset OTP timer
      setupOTPTimer(currentOTPData);

      // Reset resend timer
      setupResendTimer();

      // Show success message
      alert(
        `A new verification code has been sent to ${maskPhoneNumber(phone)}`
      );
    } else {
      console.error(`[${timestamp}] Failed to resend OTP`);
      alert("Failed to send verification code. Please try again.");
    }
  } catch (error) {
    console.error(`[${timestamp}] Error resending OTP:`, error);
    alert(
      "An error occurred while resending the verification code. Please try again."
    );
  } finally {
    // Reset button state
    if (resendBtn) {
      // The timer will handle changing the button back to normal
      resendBtn.innerHTML = originalText;
    }  }
}

// Setup OTP Timer function
  console.log(`[${timestamp}] Resend OTP button clicked`);

  // Check if OTP data exists
  if (!currentOTPData || !currentOTPData.phone || !currentOTPData.userData) {
    console.error(
      `[${timestamp}] Missing OTP data for resend:`,
      currentOTPData
    );
    alert("Session expired. Please restart the registration process.");
    hideModal("otpVerificationModal");
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
    // Get user data
    const { name, phone } = currentOTPData.userData;
    console.log(`[${timestamp}] Resending OTP to ${phone}`);

    // Send new OTP
    const smsSent = await sendPhoneOTP(phone, name);

    if (smsSent) {
      console.log(`[${timestamp}] OTP resent successfully`);

      // Clear OTP inputs for new entry
      clearOTPInputs();

      // Reset OTP timer
      setupOTPTimer(currentOTPData);

      // Reset resend timer
      setupResendTimer();

      // Show success message
      alert(
        `A new verification code has been sent to ${maskPhoneNumber(phone)}`
      );
    } else {
      console.error(`[${timestamp}] Failed to resend OTP`);
      alert("Failed to send verification code. Please try again.");
    }
  } catch (error) {
    console.error(`[${timestamp}] Error resending OTP:`, error);
    alert(
      "An error occurred while resending the verification code. Please try again."
    );
  } finally {
    // Reset button state
    if (resendBtn) {
      // The timer will handle changing the button back to normal
      resendBtn.innerHTML = originalText;
    }
  }
}

// Setup OTP Timer function
export function setupOTPTimer(currentOTPData) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Setting up OTP timer`);

  // Clear existing timer if any
  if (currentOTPData.timer) {
    clearInterval(currentOTPData.timer);
    currentOTPData.timer = null;
  }

  // Get timer display elements
  const timerDisplay = document.getElementById("otpTimer");
  const expiredMsg = document.getElementById("otpExpired");

  if (!timerDisplay || !expiredMsg) {
    console.error(`[${timestamp}] Timer display elements not found`);
    return;
  }

  // Reset display
  expiredMsg.classList.add("hidden");
  timerDisplay.classList.remove("hidden");

  // Set the timer based on OTP expiry time
  const updateTimer = () => {
    const now = Date.now();
    const timeLeft = currentOTPData.expiryTime - now;

    if (timeLeft <= 0) {
      // OTP expired
      clearInterval(currentOTPData.timer);
      currentOTPData.timer = null;

      timerDisplay.classList.add("hidden");
      expiredMsg.classList.remove("hidden");

      // Make resend button primary
      const resendBtn = document.getElementById("resendOtpBtn");
      if (resendBtn && resendBtn.disabled) {
        resendBtn.disabled = false;
        resendBtn.classList.add("resend-active");
      }

      return;
    }

    // Format and display remaining time
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Initial update
  updateTimer();

  // Set interval for timer updates
  currentOTPData.timer = setInterval(updateTimer, 1000);
  console.log(`[${timestamp}] OTP timer started`);
}
    const smsSent = await sendPhoneOTP(phone, name);

    if (smsSent) {
      console.log(`[${timestamp}] OTP resent successfully`);

      // Clear OTP inputs for new entry
      clearOTPInputs();

      // Reset OTP timer
      setupOTPTimer();

      // Reset resend timer
      setupResendTimer();

      // Show success message
      alert(
        `A new verification code has been sent to ${maskPhoneNumber(phone)}`
      );
    } else {
      console.error(`[${timestamp}] Failed to resend OTP`);
      alert("Failed to send verification code. Please try again.");
    }
  } catch (error) {
    console.error(`[${timestamp}] Error resending OTP:`, error);
    alert(
      "An error occurred while resending the verification code. Please try again."
    );
  } finally {
    // Reset button state
    if (resendBtn) {
      // The timer will handle changing the button back to normal
      resendBtn.innerHTML = originalText;
    }
  }
}

// Setup OTP Timer function
function setupOTPTimer() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Setting up OTP timer`);

  // Clear existing timer if any
  if (currentOTPData.timer) {
    clearInterval(currentOTPData.timer);
    currentOTPData.timer = null;
  }

  // Get timer display elements
  const timerDisplay = document.getElementById("otpTimer");
  const expiredMsg = document.getElementById("otpExpired");

  if (!timerDisplay || !expiredMsg) {
    console.error(`[${timestamp}] Timer display elements not found`);
    return;
  }

  // Reset display
  expiredMsg.classList.add("hidden");
  timerDisplay.classList.remove("hidden");

  // Set the timer based on OTP expiry time
  const updateTimer = () => {
    const now = Date.now();
    const timeLeft = currentOTPData.expiryTime - now;

    if (timeLeft <= 0) {
      // OTP expired
      clearInterval(currentOTPData.timer);
      currentOTPData.timer = null;

      timerDisplay.classList.add("hidden");
      expiredMsg.classList.remove("hidden");

      // Make resend button primary
      const resendBtn = document.getElementById("resendOtpBtn");
      if (resendBtn && resendBtn.disabled) {
        resendBtn.disabled = false;
        resendBtn.classList.add("resend-active");
      }

      return;
    }

    // Format and display remaining time
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Initial update
  updateTimer();

  // Set interval for timer updates
  currentOTPData.timer = setInterval(updateTimer, 1000);
  console.log(`[${timestamp}] OTP timer started`);
}

// Setup Resend Timer function
export function setupResendTimer() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Setting up resend timer`);

  // Variables for resend functionality
  let resendTimer = null;
  let resendTimeLeft = 60; // 60 seconds cooldown for resend

  // Clear existing timer if any
  if (resendTimer) {
    clearInterval(resendTimer);
    resendTimer = null;
  }

  // Get resend button and timer display
  const resendBtn = document.getElementById("resendOtpBtn");
  const resendTimerDisplay = document.getElementById("resendTimer");

  if (!resendBtn || !resendTimerDisplay) {
    console.error(`[${timestamp}] Resend button or timer display not found`);
    return;
  }

  // Disable button initially
  resendBtn.disabled = true;
  resendBtn.classList.remove("resend-active");

  // Update display
  resendTimerDisplay.textContent = resendTimeLeft;

  // Update function
  const updateResendTimer = () => {
    resendTimeLeft -= 1;

    if (resendTimeLeft <= 0) {
      // Enable resend button
      clearInterval(resendTimer);
      resendTimer = null;

      resendBtn.disabled = false;
      resendBtn.classList.add("resend-active");
      resendTimerDisplay.textContent = "0";
      return;
    }

    // Update display
    resendTimerDisplay.textContent = resendTimeLeft;
  };

  // Set interval
  resendTimer = setInterval(updateResendTimer, 1000);
  console.log(`[${timestamp}] Resend timer started: ${resendTimeLeft}s`);
  
  return resendTimer;
}

// Function to clear OTP input fields
export function clearOTPInputs() {
  const inputs = document.querySelectorAll(".otp-digit");
  inputs.forEach((input) => {
    input.value = "";
  });

  // Focus on first input if available
  if (inputs.length > 0) {
    inputs[0].focus();
  }
}

// Function to set up OTP input field auto-tabbing
export function setupOTPInputAutoTab() {
  const inputs = document.querySelectorAll(".otp-digit");

  inputs.forEach((input, index) => {
    // Add input event listeners
    input.addEventListener("input", function (e) {
      const value = e.target.value;

      // Move to next input if a digit was entered
      if (value.length === 1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      // Check if all inputs are filled
      checkAllInputsFilled();
    });

    // Add keydown event listeners for backspace navigation
    input.addEventListener("keydown", function (e) {
      if (e.key === "Backspace" && index > 0 && !e.target.value) {
        // If backspace is pressed on an empty input, go back to previous input
        inputs[index - 1].focus();
      }
    });
  });
}

// Function to check if all OTP inputs are filled
export function checkAllInputsFilled() {
  const inputs = document.querySelectorAll(".otp-digit");
  const verifyBtn = document.getElementById("verifyOtpBtn");

  if (!verifyBtn) return;

  // Check if all inputs have a value
  const allFilled = Array.from(inputs).every(
    (input) => input.value.length === 1
  );

  // Enable/disable verify button based on inputs
  verifyBtn.disabled = !allFilled;

  if (allFilled) {
    verifyBtn.classList.add("active");
  } else {
    verifyBtn.classList.remove("active");
  }
}

// Function to generate a 6-digit OTP
export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to mask phone number for display (only show last 4 digits)
export function maskPhoneNumber(phone) {
  if (!phone) return "";
  // Keep country code and last 4 digits, replace the rest with asterisks
  const countryCodeEnd = phone.indexOf(" ") > 0 ? phone.indexOf(" ") + 1 : 3;
  const lastFourStart = phone.length - 4;

  const countryCode = phone.substring(0, countryCodeEnd);
  const lastFour = phone.substring(lastFourStart);
  const middleLength = phone.length - countryCode.length - lastFour.length;
  const maskedMiddle = "*".repeat(middleLength);

  return `${countryCode}${maskedMiddle}${lastFour}`;
}

// Helper function to hide modal - exported to be used in script.js
export function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
  }
}
