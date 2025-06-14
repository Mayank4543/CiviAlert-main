// Password strength meter for registration
export function initializePasswordStrengthMeter() {
  const passwordInput = document.getElementById("regPassword");
  if (!passwordInput) return;

  // Create strength meter elements if they don't exist
  if (!document.getElementById("password-strength-meter")) {
    const meterContainer = document.createElement("div");
    meterContainer.className = "password-strength-container";
    meterContainer.innerHTML = `
      <div class="password-strength-meter" id="password-strength-meter">
        <div class="strength-bar"></div>
      </div>
      <div class="password-strength-text" id="password-strength-text">Password strength</div>
    `;

    // Insert after password input
    passwordInput.parentNode.insertBefore(
      meterContainer,
      passwordInput.nextSibling
    );
  }

  const strengthBar = document.querySelector(".strength-bar");
  const strengthText = document.getElementById("password-strength-text");

  // Add event listener for password input
  passwordInput.addEventListener("input", function () {
    const password = this.value;
    const strength = measurePasswordStrength(password);

    // Update the strength bar
    strengthBar.className = "strength-bar";
    if (password.length > 0) {
      strengthBar.classList.add(strength.level);
      strengthBar.style.width = strength.percentage + "%";
    } else {
      strengthBar.style.width = "0%";
    }

    // Update text
    strengthText.textContent = strength.text;
    strengthText.className = "password-strength-text " + strength.level;
  });
}

// Initialize password meter when document is ready
document.addEventListener("DOMContentLoaded", function () {
  // Set up modal event listeners
  const registerLink = document.getElementById("registerLink");
  if (registerLink) {
    registerLink.addEventListener("click", function () {
      // Initialize after a small delay to ensure modal is visible
      setTimeout(initializePasswordStrengthMeter, 100);
    });
  }
});

// Measure password strength
export function measurePasswordStrength(password) {
  if (!password) {
    return { level: "empty", text: "Enter a password", percentage: 0 };
  }

  let score = 0;

  // Length check
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (password.length >= 10) score += 1;

  // Complexity checks
  if (/[a-z]/.test(password)) score += 1; // lowercase
  if (/[A-Z]/.test(password)) score += 1; // uppercase
  if (/[0-9]/.test(password)) score += 1; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 1; // special chars

  // Calculate percentage
  const percentage = Math.min(100, Math.round((score / 7) * 100));

  // Determine level and text
  let level, text;

  if (score < 3) {
    level = "weak";
    text = "Weak - Too simple";
  } else if (score < 5) {
    level = "fair";
    text = "Fair - Add complexity";
  } else if (score < 6) {
    level = "good";
    text = "Good - Almost there!";
  } else {
    level = "strong";
    text = "Strong - Great password!";
  }

  return { level, text, percentage };
}
