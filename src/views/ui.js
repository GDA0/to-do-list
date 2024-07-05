import Storage from '../utils/storage'
import Task from '../models/task'
import Project from '../models/project'
import * as bootstrap from 'bootstrap'

export default class UI {
  static initialize () {
    this.cacheDOMElements()
    this.addEventListeners()
    this.loadMyProjects()
    this.addNumOfTasksBadges()
  }

  static cacheDOMElements () {
    this.sidebarToggler = document.querySelector('.sidebar-toggler')
    this.addTaskForm = document.querySelector('.add-task-form')
    this.addProjectForm = document.querySelector('.add-project-form')
    this.addTaskBtn = document.querySelector('.add-task-btn')
    this.projectItems = document.querySelectorAll('.project-item')
    this.closeModalBtns = document.querySelectorAll('.close-modal')
    this.myProjectsDiv = document.querySelector('.my-projects')
    this.mainContentsContainer = document.querySelector(
      '.main-contents .container'
    )
  }

  static addEventListeners () {
    this.sidebarToggler.addEventListener('click', () => this.toggleSidebar())
    this.addTaskForm.addEventListener('submit', (event) =>
      this.handleAddTaskFormSubmit(event)
    )
    this.addProjectForm.addEventListener('submit', (event) =>
      this.handleAddProjectFormSubmit(event)
    )
    this.addTaskBtn.addEventListener('click', () =>
      this.populateParentProjectSelect()
    )

    this.projectItems.forEach((projectItem) => {
      projectItem.addEventListener('click', () =>
        this.handleProjectItemClick(projectItem)
      )
    })

    this.closeModalBtns.forEach((closeModalBtn) => {
      closeModalBtn.addEventListener('click', () =>
        this.resetForm(closeModalBtn)
      )
    })
  }

  static resetForm (closeModalBtn) {
    const form = closeModalBtn.closest('.modal').querySelector('form')
    if (form) {
      form.reset()
      form.classList.remove('was-validated')
    }
  }

  static toggleSidebar () {
    const sidebar = document.querySelector('.sidebar')
    const mainContents = document.querySelector('.main-contents')
    sidebar.classList.toggle('sidebar-hide')
    mainContents.classList.toggle('full-width')
  }

  static handleAddTaskFormSubmit (event) {
    event.preventDefault()
    if (this.addTaskForm.checkValidity()) {
      const newTask = this.createTaskFromForm(this.addTaskForm)
      Storage.addTaskToProject(newTask, newTask.parentProjectId)
      this.resetForm(
        this.addTaskForm.closest('.modal').querySelector('.close-modal')
      )
      this.hideModal(this.addTaskForm.closest('.modal'))
      this.loadTasks(newTask.parentProjectId)
    } else {
      event.stopPropagation()
      this.addTaskForm.classList.add('was-validated')
    }
  }

  static handleAddProjectFormSubmit (event) {
    event.preventDefault()
    if (this.addProjectForm.checkValidity()) {
      const newProject = new Project(
        this.addProjectForm.querySelector('#project-name').value
      )
      Storage.addProject(newProject)
      this.resetForm(
        this.addProjectForm.closest('.modal').querySelector('.close-modal')
      )
      this.hideModal(this.addProjectForm.closest('.modal'))
      this.loadMyProjects()
      document.getElementById(newProject.id).closest('.project-item').click()
    } else {
      event.stopPropagation()
      this.addProjectForm.classList.add('was-validated')
    }
  }

  static loadMyProjects () {
    this.myProjectsDiv.innerHTML = ''
    const projects = Storage.getProjects()

    projects.forEach((project) => {
      if (!['1', '2', '3', '4', '5'].includes(project.id)) {
        this.createProjectItem(project)
      }
    })
  }

  static createProjectItem (project) {
    const projectItem = document.createElement('div')
    projectItem.classList.add('project-item')

    const iconElement = document.createElement('i')
    iconElement.classList.add('bi', 'bi-collection', 'h5')

    const paragraphElement = document.createElement('p')
    paragraphElement.id = project.id
    paragraphElement.textContent = project.name

    const spanElement = document.createElement('span')
    spanElement.classList.add(
      'badge',
      'text-bg-secondary',
      'num-of-tasks',
      'rounded-circle'
    )

    projectItem.appendChild(iconElement)
    projectItem.appendChild(paragraphElement)
    projectItem.appendChild(spanElement)

    projectItem.addEventListener('click', () =>
      this.handleProjectItemClick(projectItem)
    )

    this.myProjectsDiv.appendChild(projectItem)
  }

  static handleProjectItemClick (projectItem) {
    document
      .querySelectorAll('.project-item')
      .forEach((pItem) => pItem.classList.remove('focus'))
    projectItem.classList.add('focus')

    const projectId = this.getProjectId(projectItem)
    this.loadTasks(projectId)
  }

  static getProjectId (projectItem) {
    return projectItem.querySelector('p').id
  }

  static loadTasks (projectId) {
    const project = Storage.getProject(projectId)
    this.mainContentsContainer.innerHTML = ''

    const projectNameH2 = document.createElement('h2')
    projectNameH2.textContent = project.name
    this.mainContentsContainer.appendChild(projectNameH2)

    const tasksUl = document.createElement('ul')
    tasksUl.classList.add('list-group', 'list-group-flush', 'my-3')

    project.tasks.forEach((task) => this.createTaskItem(tasksUl, task))

    this.mainContentsContainer.appendChild(tasksUl)

    if (!['2', '3', '4', '5'].includes(projectId)) {
      this.addAddTaskBtn()
    }

    this.addNumOfTasksBadges()
  }

  static createTaskItem (tasksUl, task) {
    const taskLi = document.createElement('li')
    taskLi.classList.add('list-group-item', 'd-flex', 'task')

    const toggleStatusInput = document.createElement('input')
    toggleStatusInput.type = 'checkbox'
    toggleStatusInput.classList.add(
      'form-check-input',
      'me-3',
      'toggle-status',
      'rounded-circle'
    )
    taskLi.appendChild(toggleStatusInput)

    const taskDetailsDiv = document.createElement('div')
    taskDetailsDiv.classList.add('task-details')
    taskDetailsDiv.setAttribute('title', 'View/Update/Delete task')
    taskDetailsDiv.addEventListener('click', () =>
      this.handleTaskDetailsClick(task)
    )

    taskDetailsDiv.innerHTML = `
      <h6>${task.name}</h6>
      <p class="description">${task.description}</p>
      <div class="d-flex gap-2">
        <p class="due-date">Due Date: ${task.dueDate}</p>
        <p class="priority ${this.getPriorityClass(
          task.priority
        )}">Priority: ${task.priority.toUpperCase()}</p>
      </div>
    `

    taskLi.appendChild(taskDetailsDiv)
    tasksUl.appendChild(taskLi)
  }

  static getPriorityClass (priority) {
    return priority === 'high'
      ? 'bg-danger-subtle'
      : priority === 'medium'
        ? 'bg-warning-subtle'
        : 'bg-success-subtle'
  }

  static handleTaskDetailsClick (task) {
    const updateTaskModal = document.querySelector('#update-task-modal')
    let updateTaskForm = updateTaskModal.querySelector('form')

    const newUpdateTaskForm = updateTaskForm.cloneNode(true)
    updateTaskForm.parentNode.replaceChild(newUpdateTaskForm, updateTaskForm)
    updateTaskForm = newUpdateTaskForm

    this.populateParentProjectSelect(updateTaskForm)
    this.populateForm(updateTaskForm, {
      '#task-name': task.name,
      '#description': task.description,
      '#due-date': task.dueDate,
      '#priority': task.priority,
      '#parent-project-id': task.parentProjectId
    })
    this.showModal(updateTaskModal)

    updateTaskForm.addEventListener('submit', (event) => {
      this.handleUpdateTaskFormSubmit(event, task)
    })
  }

  static populateForm (form, fieldValues) {
    Object.entries(fieldValues).forEach(([selector, value]) => {
      form.querySelector(selector).value = value
    })
  }

  static handleUpdateTaskFormSubmit (event, task) {
    event.preventDefault()
    const updateTaskForm = document.querySelector('.update-task-form')

    if (updateTaskForm.checkValidity()) {
      const editedTask = this.createTaskFromForm(updateTaskForm, task.id)
      Storage.updateTask(task.id, task.parentProjectId, editedTask)
      this.resetForm(
        updateTaskForm.closest('.modal').querySelector('.close-modal')
      )
      this.hideModal(updateTaskForm.closest('.modal'))
      document
        .getElementById(editedTask.parentProjectId)
        .closest('.project-item')
        .click()
    } else {
      event.stopPropagation()
      updateTaskForm.classList.add('was-validated')
    }
  }

  static createTaskFromForm (form, customId = null) {
    return new Task(
      form.querySelector('#task-name').value,
      form.querySelector('#description').value,
      form.querySelector('#due-date').value,
      form.querySelector('#priority').value,
      form.querySelector('#parent-project-id').value,
      customId
    )
  }

  static showModal (modal) {
    const myModal = new bootstrap.Modal(modal)
    myModal.show()
  }

  static hideModal (modal) {
    bootstrap.Modal.getInstance(modal).hide()
  }

  static addNumOfTasksBadges () {
    document.querySelectorAll('.project-item').forEach((projectItem) => {
      const projectId = this.getProjectId(projectItem)
      const project = Storage.getProject(projectId)
      const numOfTasks = project.tasks.length
      projectItem.querySelector('.num-of-tasks').textContent =
        numOfTasks > 0 ? numOfTasks : ''
    })
  }

  static addAddTaskBtn () {
    const addTaskBtn = document.createElement('div')
    addTaskBtn.classList.add(
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
    addTaskBtn.setAttribute('data-bs-toggle', 'modal')
    addTaskBtn.setAttribute('data-bs-target', '#add-task-modal')
    addTaskBtn.style.maxWidth = 'max-content'

    const iconElement = document.createElement('i')
    iconElement.classList.add('bi', 'bi-plus-circle-fill', 'h5')
    addTaskBtn.appendChild(iconElement)

    const pElement = document.createElement('p')
    pElement.textContent = 'Add task'
    addTaskBtn.appendChild(pElement)

    addTaskBtn.addEventListener('click', () =>
      this.populateParentProjectSelect()
    )
    this.mainContentsContainer.appendChild(addTaskBtn)
  }

  static populateParentProjectSelect (form = null) {
    if (!form) form = this.addTaskForm
    const parentProjectSelect = form.querySelector('.parent-project-select')
    const projects = Storage.getProjects()
    parentProjectSelect.innerHTML = ''

    projects
      .filter((project) => !['2', '3', '4', '5'].includes(project.id))
      .forEach((project) => {
        const option = document.createElement('option')
        option.value = project.id.toString()
        option.textContent =
          project.name.length > 30
            ? project.name.slice(0, 30) + '...'
            : project.name
        if (project.id === '1') option.selected = true
        parentProjectSelect.appendChild(option)
      })
  }
}
