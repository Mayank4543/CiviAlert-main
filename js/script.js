// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3Y8YBwGVXpsWaNJgbNZHhyIzaW9W_Bdo",
  authDomain: "civialert-af464.firebaseapp.com",
  projectId: "civialert-af464",
  storageBucket: "civialert-af464.firebasestorage.app",
  messagingSenderId: "776751139563",
  appId: "1:776751139563:web:2f14aa67c2332f144f0cae",
  measurementId: "G-GXPVPKY0Q6",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Initialize EmailJS with correct syntax
(function () {
  emailjs.init({
    publicKey: "cMX_PTg2GiI0QFlKE",
  });
})();

// OTP System Variables
let currentOTPData = {
  otp: null,
  phone: null,
  email: null,
  expiryTime: null,
  timer: null,
  userData: null,
};

let resendTimer = null;
let resendTimeLeft = 0;

// Handle report submission
document.addEventListener("DOMContentLoaded", () => {
  const reportForm = document.querySelector("#loggedInReport form");

  if (reportForm) {
    reportForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Check if user is verified before allowing report submission
      const user = auth.currentUser;
      if (!user) {
        alert("Please login to submit a report.");
        showModal("loginModal");
        return;
      }

      try {
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (!userDoc.exists || !userDoc.data().isVerified) {
          alert("Please verify your email address before submitting reports.");
          return;
        }

        const title = document
          .getElementById("loggedInIncidentTitle")
          .value.trim();
        const description = document
          .getElementById("loggedInIncidentDescription")
          .value.trim();
        const location = document
          .getElementById("loggedInIncidentLocation")
          .value.trim();

        if (!title || !description || !location) {
          alert("Please fill in all fields.");
          return;
        }

        const reportData = {
          title,
          description,
          location,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          userId: user.uid,
          userEmail: user.email,
          status: "pending",
        };

        await db.collection("reports").add(reportData);
        alert("Report submitted successfully!");

        // Reset the form
        reportForm.reset();
        document.getElementById("loggedInIncidentLocation").style.color = "";
        document.getElementById("loggedInIncidentLocation").style.fontWeight =
          "";
      } catch (error) {
        console.error("Error adding report:", error);
        alert("Failed to submit report. Please try again.");
      }
    });
  }
});

// Initialize Main Map (called from button click)
function showMap() {
  let mapSection, mapId;
  if (isLoggedIn) {
    mapSection = document.getElementById("mapSectionLoggedIn");
    mapId = "mapLoggedIn";
  } else {
    mapSection = document.getElementById("mapSection");
    mapId = "map";
  }

  if (mapSection.style.display === "block") {
    mapSection.style.display = "none";
    return;
  }
  mapSection.style.display = "block";

  const mapKey = isLoggedIn ? "loggedInMapInitialized" : "mainMapInitialized";
  if (!window[mapKey]) {
    const map = L.map(mapId).setView([28.6139, 77.209], 12);

    // Use standard OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Add current location
    addCurrentLocation(map);

    window[mapKey] = true;
    window[isLoggedIn ? "loggedInMap" : "mainMap"] = map;
  }
}

// Function to add current location to map
function addCurrentLocation(map) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // Center map on current location
        map.setView([lat, lng], 15);

        // Add marker for current location
        const currentLocationMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "current-location-marker",
            html: '<div class="location-dot"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        }).addTo(map);

        currentLocationMarker
          .bindPopup(
            `
          <b>Your Current Location</b><br>
          Accuracy: ${Math.round(accuracy)}m
        `
          )
          .openPopup();

        // Add accuracy circle if accuracy is reasonable
        if (accuracy <= 100) {
          L.circle([lat, lng], {
            radius: accuracy,
            color: "#1abc9c",
            fillColor: "#1abc9c",
            fillOpacity: 0.1,
            weight: 2,
          }).addTo(map);
        }

        // Add default Delhi marker as well
        L.marker([28.6139, 77.209]).addTo(map).bindPopup("Delhi City Center");
      },
      function (error) {
        console.error("Geolocation error:", error);
        // Fallback to Delhi if geolocation fails
        L.marker([28.6139, 77.209])
          .addTo(map)
          .bindPopup("Delhi City Center (Geolocation unavailable)")
          .openPopup();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  } else {
    // Geolocation not supported
    L.marker([28.6139, 77.209])
      .addTo(map)
      .bindPopup("Delhi City Center (Geolocation not supported)")
      .openPopup();
  }
}

// Initialize Dashboard Map on Page Load
window.addEventListener("DOMContentLoaded", function () {
  setLoggedIn(false);
  // Remove automatic dashboard map initialization - will be done when dashboard is shown
});

// Smooth scroll to top
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  // Hide all content sections except dashboard
  document
    .querySelectorAll(".content")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById("dashboard").classList.add("active");
  // Hide map section if visible
  const mapSection = document.getElementById("mapSection");
  if (mapSection) mapSection.style.display = "none";
  // Activate the first nav-btn (Dashboard)
  document
    .querySelectorAll(".nav-btn")
    .forEach((el) => el.classList.remove("active"));
  const dashboardBtn = document.querySelector(".dashboard-nav .nav-btn");
  if (dashboardBtn) dashboardBtn.classList.add("active");
}

// Show a modal by ID
function showModal(id) {
  document.getElementById(id).style.display = "flex";
}

// Hide a modal by ID
function hideModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = "none";
    modal.style.visibility = "hidden";

    // Clear OTP data if closing OTP modal
    if (id === "otpVerificationModal") {
      // Clear timers
      if (currentOTPData.timer) {
        clearInterval(currentOTPData.timer);
        currentOTPData.timer = null;
      }
      if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
      }

      // Clear inputs
      clearOTPInputs();
    }
  }
}

let isLoggedIn = false;

function setLoggedIn(state) {
  isLoggedIn = state;

  // Safely get elements and update UI
  const safeUpdateElement = (id, displayStyle) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = displayStyle;
    }
  };

  // Toggle headers
  if (state) {
    safeUpdateElement("loggedOutHeader", "none");
    const loggedInHeader = document.getElementById("loggedInHeader");
    if (loggedInHeader) {
      loggedInHeader.classList.remove("hidden");
      loggedInHeader.style.display = "flex";
    }
  } else {
    safeUpdateElement("loggedOutHeader", "flex");
    const loggedInHeader = document.getElementById("loggedInHeader");
    if (loggedInHeader) {
      loggedInHeader.classList.add("hidden");
      loggedInHeader.style.display = "none";
    }
  }

  // Toggle layouts
  if (state) {
    safeUpdateElement("landingPage", "none");
    const loggedInLayout = document.getElementById("loggedInLayout");
    if (loggedInLayout) {
      loggedInLayout.classList.remove("hidden");
      loggedInLayout.style.display = "flex";
    }
  } else {
    safeUpdateElement("landingPage", "block");
    const loggedInLayout = document.getElementById("loggedInLayout");
    if (loggedInLayout) {
      loggedInLayout.classList.add("hidden");
      loggedInLayout.style.display = "none";
    }
  }

  safeUpdateElement("dashboardPage", "none");

  if (!state) {
    // Logged out state
    safeUpdateElement("homeNav", "inline");
    safeUpdateElement("dashboardNav", "none");
    safeUpdateElement("featuresNav", "inline");
    safeUpdateElement("howItWorksNav", "inline");
    safeUpdateElement("loginLink", "inline");
    safeUpdateElement("registerLink", "inline");
    const infoSections = document.getElementById("infoSections");
    if (infoSections) infoSections.style.display = "block";
  } else {
    // Logged in state - show home by default and activate the home button
    const homeSidebarBtn = document.querySelector(
      '.sidebar-btn[onclick*="home"]'
    );
    if (homeSidebarBtn) {
      showLoggedInPage("home", homeSidebarBtn);
    } else {
      console.warn("Home sidebar button not found");
    }
  }
}

function showLoggedInPage(page, btn) {
  console.log("Switching to page:", page);

  // Hide all logged-in content
  document
    .querySelectorAll(".logged-in-content")
    .forEach((el) => el.classList.remove("active"));

  // Show selected content
  if (page === "home") {
    // Scroll to top when switching to home page
    window.scrollTo({ top: 0, behavior: "smooth" });

    // For home page, show the landing page content but keep logged-in layout
    const targetElement = document.getElementById("loggedInHome");
    if (targetElement) {
      targetElement.classList.add("active");
      // Add the features and how-it-works sections to the logged-in home view
      const existingFeatures = targetElement.querySelector("#loggedInFeatures");
      const existingHowItWorks = targetElement.querySelector(
        "#loggedInHowItWorks"
      );

      if (!existingFeatures) {
        const featuresSection = document
          .getElementById("features")
          .cloneNode(true);
        featuresSection.id = "loggedInFeatures";
        targetElement.appendChild(featuresSection);
      }

      if (!existingHowItWorks) {
        const howItWorksSection = document
          .getElementById("how-it-works")
          .cloneNode(true);
        howItWorksSection.id = "loggedInHowItWorks";
        targetElement.appendChild(howItWorksSection);
      }
    }

    // Hide sidebar and show top navigation for home
    document.querySelector(".sidebar").style.display = "none";
    document.getElementById("topNavigation").classList.remove("hidden");
    document.getElementById("topNavigation").style.display = "flex";
    document.querySelector(".main-content").style.marginLeft = "0";
  } else {
    // For other pages, also scroll to top for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });

    const targetId = "loggedIn" + page.charAt(0).toUpperCase() + page.slice(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) targetElement.classList.add("active");

    // Show sidebar and hide top navigation for other pages
    document.querySelector(".sidebar").style.display = "flex";
    document.getElementById("topNavigation").classList.add("hidden");
    document.getElementById("topNavigation").style.display = "none";
    document.querySelector(".main-content").style.marginLeft = "250px";

    // Initialize dashboard map when dashboard page is shown
    if (page === "dashboard" && !window.dashboardMapInitialized) {
      setTimeout(() => {
        const mapContainer = document.getElementById("map2");
        if (!mapContainer) {
          console.error("Dashboard map container not found");
          return;
        }

        try {
          const map2 = L.map("map2").setView([28.6139, 77.209], 12);

          // Use standard OpenStreetMap tiles for dashboard map
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(map2);

          // Add current location to dashboard map
          addCurrentLocation(map2);

          window.dashboardMapInitialized = true;
          window.dashboardMap = map2;

          // Force map resize after initialization
          setTimeout(() => {
            map2.invalidateSize();
          }, 200);
        } catch (error) {
          console.error("Error initializing dashboard map:", error);
          // Retry after a longer delay
          setTimeout(() => {
            if (!window.dashboardMapInitialized) {
              try {
                const retryMap = L.map("map2").setView([28.6139, 77.209], 12);

                L.tileLayer(
                  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                  {
                    attribution: "&copy; OpenStreetMap contributors",
                  }
                ).addTo(retryMap);

                addCurrentLocation(retryMap);
                window.dashboardMapInitialized = true;
                window.dashboardMap = retryMap;
                retryMap.invalidateSize();
              } catch (retryError) {
                console.error(
                  "Failed to initialize dashboard map on retry:",
                  retryError
                );
              }
            }
          }, 1000);
        }
      }, 300);
    }

    // Load dashboard data when dashboard page is shown
    if (page === "dashboard") {
      setTimeout(() => {
        loadDashboardData();
      }, 100);
    }

    // Load reports when My Reports page is shown
    if (page === "reports") {
      setTimeout(() => {
        loadUserReports();
      }, 100);
    }
  }

  // Update sidebar button states - ensure all buttons are deactivated first
  document
    .querySelectorAll(".sidebar-btn")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".top-nav-btn")
    .forEach((el) => el.classList.remove("active"));

  // Then activate the correct button
  if (btn) {
    btn.classList.add("active");
  } else {
    if (page === "home") {
      const targetBtn = document.querySelector(
        `.top-nav-btn[onclick*="${page}"]`
      );
      if (targetBtn) targetBtn.classList.add("active");
    } else {
      const targetBtn = document.querySelector(
        `.sidebar-btn[onclick*="${page}"]`
      );
      if (targetBtn) targetBtn.classList.add("active");
    }
  }

  // Hide map if switching away from home
  if (page !== "home") {
    const mapSection = document.getElementById("mapSectionLoggedIn");
    if (mapSection) mapSection.style.display = "none";
  }
}

// Toggle user dropdown visibility
function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  dropdown.classList.toggle("show");
}

// Close dropdown when clicking outside
document.addEventListener("click", function (e) {
  if (!e.target.closest(".user-dropdown")) {
    document.getElementById("userDropdown").classList.remove("show");
  }
});

// Helper function to get user initials
function getUserInitials(displayName, email) {
  if (displayName && displayName.trim()) {
    // Extract initials from display name (first name + last name)
    const names = displayName
      .trim()
      .split(" ")
      .filter((name) => name.length > 0);
    if (names.length >= 2) {
      // First name + Last name initials
      return (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
      ).toUpperCase();
    } else if (names.length === 1) {
      // Single name - take first letter only
      return names[0].charAt(0).toUpperCase();
    }
  }

  // Fallback to email if no display name
  if (email) {
    const emailParts = email.split("@");
    const username = emailParts[0];

    // Try to extract name parts from email username
    // Look for common separators like dots, underscores, numbers
    const nameParts = username
      .split(/[._\d]+/)
      .filter((part) => part.length > 0);

    if (nameParts.length >= 2) {
      // Multiple parts found - use first and last
      return (
        nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
      ).toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 1) {
      // Single part - use first letter only
      return nameParts[0].charAt(0).toUpperCase();
    } else {
      // Fallback - use first letter of username
      return username.charAt(0).toUpperCase();
    }
  }

  return "U"; // Default fallback
}

// Helper function to get ordinal numbers
function getOrdinal(n) {
  const ordinals = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];
  return ordinals[n - 1] || n + "th";
}

// Helper function to announce messages to screen readers
function announceToScreenReader(message) {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  document.body.appendChild(announcement);

  // Remove the announcement after a brief delay
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}

// Consolidated authentication state monitoring
auth.onAuthStateChanged((user) => {
  console.log("Auth state changed:", user ? user.email : "No user");

  // Check if we're in the OTP verification process
  const isInOTPProcess = Boolean(currentOTPData && currentOTPData.userData);
  console.log("Is in OTP process:", isInOTPProcess);

  if (user) {
    // Check if user is verified before allowing access
    db.collection("users")
      .doc(user.uid)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          console.log("User data:", userData);

          if (userData.isVerified) {
            // User is verified - proceed with login
            console.log("Verified user logged in:", user.email);
            setLoggedIn(true);

            // Initialize settings
            initializeUserSettings();

            // Get user initials
            const initials = getUserInitials(user.displayName, user.email);

            // Update user display in dropdown
            const userToggle = document.querySelector(".user-toggle");
            if (userToggle) {
              userToggle.innerHTML = `
                <div class="user-avatar">
                  <span class="user-initials">${initials}</span>
                </div>
                <span class="dropdown-arrow">▼</span>
              `;
            }

            // Update user profile info in dropdown
            const userProfileInfo = document.getElementById("userProfileInfo");
            if (userProfileInfo) {
              const displayText = user.displayName || user.email;
              userProfileInfo.textContent = displayText;
              userProfileInfo.style.display = "block";
            }
          } else {
            // User is not verified - only sign them out if this is NOT during OTP verification
            if (isInOTPProcess) {
              console.log(
                "User in OTP verification process, keeping signed in"
              );
              // Keep them signed in but don't set logged in state
              setLoggedIn(false);
            } else {
              console.log(
                "Unverified user detected, but not in OTP process, signing out"
              );
              auth.signOut();
              alert(
                "Please verify your phone number to complete registration."
              );
            }
          }
        } else {
          // User document doesn't exist - only sign out if not in OTP process
          if (isInOTPProcess) {
            console.log(
              "User document not found, but in OTP process, keeping signed in"
            );
            // This is expected during registration - we're creating the document
          } else {
            console.log("User document not found, signing out");
            auth.signOut();
          }
        }
      })
      .catch((error) => {
        console.error("Error checking user verification:", error);
        // Don't automatically sign out on database errors during OTP process
        if (isInOTPProcess) {
          console.log(
            "Database error during OTP process, keeping user signed in"
          );
          setLoggedIn(false);
        } else {
          console.log("Database error and not in OTP process, signing out");
          auth.signOut();
        }
      });
  } else {
    // User is signed out
    console.log("User logged out");
    setLoggedIn(false);

    // Reset user display to default
    const userToggle = document.querySelector(".user-toggle");
    if (userToggle) {
      userToggle.innerHTML = `
        <span>User</span>
        <span class="dropdown-arrow">▼</span>
      `;
    }

    // Hide user profile info
    const userProfileInfo = document.getElementById("userProfileInfo");
    if (userProfileInfo) {
      userProfileInfo.textContent = "Not logged in";
      userProfileInfo.style.display = "block";
    }
  }
});

function loginUser() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  // Basic validation
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  // Show loading state
  const loginBtn = document.querySelector(
    '#loginModal button[onclick="loginUser()"]'
  );
  const originalText = loginBtn.textContent;
  loginBtn.textContent = "Logging in...";
  loginBtn.disabled = true;

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Login successful
      const user = userCredential.user;
      console.log("Login successful:", user.email);

      // Clear form
      document.getElementById("loginEmail").value = "";
      document.getElementById("loginPassword").value = "";

      hideModal("loginModal");
      // setLoggedIn(true) will be called automatically by onAuthStateChanged

      // Show success message
      alert("Login successful! Welcome back.");
    })
    .catch((error) => {
      console.error("Login error:", error);

      // Handle specific error codes
      let errorMessage = "Login failed: ";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage += "No account found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage += "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage += "Invalid email address format.";
          break;
        case "auth/user-disabled":
          errorMessage += "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage +=
            "Too many failed login attempts. Please try again later.";
          break;
        default:
          errorMessage += error.message;
      }

      alert(errorMessage);
    })
    .finally(() => {
      // Reset button state
      loginBtn.textContent = originalText;
      loginBtn.disabled = false;
    });
}

// Enhanced registration function with better error handling
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
          isVerified: false,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      })
      .then(() => {
        console.log("User data stored in Firestore");

        // Hide registration modal immediately
        hideModal("registerModal");

        // Show OTP modal first
        showOTPModal(phone, email);

        // Wait a bit to ensure modal is displayed, then send OTP
        return new Promise((resolve) => {
          setTimeout(() => {
            sendPhoneOTP(phone, name).then(resolve).catch(resolve); // Continue regardless of SMS success
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
            errorMessage +=
              "An account with this email address already exists.";
            break;
          case "auth/invalid-email":
            errorMessage += "Invalid email address format.";
            break;
          case "auth/operation-not-allowed":
            errorMessage += "Email/password accounts are not enabled.";
            break;
          case "auth/weak-password":
            errorMessage +=
              "Password is too weak. Firebase requires stronger passwords. Please use a combination of letters, numbers, and special characters.";
            break;
          case "auth/too-many-requests":
            errorMessage +=
              "Too many unsuccessful attempts. Please try again later.";
            break;
          case "auth/network-request-failed":
            errorMessage +=
              "Network error. Please check your internet connection and try again.";
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
// Enhanced Send OTP via EmailJS with better error handling and timeout management
async function sendEmailOTP(email, name) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Generating new OTP for email: ${email}`);

  // Generate a fresh OTP
  const otp = generateOTP();
  const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now

  // Store OTP data first
  currentOTPData.otp = otp;
  currentOTPData.email = email;
  currentOTPData.expiryTime = expiryTime;

  console.log(`[${timestamp}] OTP details:`, {
    otp: otp,
    email: email,
    expiryTime: new Date(expiryTime).toISOString(),
    expiresIn: `${Math.floor((expiryTime - Date.now()) / 1000 / 60)} minutes`,
  });

  // Store OTP in Firestore first - this is critical for verification
  try {
    await db.collection("emailVerifications").doc(email).set({
      otp: otp,
      expiryTime: expiryTime,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`[${timestamp}] OTP stored in Firestore successfully`);
  } catch (error) {
    console.error(`[${timestamp}] Error storing OTP in Firestore:`, error);
    // Create a fallback retry mechanism for Firestore
    try {
      console.log(`[${timestamp}] Retrying Firestore storage...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await db.collection("emailVerifications").doc(email).set({
        otp: otp,
        expiryTime: expiryTime,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[${timestamp}] OTP stored in Firestore on retry`);
    } catch (retryError) {
      console.error(`[${timestamp}] Firestore retry also failed:`, retryError);
      // Continue with email sending, but verification might be affected
    }
  } // Wait a moment to ensure EmailJS is ready
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Send email via EmailJS with enhanced retry mechanism and timeout control
  const templateParams = {
    to_name: name,
    to_email: email,
    otp: otp,
    from_name: "CiviAlert Team",
  };

  console.log(
    `[${timestamp}] Preparing to send email with OTP ${otp} to ${email}`
  );

  let emailSent = false;
  let attempts = 0;
  const maxAttempts = 3;
  const timeoutDuration = 10000; // 10 seconds timeout

  while (!emailSent && attempts < maxAttempts) {
    attempts++;
    try {
      console.log(
        `[${timestamp}] Email sending attempt ${attempts}/${maxAttempts}`
      );

      // Create a promise with timeout to prevent hanging
      const emailPromise = emailjs.send(
        "service_74hfkes",
        "template_vxjstfl",
        templateParams
      );
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Email sending timed out")),
          timeoutDuration
        )
      );

      // Race the email sending against the timeout
      const response = await Promise.race([emailPromise, timeoutPromise]);

      console.log(`[${timestamp}] OTP email sent successfully:`, response);
      emailSent = true;

      // Show success message only if this is not the first attempt during registration
      if (attempts > 1) {
        console.log(
          `[${timestamp}] Email sent successfully on retry ${attempts}`
        );
      }
    } catch (error) {
      console.error(
        `[${timestamp}] Email sending attempt ${attempts} failed:`,
        error
      );

      if (attempts < maxAttempts) {
        const backoffTime = 1000 * attempts; // Progressive backoff: 1s, 2s, 3s
        console.log(
          `[${timestamp}] Retrying email send in ${
            backoffTime / 1000
          } seconds... (attempt ${attempts + 1}/${maxAttempts})`
        );
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      } else {
        console.error(
          `[${timestamp}] All email sending attempts failed:`,
          error
        );

        // Show fallback message with OTP for testing/development environments
        alert(
          `Email service is experiencing issues. For testing purposes, your OTP is: ${otp}\n\nYou can also try using the "Resend OTP" button.`
        );
      }
    }
  }

  return emailSent;
}

// Function to show the OTP modal with proper phone/email display
function showOTPModal(phone, email) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Showing OTP modal for phone: ${phone}`);

  // Update the phone number display in the OTP modal
  const phoneDisplay = document.getElementById("otpPhoneDisplay");
  if (phoneDisplay) {
    // Mask the phone number for privacy
    const maskedPhone = maskPhoneNumber(phone);
    phoneDisplay.textContent = maskedPhone;
  } else {
    console.error(
      `[${timestamp}] Phone display element not found in OTP modal`
    );
  }

  // Clear any previous OTP inputs
  clearOTPInputs();

  // Show the modal
  document.getElementById("otpVerificationModal").style.display = "flex";
  document.getElementById("otpVerificationModal").style.visibility = "visible";

  // Setup OTP timer
  setupOTPTimer();

  // Setup auto-tabbing for OTP inputs
  setupOTPInputAutoTab();
}

// Enhanced Send OTP via SMS with error handling and timeout management
async function sendPhoneOTP(phone, name) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Generating new OTP for phone: ${phone}`);

  // Generate a fresh OTP
  const otp = generateOTP();
  const expiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now

  // Store OTP data first
  currentOTPData.otp = otp;
  currentOTPData.phone = phone;
  currentOTPData.email = currentOTPData.userData.email; // Keep email for account creation
  currentOTPData.expiryTime = expiryTime;

  console.log(`[${timestamp}] OTP details:`, {
    otp: otp,
    phone: phone,
    expiryTime: new Date(expiryTime).toISOString(),
    expiresIn: `${Math.floor((expiryTime - Date.now()) / 1000 / 60)} minutes`,
  });

  // Store OTP in Firestore first - this is critical for verification
  try {
    await db.collection("phoneVerifications").doc(phone).set({
      otp: otp,
      expiryTime: expiryTime,
      phone: phone,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`[${timestamp}] OTP stored in Firestore successfully`);
  } catch (error) {
    console.error(`[${timestamp}] Error storing OTP in Firestore:`, error);
    // Create a fallback retry mechanism for Firestore
    try {
      console.log(`[${timestamp}] Retrying Firestore storage...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await db.collection("phoneVerifications").doc(phone).set({
        otp: otp,
        expiryTime: expiryTime,
        phone: phone,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[${timestamp}] OTP stored in Firestore on retry`);
    } catch (retryError) {
      console.error(`[${timestamp}] Firestore retry also failed:`, retryError);
      // Continue with SMS sending, but verification might be affected
    }
  }

  // Wait a moment before sending SMS
  await new Promise((resolve) => setTimeout(resolve, 200));

  // In a real implementation, you would integrate with an SMS API service here
  // For this demo, we'll simulate the SMS sending with a console log
  // and show the OTP for testing purposes

  console.log(
    `[${timestamp}] SIMULATION: Sending SMS with OTP ${otp} to ${phone}`
  );

  // IMPORTANT: In a real implementation, you would use an SMS API service like Twilio
  // Here's how you might implement it with Twilio:
  /*
  try {
    // This would call your backend API that connects to Twilio
    const response = await fetch('https://your-api-endpoint/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        message: `Your CiviAlert verification code is: ${otp}. Valid for 5 minutes.`
      })
    });
    
    const result = await response.json();
    if (!result.success) {
      console.error(`[${timestamp}] SMS API error:`, result.error);
      return false;
    }
    console.log(`[${timestamp}] SMS sent successfully via API`);
    return true;
  } catch (error) {
    console.error(`[${timestamp}] Error sending SMS:`, error);
    return false;
  }
  */

  // For demo purposes, show OTP in alert for testing (remove in production)
  alert(
    `For testing purposes, your OTP is: ${otp}\nIn production, this would be sent via SMS to ${phone}`
  );

  // For demo purposes, we'll just return success
  return true;
}

function logout() {
  // Show loading state
  const confirmed = confirm("Are you sure you want to logout?");
  if (!confirmed) return;

  auth
    .signOut()
    .then(() => {
      console.log("User logged out successfully");
      // Clear any OTP data
      currentOTPData = {
        otp: null,
        email: null,
        expiryTime: null,
        timer: null,
        userData: null,
      };

      // Clear any timers
      if (currentOTPData.timer) clearInterval(currentOTPData.timer);
      if (resendTimer) clearInterval(resendTimer);

      // setLoggedIn(false) will be called automatically by onAuthStateChanged
      alert("You have been logged out successfully.");
    })
    .catch((error) => {
      console.error("Logout error:", error);
      alert("Error logging out: " + error.message);
    });
}

// Switch active dashboard tab
function showPage(id, btn) {
  document
    .querySelectorAll(".content")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document
    .querySelectorAll(".nav-btn")
    .forEach((el) => el.classList.remove("active"));
  btn.classList.add("active");
}

// Scroll to a section by ID
function toggleSection(id) {
  const dashboardTabs = ["dashboard", "report", "reports", "settings"];
  // If trying to access report tab and not logged in
  if (id === "report" && !isLoggedIn) {
    showModal("loginModal");
    return;
  }
  if (dashboardTabs.includes(id)) {
    document
      .querySelectorAll(".content")
      .forEach((el) => el.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    document
      .querySelectorAll(".nav-btn")
      .forEach((el) => el.classList.remove("active"));
    const btn = document.querySelector(
      `.dashboard-nav .nav-btn[onclick*="${id}"]`
    );
    if (btn) btn.classList.add("active");
  }
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

// If you want to allow emergency reporting before login, add this to the report form submit handler:
document.addEventListener("DOMContentLoaded", function () {
  const reportForm = document.querySelector("#report form");
  if (reportForm) {
    reportForm.addEventListener("submit", function (e) {
      if (!isLoggedIn) {
        e.preventDefault();
        alert("Please login to submit your report.");
        showModal("loginModal");
      }
    });
  }
});

// Location picker variables and functions (add these missing functions)
let locationPickerMap = null;
let selectedLocationMarker = null;
let selectedCoordinates = null;
let userCurrentLocation = null;
let restrictionCircle = null;
const RESTRICTION_RADIUS = 5000; // 5km in meters

// Open location picker modal
function openLocationPicker() {
  console.log("Opening location picker");
  const modal = document.getElementById("locationPickerModal");
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.error("Location picker modal not found");
  }
}

// Close location picker modal
function closeLocationPicker() {
  const modal = document.getElementById("locationPickerModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Confirm location (placeholder)
function confirmLocation() {
  alert("Location confirmed!");
  closeLocationPicker();
}

// Use marked location (placeholder)
function useMarkedLocation() {
  alert("Marked location used!");
  closeLocationPicker();
}

// My Reports Page Variables
let userReports = [];
let filteredReports = [];
let reportsMap = null;
let currentView = "grid";

// Initialize reports map
function initializeReportsMap() {
  const mapContainer = document.getElementById("reportsMap");
  if (!mapContainer) {
    console.error("Reports map container not found");
    return;
  }

  // Clear any existing map instance
  if (reportsMap) {
    reportsMap.remove();
    reportsMap = null;
  }

  // Wait a bit for the container to be properly rendered
  setTimeout(() => {
    try {
      // Make sure the container is visible and has dimensions
      const containerRect = mapContainer.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) {
        console.warn("Map container has zero dimensions, retrying...");
        setTimeout(() => initializeReportsMap(), 500);
        return;
      }

      console.log(
        "Initializing reports map with container dimensions:",
        containerRect
      );

      reportsMap = L.map("reportsMap").setView([28.6139, 77.209], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(reportsMap);

      // Force map to invalidate size after initialization
      setTimeout(() => {
        if (reportsMap) {
          reportsMap.invalidateSize();
          console.log("Reports map size invalidated");
        }
      }, 100);

      updateMapMarkers();

      // Add current location
      addCurrentLocation(reportsMap);

      console.log("Reports map initialized successfully");
    } catch (error) {
      console.error("Error initializing reports map:", error);
      // Retry after a delay
      setTimeout(() => {
        console.log("Retrying reports map initialization...");
        initializeReportsMap();
      }, 1000);
    }
  }, 200);
}

// Load user reports when My Reports page is shown
function loadUserReports() {
  const user = auth.currentUser;
  if (!user) return;

  console.log("Loading user reports...");

  // Show loading spinner
  document.getElementById("reportsLoadingSpinner").style.display = "flex";
  document.getElementById("noMyReports").style.display = "none";
  document.getElementById("myReportsList").innerHTML = "";

  // Query user's reports from Firestore
  db.collection("reports")
    .where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .get()
    .then((querySnapshot) => {
      userReports = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        userReports.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
        });
      });

      console.log("Loaded reports:", userReports);
      filteredReports = [...userReports];

      // Update stats
      updateReportsStats();

      // Display reports
      displayReports();

      // Initialize map after a small delay to ensure DOM is ready
      setTimeout(() => {
        initializeReportsMap();
      }, 300);
    })
    .catch((error) => {
      console.error("Error loading reports:", error);
      alert("Failed to load reports. Please try again.");
    })
    .finally(() => {
      document.getElementById("reportsLoadingSpinner").style.display = "none";
    });
}

// Update reports statistics
function updateReportsStats() {
  const total = userReports.length;
  const pending = userReports.filter((r) => r.status === "pending").length;
  const resolved = userReports.filter((r) => r.status === "resolved").length;
  const rejected = userReports.filter((r) => r.status === "rejected").length;

  document.getElementById("totalReports").textContent = total;
  document.getElementById("pendingReports").textContent = pending;
  document.getElementById("resolvedReports").textContent = resolved;
  document.getElementById("rejectedReports").textContent = rejected;
}

// Display reports in grid or list view
function displayReports() {
  const container = document.getElementById("myReportsList");
  const noReportsDiv = document.getElementById("noMyReports");

  if (filteredReports.length === 0) {
    container.innerHTML = "";
    noReportsDiv.style.display = "block";
    return;
  }

  noReportsDiv.style.display = "none";

  container.className =
    currentView === "grid" ? "reports-grid" : "reports-list";

  container.innerHTML = filteredReports
    .map(
      (report) => `
    <div class="report-card ${
      currentView === "list" ? "list-view" : ""
    }" onclick="showReportDetails('${report.id}')">
      <div class="report-status ${report.status}">${report.status.replace(
        "_",
        " "
      )}</div>
      <div class="report-title">${report.title}</div>
      <div class="report-description">${report.description}</div>
      <div class="report-meta">
        <div class="report-date">📅 ${formatDate(report.createdAt)}</div>
        <div class="report-location">📍 ${report.location}</div>
      </div>
    </div>
  `
    )
    .join("");
}

// Format date for display
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// Change view between grid and list
function changeReportsView(view) {
  currentView = view;

  // Update button states
  document.querySelectorAll(".view-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-view="${view}"]`).classList.add("active");

  // Re-display reports
  displayReports();
}

// Search reports
function searchReports() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  filteredReports = userReports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm) ||
      report.description.toLowerCase().includes(searchTerm) ||
      report.location.toLowerCase().includes(searchTerm)
  );

  displayReports();
  updateMapMarkers();
}

// Filter reports by status and date
function filterReports() {
  const statusFilter = document.getElementById("statusFilter").value;
  const dateFilter = document.getElementById("dateFilter").value;

  filteredReports = userReports.filter((report) => {
    // Status filter
    if (statusFilter !== "all" && report.status !== statusFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const reportDate = report.createdAt;
      const now = new Date();

      switch (dateFilter) {
        case "today":
          if (reportDate.toDateString() !== now.toDateString()) return false;
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (reportDate < weekAgo) return false;
          break;
        case "month":
          const monthAgo = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate()
          );
          if (reportDate < monthAgo) return false;
          break;
        case "year":
          const yearAgo = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            now.getDate()
          );
          if (reportDate < yearAgo) return false;
          break;
      }
    }

    return true;
  });

  displayReports();
  updateMapMarkers();
}

// Refresh reports
function refreshReports() {
  loadUserReports();
}

// Initialize reports map
function initializeReportsMap() {
  const mapContainer = document.getElementById("reportsMap");
  if (!mapContainer) {
    console.error("Reports map container not found");
    return;
  }

  // Clear any existing map instance
  if (reportsMap) {
    reportsMap.remove();
    reportsMap = null;
  }

  // Wait a bit for the container to be properly rendered
  setTimeout(() => {
    try {
      // Make sure the container is visible and has dimensions
      const containerRect = mapContainer.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) {
        console.warn("Map container has zero dimensions, retrying...");
        setTimeout(() => initializeReportsMap(), 500);
        return;
      }

      console.log(
        "Initializing reports map with container dimensions:",
        containerRect
      );

      reportsMap = L.map("reportsMap").setView([28.6139, 77.209], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(reportsMap);

      // Force map to invalidate size after initialization
      setTimeout(() => {
        if (reportsMap) {
          reportsMap.invalidateSize();
          console.log("Reports map size invalidated");
        }
      }, 100);

      updateMapMarkers();

      // Add current location
      addCurrentLocation(reportsMap);

      console.log("Reports map initialized successfully");
    } catch (error) {
      console.error("Error initializing reports map:", error);
      // Retry after a delay
      setTimeout(() => {
        console.log("Retrying reports map initialization...");
        initializeReportsMap();
      }, 1000);
    }
  }, 200);
}

// Update map markers based on filtered reports
function updateMapMarkers() {
  if (!reportsMap) return;

  // Clear existing markers (except current location)
  reportsMap.eachLayer((layer) => {
    if (layer instanceof L.Marker && !layer.options.isCurrentLocation) {
      reportsMap.removeLayer(layer);
    }
  });

  // Add markers for filtered reports
  filteredReports.forEach((report) => {
    if (report.coordinates) {
      const marker = L.marker([report.coordinates.lat, report.coordinates.lng]);

      // Customize marker based on status
      const statusColors = {
        pending: "#fbbf24",
        in_progress: "#3b82f6",
        resolved: "#10b981",
        rejected: "#ef4444",
      };

      marker.bindPopup(`
        <div style="max-width: 200px;">
          <h4>${report.title}</h4>
          <p>${report.description.substring(0, 100)}${
        report.description.length > 100 ? "..." : ""
      }</p>
          <p><strong>Status:</strong> ${report.status.replace("_", " ")}</p>
          <p><strong>Date:</strong> ${formatDate(report.createdAt)}</p>
        </div>
      `);

      marker.addTo(reportsMap);
    }
  });
}

// Toggle reports map view
function toggleReportsMapView() {
  const container = document.getElementById("reportsMapContainer");
  const toggle = document.getElementById("reportsMapToggle");

  if (container.style.display === "none") {
    container.style.display = "block";
    toggle.textContent = "Hide Map";
    updateMapMarkers();
  } else {
    container.style.display = "none";
    toggle.textContent = "Show Map";
  }
}

// Show report details in modal
function showReportDetails(reportId) {
  const report = userReports.find((r) => r.id === reportId);
  if (!report) return;

  const modalTitle = document.getElementById("reportModalTitle");
  const modalBody = document.getElementById("reportModalBody");

  modalTitle.textContent = report.title;

  modalBody.innerHTML = `
    <div class="report-detail-content">
      <div class="report-detail-field">
        <div class="report-detail-label">Status</div>
        <div class="report-detail-value">
          <span class="report-detail-status ${
            report.status
          }">${report.status.replace("_", " ")}</span>
        </div>
      </div>
      <div class="report-detail-field">
        <div class="report-detail-label">Description</div>
        <div class="report-detail-value">${report.description}</div>
      </div>
      <div class="report-detail-field">
        <div class="report-detail-label">Location</div>
        <div class="report-detail-value">${report.location}</div>
      </div>
      <div class="report-detail-field">
        <div class="report-detail-label">Submitted</div>
        <div class="report-detail-value">${report.createdAt.toLocaleString()}</div>
      </div>
      ${
        report.adminNotes
          ? `
        <div class="report-detail-field">
          <div class="report-detail-label">Admin Notes</div>
          <div class="report-detail-value">${report.adminNotes}</div>
        </div>
      `
          : ""
      }
    </div>
  `;

  // Store current report ID for editing
  document.getElementById("reportDetailModal").dataset.reportId = reportId;

  // Show modal
  document.getElementById("reportDetailModal").style.display = "flex";
}

// Close report detail modal
function closeReportModal() {
  document.getElementById("reportDetailModal").style.display = "none";
}

// Edit current report
function editCurrentReport() {
  const reportId =
    document.getElementById("reportDetailModal").dataset.reportId;
  closeReportModal();

  // Switch to report page and populate with existing data
  showLoggedInPage(
    "report",
    document.querySelector(".sidebar-btn[onclick*=report]")
  );

  // TODO: Implement edit functionality
  alert("Edit functionality will be implemented in the next update.");
}

// Settings functionality
let userSettings = {
  notifications: {
    browser: false,
    location: false,
    email: false,
    radius: 5,
    dailyDigest: false,
    weeklyReport: false,
    statusUpdates: false,
  },
};

// Initialize settings when user logs in
function initializeUserSettings() {
  if (!auth.currentUser) return;

  loadUserSettings();
  setupSettingsEventListeners();
}

function setupSettingsEventListeners() {
  // Password confirmation check
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");

  if (newPassword && confirmPassword) {
    newPassword.addEventListener("input", checkPasswordStrength);
    confirmPassword.addEventListener("input", checkPasswordMatch);
  }

  // Delete confirmation input
  const deleteInput = document.getElementById("deleteConfirmation");
  if (deleteInput) {
    deleteInput.addEventListener("input", function () {
      const confirmBtn = document.getElementById("confirmDeleteBtn");
      if (confirmBtn) {
        confirmBtn.disabled = this.value !== "DELETE";
      }
    });
  }
}

async function loadUserSettings() {
  if (!auth.currentUser) return;

  try {
    // First try to load settings from localStorage for immediate UI update
    try {
      const localSettings = localStorage.getItem("userSettings");
      if (localSettings) {
        const parsedSettings = safeJSONParse(localSettings);
        if (parsedSettings) {
          userSettings = { ...userSettings, ...parsedSettings };
        }
      }
    } catch (localStorageError) {
      console.warn(
        "Could not load settings from localStorage:",
        localStorageError
      );
    }

    // Load user data into profile section
    const userDisplayName = document.getElementById("userDisplayName");
    if (userDisplayName) {
      userDisplayName.textContent =
        auth.currentUser.displayName || "No name set";
    }

    const userEmail = document.getElementById("userEmail");
    if (userEmail) {
      userEmail.textContent = auth.currentUser.email;
    }

    // Format and display join date from Firebase Auth metadata
    const creationTime = auth.currentUser.metadata.creationTime;
    let joinDate = "Unknown";

    if (creationTime) {
      const date = new Date(creationTime);
      joinDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Try to get more accurate date from Firestore user document
    try {
      const userDoc = await db
        .collection("users")
        .doc(auth.currentUser.uid)
        .get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.createdAt && userData.createdAt.toDate) {
          const firestoreDate = userData.createdAt.toDate();
          joinDate = firestoreDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
      }
    } catch (firestoreError) {
      console.warn(
        "Could not load join date from Firestore, using Auth metadata:",
        firestoreError
      );
    }

    const joinDateElement = document.getElementById("joinDate");
    if (joinDateElement) {
      joinDateElement.textContent = joinDate;
    }

    // Update avatar
    const initials = getUserInitials(
      auth.currentUser.displayName,
      auth.currentUser.email
    );

    const userInitialsElement = document.getElementById("userInitials");
    if (userInitialsElement) {
      userInitialsElement.textContent = initials;
    }

    // Load profile form data
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");

    if (profileName) profileName.value = auth.currentUser.displayName || "";
    if (profileEmail) profileEmail.value = auth.currentUser.email || "";

    // Load settings from Firestore
    try {
      const settingsDoc = await db
        .collection("userSettings")
        .doc(auth.currentUser.uid)
        .get();
      if (settingsDoc.exists) {
        const firestoreSettings = settingsDoc.data();
        userSettings = { ...userSettings, ...firestoreSettings };
      }
    } catch (firestoreError) {
      console.warn("Could not load settings from Firestore:", firestoreError);
      // Continue with localStorage settings if available
    }

    updateSettingsUI();
    saveSettingsLocally();
  } catch (error) {
    console.error("Error loading user settings:", error);
    // Set fallback join date
    const joinDateElement = document.getElementById("joinDate");
    if (joinDateElement) {
      joinDateElement.textContent = "Unknown";
    }
    updateSettingsUI(); // Use defaults
  }
}

function updateSettingsUI() {
  // Notifications
  const browserNotifications = document.getElementById("browserNotifications");
  const locationAlerts = document.getElementById("locationAlerts");
  const emailNotifications = document.getElementById("emailNotifications");
  const alertRadius = document.getElementById("alertRadius");
  const radiusDisplay = document.getElementById("radiusDisplay");

  if (browserNotifications)
    browserNotifications.checked = userSettings.notifications.browser;
  if (locationAlerts)
    locationAlerts.checked = userSettings.notifications.location;
  if (emailNotifications)
    emailNotifications.checked = userSettings.notifications.email;
  if (alertRadius) alertRadius.value = userSettings.notifications.radius;
  if (radiusDisplay)
    radiusDisplay.textContent = `${userSettings.notifications.radius} km`;

  // Email settings
  const dailyDigest = document.getElementById("dailyDigest");
  const weeklyReport = document.getElementById("weeklyReport");
  const statusUpdates = document.getElementById("statusUpdates");

  if (dailyDigest) dailyDigest.checked = userSettings.notifications.dailyDigest;
  if (weeklyReport)
    weeklyReport.checked = userSettings.notifications.weeklyReport;
  if (statusUpdates)
    statusUpdates.checked = userSettings.notifications.statusUpdates;

  // Update notification status if the function exists
  if (typeof updateNotificationStatus === "function") {
    updateNotificationStatus();
  }

  // Show/hide conditional settings if the functions exist
  if (typeof toggleLocationSettings === "function") {
    toggleLocationSettings();
  }

  if (typeof toggleEmailSettings === "function") {
    toggleEmailSettings();
  }
}

// Profile Management
function toggleProfileEdit() {
  const form = document.getElementById("profileEditForm");
  if (!form) return;

  const isHidden = form.classList.contains("hidden");

  if (isHidden) {
    form.classList.remove("hidden");
  } else {
    cancelProfileEdit();
  }
}

function cancelProfileEdit() {
  const form = document.getElementById("profileEditForm");
  if (form) {
    form.classList.add("hidden");
    loadUserSettings(); // Reset form to original values
  }
}

async function updateProfile(event) {
  event.preventDefault();

  if (!auth.currentUser) return;

  try {
    const name = document.getElementById("profileName").value.trim();
    const email = document.getElementById("profileEmail").value.trim();
    const phone = document.getElementById("profilePhone").value.trim();

    // Update display name
    if (name !== auth.currentUser.displayName) {
      await auth.currentUser.updateProfile({ displayName: name });
    }

    // Update email if changed
    if (email !== auth.currentUser.email) {
      await auth.currentUser.updateEmail(email);
      showSettingsMessage(
        "Verification email sent to new address. Please verify to complete the change.",
        "info"
      );
    }

    // Update additional data in Firestore
    await db.collection("users").doc(auth.currentUser.uid).set(
      {
        phone: phone,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Refresh user data
    await loadUserSettings();

    // Hide form
    cancelProfileEdit();

    showSettingsMessage("Profile updated successfully!", "success");
  } catch (error) {
    console.error("Error updating profile:", error);
    showSettingsMessage(getErrorMessage(error), "error");
  }
}

// Password Management
function togglePasswordForm() {
  const form = document.getElementById("passwordChangeForm");
  if (!form) return;

  const isHidden = form.classList.contains("hidden");

  if (isHidden) {
    form.classList.remove("hidden");
  } else {
    cancelPasswordChange();
  }
}

function cancelPasswordChange() {
  const form = document.getElementById("passwordChangeForm");
  if (form) {
    form.classList.add("hidden");

    // Clear form
    const passwordForm = document.getElementById("changePasswordForm");
    if (passwordForm) passwordForm.reset();
    clearPasswordValidation();
  }
}

async function changePassword(event) {
  event.preventDefault();

  if (!auth.currentUser) {
    showSettingsMessage("Please log in to change your password.", "error");
    return;
  }

  try {
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Basic validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showSettingsMessage("Please fill in all password fields.", "error");
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      showSettingsMessage("New passwords do not match.", "error");
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      showSettingsMessage(
        "New password must be at least 6 characters long.",
        "error"
      );
      return;
    }

    // Validate password strength
    if (!isPasswordStrong(newPassword)) {
      showSettingsMessage(
        "Please choose a stronger password with uppercase, lowercase, numbers, and special characters.",
        "error"
      );
      return;
    }

    // Show loading state
    const submitBtn = document.querySelector(
      '#changePasswordForm button[type="submit"]'
    );
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = "🔄 Updating Password...";
    submitBtn.disabled = true;

    console.log("Starting password change process...");

    // Re-authenticate user first
    const credential = firebase.auth.EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );

    console.log("Re-authenticating user...");
    await auth.currentUser.reauthenticateWithCredential(credential);
    console.log("Re-authentication successful");

    // Update password
    console.log("Updating password...");
    await auth.currentUser.updatePassword(newPassword);
    console.log("Password updated successfully");

    // Update password change timestamp in Firestore
    try {
      await db.collection("users").doc(auth.currentUser.uid).set(
        {
          passwordLastChanged: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      console.log("Password timestamp updated in Firestore");
    } catch (firestoreError) {
      console.warn(
        "Failed to update password timestamp in Firestore:",
        firestoreError
      );
      // Don't fail the entire process for this
    }

    // Clear form and hide
    cancelPasswordChange();

    // Show success message
    showSettingsMessage(
      "Password updated successfully! Please log in again with your new password.",
      "success"
    );

    // Optional: Force re-login for security
    setTimeout(() => {
      if (
        confirm(
          "For security reasons, you will be logged out. Please log in again with your new password."
        )
      ) {
        logout();
      }
    }, 2000);
  } catch (error) {
    console.error("Error changing password:", error);

    let errorMessage = "Failed to change password: ";
    switch (error.code) {
      case "auth/wrong-password":
        errorMessage = "Current password is incorrect. Please try again.";
        break;
      case "auth/weak-password":
        errorMessage =
          "New password is too weak. Please choose a stronger password.";
        break;
      case "auth/requires-recent-login":
        errorMessage =
          "For security reasons, please log out and log back in before changing your password.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Please try again later.";
        break;
      case "auth/network-request-failed":
        errorMessage =
          "Network error. Please check your connection and try again.";
        break;
      default:
        errorMessage += error.message;
    }

    showSettingsMessage(errorMessage, "error");
  } finally {
    // Reset button state
    const submitBtn = document.querySelector(
      '#changePasswordForm button[type="submit"]'
    );
    if (submitBtn) {
      submitBtn.innerHTML = "🔒 Update Password";
      submitBtn.disabled = false;
    }
  }
}

function checkPasswordStrength() {
  const password = document.getElementById("newPassword").value;
  const strengthBar = document.getElementById("passwordStrength");
  const strengthText = document.getElementById("passwordStrengthText");

  if (!strengthBar || !strengthText) return;

  const strength = calculatePasswordStrength(password);

  // Remove all existing classes and add the new one
  strengthBar.className = "strength-fill";
  if (password.length > 0) {
    strengthBar.classList.add(strength.level);
  }

  strengthText.textContent = strength.text;
  strengthText.style.color = getStrengthColor(strength.level);
}

function checkPasswordMatch() {
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const matchError = document.getElementById("passwordMatch");

  if (!matchError) return;

  if (confirmPassword && newPassword !== confirmPassword) {
    matchError.classList.remove("hidden");
    matchError.textContent = "Passwords do not match";
  } else if (confirmPassword && newPassword === confirmPassword) {
    matchError.classList.add("hidden");
  }
}

function calculatePasswordStrength(password) {
  if (!password) {
    return { level: "weak", text: "Enter a password" };
  }

  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  score = Object.values(checks).filter(Boolean).length;

  switch (score) {
    case 0:
    case 1:
      return { level: "weak", text: "Weak - Add more character types" };
    case 2:
      return { level: "fair", text: "Fair - Add more character types" };
    case 3:
      return { level: "good", text: "Good - Almost there!" };
    case 4:
      return {
        level: "good",
        text: "Good - Consider adding special characters",
      };
    case 5:
      return { level: "strong", text: "Strong - Excellent password!" };
    default:
      return { level: "weak", text: "Password strength" };
  }
}

function isPasswordStrong(password) {
  const strength = calculatePasswordStrength(password);
  return ["good", "strong"].includes(strength.level) && password.length >= 8;
}

function getStrengthColor(level) {
  const colors = {
    weak: "#ef4444",
    fair: "#f59e0b",
    good: "#3b82f6",
    strong: "#10b981",
  };
  return colors[level] || "#6b7280";
}

function clearPasswordValidation() {
  const strengthBar = document.getElementById("passwordStrength");
  const strengthText = document.getElementById("passwordStrengthText");
  const matchError = document.getElementById("passwordMatch");

  if (strengthBar) {
    strengthBar.className = "strength-fill";
  }
  if (strengthText) {
    strengthText.textContent = "Password strength";
    strengthText.style.color = "#6b7280";
  }
  if (matchError) {
    matchError.classList.add("hidden");
  }
}

// Enhanced message display function with better styling
function showSettingsMessage(message, type = "info") {
  const container = document.getElementById("messageContainer");
  if (!container) {
    // Fallback to alert if container not found
    alert(message);
    return;
  }

  // Remove any existing messages
  container.innerHTML = "";

  const messageElement = document.createElement("div");
  messageElement.className = `settings-message ${type}`;

  const iconMap = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  messageElement.innerHTML = `
    <span class="message-icon">${iconMap[type] || "ℹ️"}</span>
    <span class="message-text">${message}</span>
    <button class="message-close" onclick="this.parentElement.remove()">×</button>
  `;

  container.appendChild(messageElement);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.remove();
    }
  }, 5000);

  // Scroll to message
  messageElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Enhanced verify OTP function with improved error handling
async function verifyOTP() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Verify OTP button clicked`);

  // Check if OTP data exists
  if (!currentOTPData || !currentOTPData.otp || !currentOTPData.phone) {
    console.error(`[${timestamp}] Missing OTP data:`, currentOTPData);
    alert("OTP verification session has expired. Please register again.");
    hideModal("otpVerificationModal");
    return;
  }

  const inputs = document.querySelectorAll(".otp-digit");
  if (!inputs || inputs.length === 0) {
    console.error(`[${timestamp}] OTP input fields not found`);
    alert("There was a problem with the verification form. Please try again.");
    return;
  }

  const enteredOTP = Array.from(inputs)
    .map((input) => input.value)
    .join("");

  console.log(`[${timestamp}] Verification attempt details:`, {
    enteredOTP,
    expectedOTP: currentOTPData.otp,
    currentUser: auth.currentUser ? auth.currentUser.email : "No user",
    otpExpiryTime: new Date(currentOTPData.expiryTime).toISOString(),
    currentTime: timestamp,
    timeDifference: `${currentOTPData.expiryTime - Date.now()}ms`,
  });

  if (enteredOTP.length !== 6) {
    console.warn(
      `[${timestamp}] Incomplete OTP entered: ${enteredOTP.length} digits`
    );
    alert("Please enter the complete 6-digit code.");
    return;
  }

  // Show loading state
  const verifyBtn = document.getElementById("verifyOtpBtn");
  if (!verifyBtn) {
    console.error(`[${timestamp}] Verify button not found in DOM`);
    alert(
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
    // Add extra 2-second buffer to expiry time to account for minor timing issues
    const bufferTime = 2000; // 2 seconds in milliseconds

    console.log(`[${timestamp}] Checking OTP expiry:`, {
      currentTime: Date.now(),
      expiryTime: currentOTPData.expiryTime,
      expiryWithBuffer: currentOTPData.expiryTime + bufferTime,
      isExpired: Date.now() > currentOTPData.expiryTime + bufferTime,
    });

    if (Date.now() > currentOTPData.expiryTime + bufferTime) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Verify OTP - always check Firestore first, then fall back to local data
    let isValidOTP = false;
    let firestoreOtpChecked = false;
    let firestoreOtpData = null;

    // Check Firestore first as the source of truth
    try {
      console.log(`[${timestamp}] Checking Firestore for OTP validation`);
      const otpDoc = await db
        .collection("phoneVerifications")
        .doc(currentOTPData.phone)
        .get();
      firestoreOtpChecked = true;

      if (otpDoc.exists) {
        const storedData = otpDoc.data();
        firestoreOtpData = storedData;

        console.log(`[${timestamp}] Firestore OTP validation:`, {
          storedOTP: storedData.otp,
          storedExpiry: new Date(storedData.expiryTime).toISOString(),
          enteredOTP: enteredOTP,
          isMatch: enteredOTP === storedData.otp,
          isNotExpired: Date.now() <= storedData.expiryTime + bufferTime,
        });

        if (
          enteredOTP === storedData.otp &&
          Date.now() <= storedData.expiryTime + bufferTime
        ) {
          isValidOTP = true;
          console.log(
            `[${timestamp}] OTP validated successfully via Firestore`
          );

          // Update local data to match Firestore (in case they're different)
          currentOTPData.otp = storedData.otp;
          currentOTPData.expiryTime = storedData.expiryTime;
        }
      } else {
        console.warn(
          `[${timestamp}] No OTP document found in Firestore for email:`,
          currentOTPData.email
        );
      }
    } catch (firestoreError) {
      console.error(
        `[${timestamp}] Error checking Firestore OTP:`,
        firestoreError
      );
    }

    // If Firestore check failed or didn't validate, try local data as backup
    if (!isValidOTP && !firestoreOtpData && enteredOTP === currentOTPData.otp) {
      console.log(`[${timestamp}] OTP validated via local storage backup`);
      isValidOTP = true;
    }

    if (isValidOTP) {
      console.log(
        `[${timestamp}] OTP verified successfully, proceeding with user verification`
      );

      // Get current user - with retry mechanism
      let user = auth.currentUser;
      let authRetryCount = 0;
      const maxAuthRetries = 2;

      while (!user && authRetryCount < maxAuthRetries) {
        console.log(
          `[${timestamp}] No current user, waiting for auth state... (attempt ${
            authRetryCount + 1
          }/${maxAuthRetries})`
        );
        // Wait for auth state to update
        await new Promise((resolve) => setTimeout(resolve, 1500));
        user = auth.currentUser;
        authRetryCount++;
      }

      if (!user && currentOTPData.userData) {
        // Try to re-authenticate with stored credentials
        console.log(
          `[${timestamp}] Attempting to re-authenticate user with stored credentials`
        );
        try {
          const userCredential = await auth.signInWithEmailAndPassword(
            currentOTPData.userData.email,
            currentOTPData.userData.password
          );
          user = userCredential.user;
          console.log(
            `[${timestamp}] User re-authenticated successfully:`,
            user.email
          );
        } catch (authError) {
          console.error(`[${timestamp}] Re-authentication failed:`, authError);
          throw new Error(
            "Session expired. Please try logging in with your new account."
          );
        }
      }

      if (user) {
        console.log(
          `[${timestamp}] Updating user verification status for:`,
          user.uid
        );

        try {
          // Mark user as verified in Firestore
          await db.collection("users").doc(user.uid).update({
            isVerified: true,
            verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`[${timestamp}] User marked as verified in Firestore`);

          // Update user profile
          await user.updateProfile({
            displayName: currentOTPData.userData
              ? currentOTPData.userData.name
              : user.displayName || user.email,
          });

          console.log(`[${timestamp}] User profile updated`);

          // Delete OTP from Firestore
          if (firestoreOtpChecked) {
            try {
              await db
                .collection("phoneVerifications")
                .doc(currentOTPData.phone)
                .delete();
              console.log(`[${timestamp}] OTP document deleted from Firestore`);
            } catch (deleteError) {
              console.error(
                `[${timestamp}] Error deleting OTP document:`,
                deleteError
              );
              // Don't fail the entire process for this
            }
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

          // Clear form data if they exist
          const nameInput = document.getElementById("regName");
          const emailInput = document.getElementById("regEmail");
          const passwordInput = document.getElementById("regPassword");

          if (nameInput) nameInput.value = "";
          if (emailInput) emailInput.value = "";
          if (passwordInput) passwordInput.value = "";

          // Hide OTP modal
          hideModal("otpVerificationModal");

          // Show success message
          alert("Phone verified successfully! Your account is now active.");

          // Reset OTP data
          currentOTPData = {
            otp: null,
            email: null,
            expiryTime: null,
            timer: null,
            userData: null,
          };
          console.log(`[${timestamp}] OTP data reset`);

          // Refresh the page to ensure all auth state is updated
          console.log(`[${timestamp}] Scheduling page reload`);
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (updateError) {
          console.error(
            `[${timestamp}] Error updating user verification status:`,
            updateError
          );
          throw new Error(
            "Failed to update verification status. Please try logging in again."
          );
        }
      } else {
        console.error(
          `[${timestamp}] No user found after authentication attempts`
        );
        throw new Error(
          "Unable to find user account. Please try logging in with your email and password."
        );
      }
    } else {
      console.warn(`[${timestamp}] Invalid OTP entered:`, enteredOTP);
      throw new Error("Invalid verification code. Please check and try again.");
    }
  } catch (error) {
    console.error(`[${timestamp}] OTP verification error:`, error);
    alert(error.message || "Verification failed. Please try again.");

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
        // Only call this if it exists
        if (typeof checkAllInputsFilled === "function") {
          checkAllInputsFilled(); // This will set the correct disabled state
        }
      }
      console.log(`[${timestamp}] Button state reset`);
    } catch (btnResetError) {
      console.error(
        `[${timestamp}] Error resetting button state:`,
        btnResetError
      );
    }
  }
}

// Notification Settings
async function toggleBrowserNotifications() {
  const enabled = document.getElementById("browserNotifications").checked;

  if (enabled) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        userSettings.notifications.browser = true;
        showSettingsMessage("Browser notifications enabled!", "success");
      } else {
        userSettings.notifications.browser = false;
        document.getElementById("browserNotifications").checked = false;
        showSettingsMessage(
          "Please allow notifications in your browser settings.",
          "error"
        );
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      userSettings.notifications.browser = false;
      document.getElementById("browserNotifications").checked = false;
      showSettingsMessage("Failed to enable notifications.", "error");
    }
  } else {
    userSettings.notifications.browser = false;
    showSettingsMessage("Browser notifications disabled.", "info");
  }

  updateNotificationStatus();
  saveSettings();
}

function toggleLocationAlerts() {
  userSettings.notifications.location =
    document.getElementById("locationAlerts").checked;
  toggleLocationSettings();
  saveSettings();

  if (userSettings.notifications.location) {
    showSettingsMessage("Location-based alerts enabled!", "success");
  } else {
    showSettingsMessage("Location-based alerts disabled.", "info");
  }
}

function toggleEmailNotifications() {
  userSettings.notifications.email =
    document.getElementById("emailNotifications").checked;
  toggleEmailSettings();
  saveSettings();

  if (userSettings.notifications.email) {
    showSettingsMessage("Email notifications enabled!", "success");
  } else {
    showSettingsMessage("Email notifications disabled.", "info");
  }
}

function toggleLocationSettings() {
  const locationSettings = document.getElementById("locationSettings");
  const enabled = document.getElementById("locationAlerts").checked;

  if (locationSettings) {
    if (enabled) {
      locationSettings.classList.remove("hidden");
    } else {
      locationSettings.classList.add("hidden");
    }
  }
}

function toggleEmailSettings() {
  const emailSettings = document.getElementById("emailSettings");
  const enabled = document.getElementById("emailNotifications").checked;

  if (emailSettings) {
    if (enabled) {
      emailSettings.classList.remove("hidden");
    } else {
      emailSettings.classList.add("hidden");
    }
  }
}

function updateRadiusDisplay() {
  const radius = document.getElementById("alertRadius").value;
  const radiusDisplay = document.getElementById("radiusDisplay");

  if (radiusDisplay) {
    radiusDisplay.textContent = `${radius} km`;
  }

  userSettings.notifications.radius = parseInt(radius);
  saveSettings();
}

function updateNotificationStatus() {
  const statusElement = document.getElementById("notificationStatus");
  if (!statusElement) return;

  const hasPermission = Notification.permission === "granted";
  const browserEnabled = userSettings.notifications.browser;

  if (hasPermission && browserEnabled) {
    statusElement.textContent = "Enabled";
    statusElement.className = "status-badge enabled";
  } else if (browserEnabled && !hasPermission) {
    statusElement.textContent = "Permission Required";
    statusElement.className = "status-badge pending";
  } else {
    statusElement.textContent = "Disabled";
    statusElement.className = "status-badge disabled";
  }
}

// Data Management
async function exportUserData() {
  if (!auth.currentUser) return;

  try {
    showSettingsMessage("Preparing your data export...", "info");

    // Collect user data
    const userData = {
      profile: {
        name: auth.currentUser.displayName,
        email: auth.currentUser.email,
        joinDate: auth.currentUser.metadata.creationTime,
      },
      settings: userSettings,
      exportDate: new Date().toISOString(),
    };

    // Get user reports
    try {
      const reportsSnapshot = await db
        .collection("reports")
        .where("userId", "==", auth.currentUser.uid)
        .get();

      userData.reports = reportsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : null,
        };
      });
    } catch (reportsError) {
      console.error("Error fetching reports:", reportsError);
      userData.reports = [];
      userData.reportsError = "Failed to load reports";
    }

    // Download as JSON
    try {
      const dataStr = JSON.stringify(userData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `civialert-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.click();

      URL.revokeObjectURL(url);

      showSettingsMessage("Data exported successfully!", "success");
    } catch (exportError) {
      console.error("Error creating export file:", exportError);
      showSettingsMessage("Failed to create export file.", "error");
    }
  } catch (error) {
    console.error("Error exporting data:", error);
    showSettingsMessage("Failed to export data.", "error");
  }
}

function clearCache() {
  try {
    // Clear specific localStorage keys (you can also use localStorage.clear() if needed)
    try {
      localStorage.removeItem("mapCache");
      localStorage.removeItem("reportCache");
      localStorage.removeItem("userSettings");
    } catch (localStorageError) {
      console.error("Error clearing localStorage:", localStorageError);
    }

    // Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch (sessionStorageError) {
      console.error("Error clearing sessionStorage:", sessionStorageError);
    }

    // Clear Cache Storage
    if ("caches" in window) {
      caches
        .keys()
        .then(function (names) {
          for (let name of names) {
            caches.delete(name);
          }
        })
        .catch(function (cacheError) {
          console.error("Error clearing caches:", cacheError);
        });
    }

    showSettingsMessage("All caches cleared successfully!", "success");
  } catch (error) {
    console.error("Error clearing cache:", error);
    showSettingsMessage("Failed to clear cache.", "error");
  }
}

// Account Deletion
function showDeleteAccountModal() {
  const modal = document.getElementById("deleteAccountModal");
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeDeleteAccountModal() {
  const modal = document.getElementById("deleteAccountModal");
  if (modal) {
    modal.style.display = "none";
  }
  const deleteInput = document.getElementById("deleteConfirmation");
  const confirmBtn = document.getElementById("confirmDeleteBtn");
  if (deleteInput) deleteInput.value = "";
  if (confirmBtn) confirmBtn.disabled = true;
}

async function confirmDeleteAccount() {
  if (!auth.currentUser) return;

  const confirmText = document.getElementById("deleteConfirmation").value;
  if (confirmText !== "DELETE") {
    showSettingsMessage('Please type "DELETE" to confirm.', "error");
    return;
  }

  try {
    // Delete user data from Firestore
    const batch = db.batch();

    // Delete user settings
    batch.delete(db.collection("userSettings").doc(auth.currentUser.uid));

    // Delete user reports
    const reportsSnapshot = await db
      .collection("reports")
      .where("userId", "==", auth.currentUser.uid)
      .get();

    reportsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user profile
    batch.delete(db.collection("users").doc(auth.currentUser.uid));

    await batch.commit();

    // Delete auth account
    await auth.currentUser.delete();

    // Clear local storage
    localStorage.clear();

    // Redirect to home page
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error deleting account:", error);
    showSettingsMessage(getErrorMessage(error), "error");
  }
}

// Settings Persistence
async function saveSettings() {
  saveSettingsLocally();

  if (auth.currentUser) {
    try {
      await db
        .collection("userSettings")
        .doc(auth.currentUser.uid)
        .set(userSettings);
    } catch (error) {
      console.error("Error saving settings to Firestore:", error);
    }
  }
}

function saveSettingsLocally() {
  try {
    localStorage.setItem("userSettings", JSON.stringify(userSettings));
  } catch (error) {
    console.error("Error saving settings locally:", error);
  }
}

// Helper function to safely parse JSON
function safeJSONParse(jsonString, defaultValue = null) {
  if (!jsonString) return defaultValue;

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return defaultValue;
  }
}

// Avatar Upload (placeholder)
function uploadAvatar() {
  showSettingsMessage("Avatar upload feature coming soon!", "info");
}

// Utility Functions
function getErrorMessage(error) {
  const errorMessages = {
    "auth/wrong-password": "Current password is incorrect.",
    "auth/weak-password": "New password is too weak.",
    "auth/email-already-in-use": "Email address is already in use.",
    "auth/invalid-email": "Invalid email address.",
    "auth/requires-recent-login":
      "Please log out and log back in to perform this action.",
  };

  return (
    errorMessages[error.code] ||
    error.message ||
    "An unexpected error occurred."
  );
}

// Enhanced report submission functionality with better validation and database storage:
document.addEventListener("DOMContentLoaded", () => {
  const reportForm = document.querySelector("#loggedInReport form");

  if (reportForm) {
    reportForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Check if user is verified before allowing report submission
      const user = auth.currentUser;
      if (!user) {
        alert("Please login to submit a report.");
        showModal("loginModal");
        return;
      }

      try {
        // Verify user is verified
        const userDoc = await db.collection("users").doc(user.uid).get();
        if (!userDoc.exists || !userDoc.data().isVerified) {
          alert("Please verify your phone number before submitting reports.");
          return;
        }

        // Get form data
        const title = document
          .getElementById("loggedInIncidentTitle")
          .value.trim();
        const category = document.getElementById(
          "loggedInIncidentCategory"
        ).value;
        const description = document
          .getElementById("loggedInIncidentDescription")
          .value.trim();
        const location = document
          .getElementById("loggedInIncidentLocation")
          .value.trim();
        const priority = document.getElementById(
          "loggedInIncidentPriority"
        ).value;
        const allowContact = document.getElementById("allowContact").checked;
        const images = document.getElementById("loggedInIncidentImages").files;

        // Basic validation
        if (!title || !category || !description || !location) {
          alert("Please fill in all required fields.");
          return;
        }

        if (title.length > 100) {
          alert("Title must be 100 characters or less.");
          return;
        }

        if (description.length > 1000) {
          alert("Description must be 1000 characters or less.");
          return;
        }

        // Show loading state
        const submitBtn = document.getElementById("submitReportBtn");
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = "⏳ Submitting Report...";
        submitBtn.disabled = true;

        console.log("Starting report submission...");

        // Prepare report data
        const reportData = {
          title,
          category,
          description,
          location,
          priority,
          allowContact,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || "Anonymous",
          status: "pending",
          views: 0,
          likes: 0,
          coordinates: selectedCoordinates || null, // From location picker if used
          imageUrls: [], // Will be populated if images are uploaded
        };

        // Handle image uploads if any
        if (images && images.length > 0) {
          if (images.length > 5) {
            alert("Maximum 5 images allowed.");
            return;
          }

          // Check file sizes
          for (let file of images) {
            if (file.size > 10 * 1024 * 1024) {
              // 10MB limit
              alert(`File ${file.name} is too large. Maximum size is 10MB.`);
              return;
            }
          }

          console.log("Uploading images...");
          reportData.imageUrls = await uploadReportImages(images, user.uid);
          console.log("Images uploaded successfully:", reportData.imageUrls);
        }

        // Submit to Firestore
        console.log("Submitting report to Firestore...");
        const docRef = await db.collection("reports").add(reportData);
        console.log("Report submitted successfully with ID:", docRef.id);

        // Update report with its own ID for easier referencing
        await docRef.update({ reportId: docRef.id });

        // Show success message
        alert(
          "Report submitted successfully! Thank you for helping make your community safer."
        );

        // Clear the form
        clearReportForm();

        // Reset location picker data
        selectedCoordinates = null;

        // Optionally redirect to reports page
        setTimeout(() => {
          showLoggedInPage(
            "reports",
            document.querySelector('.sidebar-btn[onclick*="reports"]')
          );
        }, 1000);
      } catch (error) {
        console.error("Error submitting report:", error);
        alert("Failed to submit report. Please try again.");
      } finally {
        // Reset button state
        const submitBtn = document.getElementById("submitReportBtn");
        if (submitBtn) {
          submitBtn.innerHTML = "📝 Submit Report";
          submitBtn.disabled = false;
        }
      }
    });
  }
});

// Upload images to Firebase Storage (if you have it configured)
async function uploadReportImages(files, userId) {
  const imageUrls = [];

  // Note: This requires Firebase Storage to be configured
  // For now, we'll just return empty array and store image info in a different way
  try {
    // If Firebase Storage is configured, upload images here
    // For this example, we'll simulate the upload
    console.log("Image upload feature requires Firebase Storage configuration");

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real implementation, you would:
    // 1. Create references to Firebase Storage
    // 2. Upload each file
    // 3. Get download URLs
    // 4. Return the URLs

    return imageUrls;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw new Error("Failed to upload images");
  }
}

// Clear report form
function clearReportForm() {
  const form = document.getElementById("reportIncidentForm");
  if (form) {
    form.reset();

    // Reset character count
    const charCount = document.getElementById("charCount");
    if (charCount) charCount.textContent = "0";

    // Clear location picker data
    selectedCoordinates = null;

    // Reset any visual indicators
    const locationInput = document.getElementById("loggedInIncidentLocation");
    if (locationInput) {
      locationInput.style.color = "";
      locationInput.style.fontWeight = "";
    }
  }
}

// Character counter for description
document.addEventListener("DOMContentLoaded", () => {
  const descriptionTextarea = document.getElementById(
    "loggedInIncidentDescription"
  );
  const charCount = document.getElementById("charCount");

  if (descriptionTextarea && charCount) {
    descriptionTextarea.addEventListener("input", () => {
      const currentLength = descriptionTextarea.value.length;
      charCount.textContent = currentLength;

      // Change color as approaching limit
      if (currentLength > 900) {
        charCount.style.color = "#ef4444";
      } else if (currentLength > 800) {
        charCount.style.color = "#f59e0b";
      } else {
        charCount.style.color = "#6b7280";
      }
    });
  }

  // Old report form handling (for logged out users)
  const reportForm = document.querySelector("#report form");
  if (reportForm) {
    reportForm.addEventListener("submit", function (e) {
      if (!isLoggedIn) {
        e.preventDefault();
        alert("Please login to submit your report.");
        showModal("loginModal");
      }
    });
  }
});

// Enhanced location picker integration
function confirmLocation() {
  if (userCurrentLocation) {
    selectedCoordinates = userCurrentLocation;
    const locationInput = document.getElementById("loggedInIncidentLocation");
    if (locationInput) {
      locationInput.value = `Current Location (${userCurrentLocation.lat.toFixed(
        6
      )}, ${userCurrentLocation.lng.toFixed(6)})`;
      locationInput.style.color = "#1abc9c";
      locationInput.style.fontWeight = "600";
    }
    closeLocationPicker();
    alert("Current location selected successfully!");
  } else {
    alert(
      "Unable to get current location. Please try again or enter location manually."
    );
  }
}

function useMarkedLocation() {
  if (selectedCoordinates) {
    const locationInput = document.getElementById("loggedInIncidentLocation");
    if (locationInput) {
      locationInput.value = `Selected Location (${selectedCoordinates.lat.toFixed(
        6
      )}, ${selectedCoordinates.lng.toFixed(6)})`;
      locationInput.style.color = "#e74c3c";
      locationInput.style.fontWeight = "600";
    }
    closeLocationPicker();
    alert("Selected location confirmed!");
  } else {
    alert("Please click on the map to select a location first.");
  }
}

// Dashboard functionality with enhanced error handling
let dashboardData = {
  stats: {},
  recentActivity: [],
  categories: {},
  allReports: [],
};

let dashboardRetryCount = 0;
const MAX_DASHBOARD_RETRIES = 3;
const DASHBOARD_RETRY_DELAY = 2000; // 2 seconds

// Load dashboard data when dashboard page is shown
function loadDashboardData() {
  const user = auth.currentUser;
  if (!user) {
    showDashboardError("Please log in to view dashboard data.", "auth");
    return;
  }

  console.log("Loading dashboard data...");

  // Show loading state
  showDashboardLoading(true);
  clearDashboardErrors();

  // Reset retry count for new load attempt
  dashboardRetryCount = 0;

  // Load all data in parallel for better performance
  Promise.all([
    loadDashboardStatsWithRetry(),
    loadRecentActivityWithRetry(),
    loadCategoryDataWithRetry(),
    loadAllReportsWithRetry(),
  ])
    .then(() => {
      console.log("Dashboard data loaded successfully");
      updateDashboardUI();
      showDashboardLoading(false);
      showDashboardSuccess("Dashboard data loaded successfully!");
    })
    .catch((error) => {
      console.error("Error loading dashboard data:", error);
      showDashboardLoading(false);

      // Determine error type and show appropriate message
      if (error.code === "permission-denied") {
        showDashboardError(
          "Access denied. Please check your permissions.",
          "permission"
        );
      } else if (error.code === "unavailable") {
        showDashboardError(
          "Service temporarily unavailable. Retrying...",
          "network"
        );
        retryDashboardLoad();
      } else if (error.message.includes("network")) {
        showDashboardError(
          "Network connection issue. Please check your internet connection.",
          "network"
        );
      } else {
        showDashboardError(
          "Failed to load dashboard data. Please try refreshing the page.",
          "general"
        );
      }
    });
}

// Retry mechanism for dashboard loading
function retryDashboardLoad() {
  if (dashboardRetryCount < MAX_DASHBOARD_RETRIES) {
    dashboardRetryCount++;
    console.log(
      `Retrying dashboard load attempt ${dashboardRetryCount}/${MAX_DASHBOARD_RETRIES}`
    );

    showDashboardMessage(
      `Retrying... (${dashboardRetryCount}/${MAX_DASHBOARD_RETRIES})`,
      "info"
    );

    setTimeout(() => {
      loadDashboardData();
    }, DASHBOARD_RETRY_DELAY * dashboardRetryCount); // Exponential backoff
  } else {
    showDashboardError(
      "Failed to load dashboard after multiple attempts. Please refresh the page or try again later.",
      "critical"
    );
  }
}

// Load basic statistics with error handling
async function loadDashboardStatsWithRetry() {
  try {
    return await loadDashboardStats();
  } catch (error) {
    console.error("Error loading dashboard stats:", error);

    // Set default stats on error
    dashboardData.stats = {
      totalReports: 0,
      pendingReports: 0,
      resolvedReports: 0,
      myReports: 0,
      totalReportsThisWeek: 0,
      pendingReportsNew: 0,
      resolvedReportsThisWeek: 0,
      myReportsThisWeek: 0,
    };

    // Re-throw with more context
    throw new Error(`Failed to load statistics: ${error.message}`);
  }
}

// Load basic statistics
async function loadDashboardStats() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 30000); // 30 second timeout
    });

    // Get all reports for community stats with timeout
    const allReportsPromise = db
      .collection("reports")
      .orderBy("createdAt", "desc")
      .limit(1000)
      .get();

    const allReportsSnapshot = await Promise.race([
      allReportsPromise,
      timeoutPromise,
    ]);

    if (!allReportsSnapshot || allReportsSnapshot.empty) {
      console.warn("No community reports found");
      dashboardData.allReports = [];
    } else {
      // Process all reports
      const allReports = [];
      allReportsSnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          const report = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          };
          allReports.push(report);
        } catch (docError) {
          console.warn("Error processing report document:", doc.id, docError);
        }
      });
      dashboardData.allReports = allReports;
    }

    // Get user's reports with timeout
    const userReportsPromise = db
      .collection("reports")
      .where("userId", "==", user.uid)
      .get();

    const userReportsSnapshot = await Promise.race([
      userReportsPromise,
      timeoutPromise,
    ]);

    const userReports = [];
    if (userReportsSnapshot && !userReportsSnapshot.empty) {
      userReportsSnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          const report = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          };
          userReports.push(report);
        } catch (docError) {
          console.warn(
            "Error processing user report document:",
            doc.id,
            docError
          );
        }
      });
    }

    // Calculate statistics safely
    const allReports = dashboardData.allReports || [];
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalReports = allReports.length;
    const pendingReports = allReports.filter(
      (r) => r.status === "pending"
    ).length;
    const resolvedReports = allReports.filter(
      (r) => r.status === "resolved"
    ).length;
    const myReports = userReports.length;

    // Calculate weekly changes safely
    const totalReportsThisWeek = allReports.filter((r) => {
      try {
        return r.createdAt && r.createdAt >= oneWeekAgo;
      } catch (e) {
        return false;
      }
    }).length;

    const pendingReportsNew = allReports.filter((r) => {
      try {
        return (
          r.status === "pending" && r.createdAt && r.createdAt >= oneWeekAgo
        );
      } catch (e) {
        return false;
      }
    }).length;

    const resolvedReportsThisWeek = allReports.filter((r) => {
      try {
        return (
          r.status === "resolved" &&
          r.updatedAt &&
          r.updatedAt.toDate() >= oneWeekAgo
        );
      } catch (e) {
        return false;
      }
    }).length;

    const myReportsThisWeek = userReports.filter((r) => {
      try {
        return r.createdAt && r.createdAt >= oneWeekAgo;
      } catch (e) {
        return false;
      }
    }).length;

    dashboardData.stats = {
      totalReports,
      pendingReports,
      resolvedReports,
      myReports,
      totalReportsThisWeek,
      pendingReportsNew,
      resolvedReportsThisWeek,
      myReportsThisWeek,
    };

    console.log("Dashboard stats loaded successfully:", dashboardData.stats);
  } catch (error) {
    console.error("Error in loadDashboardStats:", error);

    // Enhance error with more context
    if (error.code === "permission-denied") {
      throw new Error("Permission denied: Unable to access reports data");
    } else if (error.code === "unavailable") {
      throw new Error("Service unavailable: Database temporarily unavailable");
    } else if (error.message.includes("timeout")) {
      throw new Error("Request timeout: Database took too long to respond");
    } else {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}

// Load recent activity with error handling
async function loadRecentActivityWithRetry() {
  try {
    return await loadRecentActivity();
  } catch (error) {
    console.error("Error loading recent activity:", error);
    dashboardData.recentActivity = []; // Set empty array on error
    throw new Error(`Failed to load recent activity: ${error.message}`);
  }
}

// Load recent activity
async function loadRecentActivity() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 15000); // 15 second timeout
    });

    const recentPromise = db
      .collection("reports")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const recentSnapshot = await Promise.race([recentPromise, timeoutPromise]);

    const recentActivity = [];
    if (recentSnapshot && !recentSnapshot.empty) {
      recentSnapshot.forEach((doc) => {
        try {
          const data = doc.data();
          if (data && data.title) {
            // Basic validation
            recentActivity.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
              isMyReport: data.userId === user.uid,
            });
          }
        } catch (docError) {
          console.warn(
            "Error processing recent activity document:",
            doc.id,
            docError
          );
        }
      });
    }

    dashboardData.recentActivity = recentActivity;
    console.log(
      "Recent activity loaded successfully:",
      recentActivity.length,
      "items"
    );
  } catch (error) {
    console.error("Error in loadRecentActivity:", error);
    throw error;
  }
}

// Load category breakdown data with error handling
async function loadCategoryDataWithRetry() {
  try {
    return await loadCategoryData();
  } catch (error) {
    console.error("Error loading category data:", error);
    dashboardData.categories = {}; // Set empty object on error
    throw new Error(`Failed to load category data: ${error.message}`);
  }
}

// Load category breakdown data
async function loadCategoryData() {
  try {
    const reports = dashboardData.allReports || [];
    const categories = {};

    // Count reports by category safely
    reports.forEach((report) => {
      try {
        const category = report.category || "other";
        const status = report.status || "pending";

        if (!categories[category]) {
          categories[category] = {
            total: 0,
            pending: 0,
            resolved: 0,
            rejected: 0,
          };
        }

        categories[category].total++;
        categories[category][status] = (categories[category][status] || 0) + 1;
      } catch (reportError) {
        console.warn(
          "Error processing report for categories:",
          report.id,
          reportError
        );
      }
    });

    dashboardData.categories = categories;
    console.log(
      "Category data loaded successfully:",
      Object.keys(categories).length,
      "categories"
    );
  } catch (error) {
    console.error("Error in loadCategoryData:", error);
    throw error;
  }
}

// Load all reports for map display with error handling
async function loadAllReportsWithRetry() {
  try {
    return await loadAllReports();
  } catch (error) {
    console.error("Error loading all reports:", error);
    // This function doesn't do much, so we can safely ignore errors
    return Promise.resolve();
  }
}

// Load all reports for map display
async function loadAllReports() {
  // This is already done in loadDashboardStats, so we just ensure the data is available
  if (!dashboardData.allReports) {
    dashboardData.allReports = [];
  }
  return Promise.resolve();
}

// Update dashboard UI with loaded data and error handling
function updateDashboardUI() {
  try {
    updateDashboardStats();
    updateRecentActivity();
    updateCategoryDisplay();
    updateDashboardMap();
  } catch (error) {
    console.error("Error updating dashboard UI:", error);
    showDashboardError(
      "Error displaying dashboard data. Some sections may not load properly.",
      "display"
    );
  }
}

// Update statistics display with error handling
function updateDashboardStats() {
  try {
    const stats = dashboardData.stats || {};

    // Safely update main numbers with fallbacks
    const dashTotalReports = document.getElementById("dashTotalReports");
    const dashPendingReports = document.getElementById("dashPendingReports");
    const dashResolvedReports = document.getElementById("dashResolvedReports");
    const dashMyReports = document.getElementById("dashMyReports");

    if (dashTotalReports)
      dashTotalReports.textContent = stats.totalReports || 0;
    if (dashPendingReports)
      dashPendingReports.textContent = stats.pendingReports || 0;
    if (dashResolvedReports)
      dashResolvedReports.textContent = stats.resolvedReports || 0;
    if (dashMyReports) dashMyReports.textContent = stats.myReports || 0;

    // Safely update change indicators
    const totalReportsChange = document.getElementById("totalReportsChange");
    const pendingReportsChange = document.getElementById(
      "pendingReportsChange"
    );
    const resolvedReportsChange = document.getElementById(
      "resolvedReportsChange"
    );
    const myReportsChange = document.getElementById("myReportsChange");

    if (totalReportsChange)
      totalReportsChange.textContent = `+${
        stats.totalReportsThisWeek || 0
      } this week`;
    if (pendingReportsChange)
      pendingReportsChange.textContent = `+${stats.pendingReportsNew || 0} new`;
    if (resolvedReportsChange)
      resolvedReportsChange.textContent = `+${
        stats.resolvedReportsThisWeek || 0
      } resolved`;
    if (myReportsChange)
      myReportsChange.textContent = `+${
        stats.myReportsThisWeek || 0
      } submitted`;
  } catch (error) {
    console.error("Error updating dashboard stats:", error);
    // Set fallback values
    document.querySelectorAll(".stat-content h3").forEach((el) => {
      if (!el.textContent || el.textContent === "NaN") {
        el.textContent = "0";
      }
    });
  }
}

// Update recent activity display with error handling
function updateRecentActivity() {
  const activityList = document.getElementById("recentActivityList");
  if (!activityList) return;

  try {
    const activities = dashboardData.recentActivity || [];

    if (activities.length === 0) {
      activityList.innerHTML = `
        <div class="no-activity">
          <p>No recent activity to display</p>
        </div>
      `;
      return;
    }

    activityList.innerHTML = activities
      .map((activity) => {
        try {
          // Safely get activity properties
          const title = activity.title || "Untitled Report";
          const status = activity.status || "pending";
          const category = activity.category || "other";
          const createdAt = activity.createdAt || new Date();
          const isMyReport = activity.isMyReport || false;

          return `
          <div class="activity-item ${isMyReport ? "my-activity" : ""}">
            <div class="activity-icon ${status}">
              ${getActivityIcon(category)}
            </div>
            <div class="activity-content">
              <div class="activity-title">${title}</div>
              <div class="activity-meta">
                <span class="activity-status ${status}">${status.replace(
            "_",
            " "
          )}</span>
                <span class="activity-time">${formatTimeAgo(createdAt)}</span>
                ${
                  isMyReport
                    ? '<span class="my-report-badge">Your Report</span>'
                    : ""
                }
              </div>
            </div>
          </div>
        `;
        } catch (itemError) {
          console.warn(
            "Error rendering activity item:",
            activity.id,
            itemError
          );
          return ""; // Skip invalid items
        }
      })
      .filter((item) => item.length > 0)
      .join("");
  } catch (error) {
    console.error("Error updating recent activity:", error);
    activityList.innerHTML = `
      <div class="activity-error">
        <p>Unable to load recent activity</p>
      </div>
    `;
  }
}

// Update category display with error handling
function updateCategoryDisplay() {
  const categoriesGrid = document.getElementById("categoriesGrid");
  if (!categoriesGrid) return;

  try {
    const categories = dashboardData.categories || {};

    if (Object.keys(categories).length === 0) {
      categoriesGrid.innerHTML = `
        <div class="no-categories">
          <p>No category data available</p>
        </div>
      `;
      return;
    }

    const categoryNames = {
      road_safety: "Road Safety",
      infrastructure: "Infrastructure",
      public_safety: "Public Safety",
      environmental: "Environmental",
      utilities: "Utilities",
      other: "Other",
    };

    categoriesGrid.innerHTML = Object.entries(categories)
      .map(([category, data]) => {
        try {
          const displayName = categoryNames[category] || category;
          const total = data.total || 0;
          const pending = data.pending || 0;
          const resolved = data.resolved || 0;

          return `
          <div class="category-card">
            <div class="category-header">
              <h4>${displayName}</h4>
              <span class="category-total">${total}</span>
            </div>
            <div class="category-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">Pending</span>
                <span class="breakdown-value pending">${pending}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Resolved</span>
                <span class="breakdown-value resolved">${resolved}</span>
              </div>
            </div>
          </div>
        `;
        } catch (categoryError) {
          console.warn("Error rendering category:", category, categoryError);
          return ""; // Skip invalid categories
        }
      })
      .filter((item) => item.length > 0)
      .join("");
  } catch (error) {
    console.error("Error updating category display:", error);
    categoriesGrid.innerHTML = `
      <div class="categories-error">
        <p>Unable to load category data</p>
      </div>
    `;
  }
}

// Enhanced error display functions
function showDashboardError(message, type = "general") {
  const container =
    document.getElementById("messageContainer") || createMessageContainer();

  // Remove any existing error messages
  const existingErrors = container.querySelectorAll(".dashboard-error");
  existingErrors.forEach((error) => error.remove());

  const errorElement = document.createElement("div");
  errorElement.className = `dashboard-error error-${type}`;

  const iconMap = {
    auth: "🔒",
    permission: "⛔",
    network: "🌐",
    critical: "⚠️",
    display: "🖥️",
    general: "❌",
  };

  errorElement.innerHTML = `
    <div class="error-content">
      <span class="error-icon">${iconMap[type] || "❌"}</span>
      <span class="error-text">${message}</span>
      <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    ${
      type === "network" || type === "critical"
        ? `
      <div class="error-actions">
        <button class="retry-btn" onclick="refreshDashboard()">🔄 Retry</button>
      </div>
    `
        : ""
    }
  `;

  container.appendChild(errorElement);

  // Auto-remove after 10 seconds for non-critical errors
  if (type !== "critical") {
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.remove();
      }
    }, 10000);
  }
}

function showDashboardSuccess(message) {
  const container =
    document.getElementById("messageContainer") || createMessageContainer();

  const successElement = document.createElement("div");
  successElement.className = "dashboard-success";

  successElement.innerHTML = `
    <div class="success-content">
      <span class="success-icon">✅</span>
      <span class="success-text">${message}</span>
      <button class="success-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;

  container.appendChild(successElement);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (successElement.parentNode) {
      successElement.remove();
    }
  }, 3000);
}

function clearDashboardErrors() {
  const container = document.getElementById("messageContainer");
  if (container) {
    const errors = container.querySelectorAll(".dashboard-error");
    errors.forEach((error) => error.remove());
  }
}

function createMessageContainer() {
  let container = document.getElementById("messageContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "messageContainer";
    container.className = "message-container";
    document.body.appendChild(container);
  }
  return container;
}

// Enhanced refresh dashboard with better error handling
async function refreshDashboard() {
  const refreshBtn = document.getElementById("refreshDashboardBtn");
  if (!refreshBtn) return;

  const originalText = refreshBtn.innerHTML;

  refreshBtn.innerHTML = "🔄 Refreshing...";
  refreshBtn.disabled = true;

  try {
    // Clear any existing errors
    clearDashboardErrors();

    // Reset retry count for manual refresh
    dashboardRetryCount = 0;

    await loadDashboardData();
  } catch (error) {
    console.error("Error refreshing dashboard:", error);
    showDashboardError(
      "Failed to refresh dashboard data. Please try again.",
      "general"
    );
  } finally {
    refreshBtn.innerHTML = originalText;
    refreshBtn.disabled = false;
  }
}

let realTimeMapInstance = null;
let realTimeMapInitialized = false;

function toggleRealTimeMap() {
  const mapContainer = document.getElementById("realTimeMapContainer");
  const toggleBtn = document.getElementById("dashboardMapToggleBtn");

  if (mapContainer.style.display === "none") {
    mapContainer.style.display = "block";
    toggleBtn.querySelector(".action-text").textContent = "Hide Map";

    if (!realTimeMapInitialized) {
      realTimeMapInstance = L.map("realTimeMap").setView([28.6139, 77.209], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(realTimeMapInstance);

      // Add current location
      navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          realTimeMapInstance.setView([lat, lng], 15);

          const marker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: "current-location-marker",
              html: '<div class="location-dot"></div>',
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
          }).addTo(realTimeMapInstance);

          marker
            .bindPopup(
              `Your current location (Accuracy: ${Math.round(accuracy)}m)`
            )
            .openPopup();
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Failed to access your location.");
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 10000,
        }
      );

      realTimeMapInitialized = true;
    } else {
      // If map already initialized, just resize to fit
      setTimeout(() => realTimeMapInstance.invalidateSize(), 200);
    }
  } else {
    mapContainer.style.display = "none";
    toggleBtn.querySelector(".action-text").textContent = "View Map";
  }
}
