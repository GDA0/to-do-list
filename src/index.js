// Import our custom CSS
import "./index.scss";

document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.querySelector(".sidebar");
  const sidebarToggle = document.querySelector(".sidebar-toggle");

  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("sidebar-closed");
  });
});
