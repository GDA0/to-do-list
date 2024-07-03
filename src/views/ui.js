import Storage from '../utils/storage'
import Task from '../models/task'
import Project from '../models/project'

export default class UI {
  constructor () {
    this.sidebar = document.querySelector('.sidebar')
    this.sidebarToggler = document.querySelector('.sidebar-toggler')
    this.mainContents = document.querySelector('.main-contents')
    this.addTaskForm = document.querySelector('.add-task-form')
    this.addProjectForm = document.querySelector('.add-project-form')

    this.sidebarToggler.addEventListener('click', () => {
      this.sidebar.classList.toggle('sidebar-hide')
      this.mainContents.classList.toggle('full-width')
    })

    this.addTaskForm.addEventListener('submit', (event) => {
      event.preventDefault()

      if (this.addTaskForm.checkValidity()) {
        const name = this.addTaskForm.querySelector('#name').value
        const description =
          this.addTaskForm.querySelector('#description').value
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
    })

    this.addProjectForm.addEventListener('submit', (event) => {
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
    })
  }
}
