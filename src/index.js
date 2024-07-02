// Import our custom CSS
import './index.scss'

document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.querySelector('.sidebar')
  const sidebarToggler = document.querySelector('.sidebar-toggler')
  const mainContents = document.querySelector('.main-contents')

  sidebarToggler.addEventListener('click', function () {
    sidebar.classList.toggle('sidebar-hide')
    mainContents.classList.toggle('full-width')
  })
})
