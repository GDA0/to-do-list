export default class UI {
  constructor() {
    this.sidebar = document.querySelector(".sidebar");
    this.sidebarToggler = document.querySelector(".sidebar-toggler");
    this.mainContents = document.querySelector(".main-contents");

    this.sidebarToggler.addEventListener("click", () => {
      this.sidebar.classList.toggle("sidebar-hide");
      this.mainContents.classList.toggle("full-width");
    });
  }
}
