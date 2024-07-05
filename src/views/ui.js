import Storage from '../utils/storage'
import Task from '../models/task'
import Project from '../models/project'
import * as bootstrap from 'bootstrap'

export default class UI {
  static initialize () {
    this.addEventListeners()
  }

  static addEventListeners () {
    const sidebarToggler = document.querySelector('.sidebar-toggler')
    const addTaskForm = document.querySelector('.add-task-form')
    const addProjectForm = document.querySelector('.add-project-form')
    const addTaskBtn = document.querySelector('.add-task-btn')
    const projectBtns = document.querySelectorAll('.project-btn')

    sidebarToggler.addEventListener('click', () => this.toggleSidebar())
    addTaskForm.addEventListener('submit', (event) =>
      this.handleTaskFormSubmit(event)
    )
    addProjectForm.addEventListener('submit', (event) =>
      this.handleProjectFormSubmit(event)
    )
    addTaskBtn.addEventListener('click', () =>
      this.populateParentProjectSelect()
    )
    projectBtns.forEach((projectBtn) => {
      projectBtn.addEventListener('click', () => {
        this.handleProjectBtnClick(projectBtn)
      })
    })
  }

  static toggleSidebar () {
    const sidebar = document.querySelector('.sidebar')
    const mainContents = document.querySelector('.main-contents')
    sidebar.classList.toggle('sidebar-hide')
    mainContents.classList.toggle('full-width')
  }

  static handleTaskFormSubmit (event) {
    event.preventDefault()
    const addTaskForm = document.querySelector('.add-task-form')

    if (addTaskForm.checkValidity()) {
      const name = addTaskForm.querySelector('#task-name').value
      const description = addTaskForm.querySelector('#description').value
      const dueDate = addTaskForm.querySelector('#due-date').value
      const priority = addTaskForm.querySelector('#priority').value
      const parentProjectId =
        +addTaskForm.querySelector('#parent-project-id').value

      const newTask = new Task(
        name,
        description,
        dueDate,
        priority,
        parentProjectId
      )
      Storage.addTaskToProject(newTask, parentProjectId)

      addTaskForm.reset()
      addTaskForm.classList.remove('was-validated')

      const addTaskModal = addTaskForm.closest('.modal')
      this.hideModal(addTaskModal)

      this.loadTasks(parentProjectId)
    } else {
      event.stopPropagation()
      addTaskForm.classList.add('was-validated')
    }
  }

  static hideModal (modal) {
    bootstrap.Modal.getInstance(modal).hide()
  }

  static handleProjectFormSubmit (event) {
    event.preventDefault()
    const addProjectForm = document.querySelector('.add-project-form')

    if (addProjectForm.checkValidity()) {
      const name = addProjectForm.querySelector('#project-name').value
      const newProject = new Project(name)
      Storage.addProject(newProject)

      addProjectForm.reset()
      addProjectForm.classList.remove('was-validated')

      const addProjectModal = addProjectForm.closest('.modal')
      this.hideModal(addProjectModal)

      this.loadMyProjects()
    } else {
      event.stopPropagation()
      addProjectForm.classList.add('was-validated')
    }
  }

  static loadMyProjects () {
    const myProjectsDiv = document.querySelector('.my-projects')
    myProjectsDiv.innerHTML = ''
    const projects = Storage.getProjects()

    projects.forEach((project) => {
      if (![1, 2, 3, 4, 5].includes(project.id)) {
        const projectItemDiv = document.createElement('div')
        projectItemDiv.classList.add('project-item', 'project-btn')

        const iconElement = document.createElement('i')
        iconElement.classList.add('bi', 'bi-collection', 'h5')

        const paragraphElement = document.createElement('p')
        paragraphElement.id = project.id
        paragraphElement.textContent = project.name

        projectItemDiv.appendChild(iconElement)
        projectItemDiv.appendChild(paragraphElement)

        myProjectsDiv.appendChild(projectItemDiv)
      }
    })

    this.initialize()
  }

  static handleProjectBtnClick (projectBtn) {
    const projectBtns = document.querySelectorAll('.project-btn')
    projectBtns.forEach((pBtn) => {
      pBtn.classList.remove('focus')
    })
    projectBtn.classList.add('focus')

    const projectId = this.getProjectId(projectBtn)
    this.loadTasks(projectId)
  }

  static getProjectId (projectBtn) {
    return +projectBtn.querySelector('p').id
  }

  static loadTasks (projectId) {
    const project = Storage.getProject(projectId)
    const tasks = project.tasks
    const mainContentsContainer = document.querySelector(
      '.main-contents .container'
    )
    mainContentsContainer.innerHTML = ''

    const projectNameH2 = document.createElement('h2')
    projectNameH2.textContent = project.name
    mainContentsContainer.appendChild(projectNameH2)

    const tasksUl = document.createElement('ul')
    tasksUl.classList.add('list-group', 'list-group-flush', 'my-3')

    tasks.forEach((task) => {
      const taskLi = document.createElement('li')
      taskLi.classList.add('list-group-item', 'd-flex', 'task')

      const toggleStatusInput = document.createElement('input')
      toggleStatusInput.type = 'checkbox'
      toggleStatusInput.classList.add(
        'form-check-input',
        'me-3',
        'toggle-status'
      )
      taskLi.appendChild(toggleStatusInput)

      const taskDetailsDiv = document.createElement('div')

      const taskNameH6 = document.createElement('h6')
      taskNameH6.textContent = task.name
      taskDetailsDiv.appendChild(taskNameH6)

      const taskDescriptionP = document.createElement('p')
      taskDescriptionP.classList.add('description')
      taskDescriptionP.textContent = task.description
      taskDetailsDiv.appendChild(taskDescriptionP)

      const dueDateAndPriorityDiv = document.createElement('div')
      dueDateAndPriorityDiv.classList.add('d-flex', 'gap-2')

      const dueDateP = document.createElement('p')
      dueDateP.classList.add('due-date')
      dueDateP.textContent = `Due Date: ${task.dueDate}`
      dueDateAndPriorityDiv.appendChild(dueDateP)

      const priorityP = document.createElement('p')
      priorityP.classList.add('priority')
      priorityP.textContent = `Priority: ${task.priority.toUpperCase()}`
      const colorType =
        task.priority === 'high'
          ? 'bg-danger-subtle'
          : task.priority === 'medium'
            ? 'bg-warning-subtle'
            : 'bg-success-subtle'
      priorityP.classList.add(colorType)
      dueDateAndPriorityDiv.appendChild(priorityP)

      taskDetailsDiv.appendChild(dueDateAndPriorityDiv)
      taskLi.appendChild(taskDetailsDiv)

      tasksUl.appendChild(taskLi)
    })

    mainContentsContainer.appendChild(tasksUl)
    if (![2, 3, 4, 5].includes(projectId)) {
      this.addAddTaskBtnDiv()
    }
  }

  static addAddTaskBtnDiv () {
    const mainContentsContainer = document.querySelector(
      '.main-contents .container'
    )
    const addTaskBtnDiv = document.createElement('div')
    addTaskBtnDiv.classList.add(
      'd-flex',
      'align-items-center',
      'py-1',
      'px-2',
      'gap-2',
      'mt-3',
      'mb-2',
      'hover-style',
      'rounded',
      'active-style',
      'add-task-btn'
    )
    addTaskBtnDiv.setAttribute('data-bs-toggle', 'modal')
    addTaskBtnDiv.setAttribute('data-bs-target', '#add-task-modal')
    addTaskBtnDiv.style.maxWidth = 'max-content'

    const iconElement = document.createElement('i')
    iconElement.classList.add('bi', 'bi-plus-circle-fill', 'h5')
    addTaskBtnDiv.appendChild(iconElement)

    const pElement = document.createElement('p')
    pElement.textContent = 'Add task'
    addTaskBtnDiv.appendChild(pElement)

    mainContentsContainer.appendChild(addTaskBtnDiv)
  }

  static populateParentProjectSelect () {
    const parentProjectSelect = document.querySelector(
      '.parent-project-select'
    )
    const projects = Storage.getProjects()
    parentProjectSelect.innerHTML = ''

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
        parentProjectSelect.appendChild(option)
      })
  }
}
