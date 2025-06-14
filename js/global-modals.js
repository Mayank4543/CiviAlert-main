// Global functions for modals and map functionality
window.showModal = function (id) {
  document.getElementById(id).style.display = "flex";
};

window.hideModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = "none";
  }
};

// Map function defined globally
window.showMap = function () {
  let mapSection, mapId;
  if (window.isLoggedIn) {
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

  const mapKey = window.isLoggedIn
    ? "loggedInMapInitialized"
    : "mainMapInitialized";
  if (!window[mapKey]) {
    // The rest of the map initialization will be handled by the script.js file
    // This just makes the function globally available
  }
};
