import Storage from '../utils/storage'
import Task from '../models/task'
import Project from '../models/project'

export default class UI {
  static initialize () {
    this.sidebar = document.querySelector('.sidebar')
    this.sidebarToggler = document.querySelector('.sidebar-toggler')
    this.mainContents = document.querySelector('.main-contents')
    this.addTaskForm = document.querySelector('.add-task-form')
    this.addProjectForm = document.querySelector('.add-project-form')
    this.addTaskBtn = document.querySelector('.add-task-btn')
    this.parentProjectSelect = document.querySelector('.parent-project-select')

    this.addEventListeners()
  }

  static addEventListeners () {
    this.sidebarToggler.addEventListener('click', () => this.toggleSidebar())
    this.addTaskForm.addEventListener('submit', (event) =>
      this.handleTaskFormSubmit(event)
    )
    this.addProjectForm.addEventListener('submit', (event) =>
      this.handleProjectFormSubmit(event)
    )
    this.addTaskBtn.addEventListener('click', () =>
      this.populateParentProjectSelect()
    )
  }

  static toggleSidebar () {
    this.sidebar.classList.toggle('sidebar-hide')
    this.mainContents.classList.toggle('full-width')
  }

  static handleTaskFormSubmit (event) {
    event.preventDefault()

    if (this.addTaskForm.checkValidity()) {
      const name = this.addTaskForm.querySelector('#name').value
      const description = this.addTaskForm.querySelector('#description').value
      const dueDate = this.addTaskForm.querySelector('#due-date').value
      const priority = this.addTaskForm.querySelector('#priority').value
      const parentProjectId =
        +this.addTaskForm.querySelector('#parent-project-id').value

      const newTask = new Task(
        name,
        description,
        dueDate,
        priority,
        parentProjectId
      )
      Storage.addTaskToProject(newTask, parentProjectId)

      this.addTaskForm.reset()
      this.addTaskForm.classList.remove('was-validated')
    } else {
      event.stopPropagation()
      this.addTaskForm.classList.add('was-validated')
    }
  }

  static handleProjectFormSubmit (event) {
    event.preventDefault()

    if (this.addProjectForm.checkVisibility()) {
      const name = this.addProjectForm.querySelector('#name').value
      const newProject = new Project(name)
      Storage.addProject(newProject)

      this.addProjectForm.reset()
      this.addProjectForm.classList.remove('was-validated')
    } else {
      event.stopPropagation()
      this.addProjectForm.classList.add('was-validated')
    }
  }

  static populateParentProjectSelect () {
    const projects = Storage.getProjects()
    this.parentProjectSelect.innerHTML = ''

    projects
      .filter((project) => ![2, 3, 4, 5].includes(project.id))
      .forEach((project) => {
        const option = document.createElement('option')
        option.value = project.id.toString()
        option.textContent =
          project.name.length > 30
            ? project.name.slice(0, 30) + '...'
            : project.name
        if (project.id === 1) {
          option.selected = true
        }
        this.parentProjectSelect.appendChild(option)
      })
  }
}
