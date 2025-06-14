// This file serves as a bridge between ES modules and global functions
// needed by HTML onclick attributes

// Placeholder functions that will be replaced by the real ones
window.showModal = function(id) {
  console.log('showModal called with id:', id);
  // This is just a fallback in case the main script hasn't loaded yet
  setTimeout(() => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'flex';
      modal.style.visibility = 'visible';
    } else {
      console.error('Modal with ID', id, 'not found');
    }
  }, 100);
};

window.hideModal = function(id) {
  console.log('hideModal called with id:', id);
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
  }
};

// Other placeholder functions
window.logout = function() {
  console.log('logout function called');
};

window.scrollToTop = function() {
  console.log('scrollToTop function called');
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.showLoggedInPage = function(page, btn) {
  console.log('showLoggedInPage called with page:', page);
};

window.toggleUserDropdown = function() {
  console.log('toggleUserDropdown function called');
};

window.showMap = function() {
  console.log('showMap function called');
};

window.refreshDashboard = function() {
  console.log('refreshDashboard function called');
};

window.closeLocationPicker = function() {
  console.log('closeLocationPicker function called');
};

window.closeReportModal = function() {
  console.log('closeReportModal function called');
};

window.closeDeleteAccountModal = function() {
  console.log('closeDeleteAccountModal function called');
};

console.log('Global functions initialized');