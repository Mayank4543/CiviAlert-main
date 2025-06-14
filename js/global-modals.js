// Modal functions defined globally
window.showModal = function (id) {
  document.getElementById(id).style.display = "flex";
};

window.hideModal = function (id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.style.display = "none";
  }
};
