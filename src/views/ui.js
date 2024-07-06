import Storage from '../utils/storage'
import Task from '../models/task'
import Project from '../models/project'
import * as bootstrap from 'bootstrap'
import { v4 as uuidv4 } from 'uuid'
import {
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isWithinInterval,
  formatDistanceToNow,
  parseISO,
  startOfDay,
  startOfWeek,
  endOfWeek
} from 'date-fns'

// Define project IDs for special cases
const SPECIAL_PROJECT_IDS = {
  TODAY: '2',
  TOMORROW: '3',
  THIS_WEEK: '4',
  COMPLETED: '5',
  OVERDUE: '6'
}

export default class UI {
  static initialize () {
    this.cacheDOMElements()
    this.addEventListeners()
    this.loadMyProjects()
    this.addNumOfTasksBadges()
    document.querySelector('.project-item').click()
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
    this.deleteTaskBtn = document.querySelector('.delete-task')
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
    this.deleteTaskBtn.addEventListener('click', () =>
      this.handleTaskDelete(
        this.deleteTaskBtn.id,
        this.deleteTaskBtn.parentProjectId
      )
    )
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

  static handleTaskDelete (taskId, parentProjectId) {
    this.showModal(document.getElementById('confirmationModal'))
    this.hideModal(document.getElementById('update-task-modal'))

    let confirmDeleteButton = document.getElementById('confirmDeleteButton')

    // Remove any previously attached event listeners to avoid multiple handlers
    confirmDeleteButton.replaceWith(confirmDeleteButton.cloneNode(true))
    confirmDeleteButton = document.getElementById('confirmDeleteButton')

    confirmDeleteButton.addEventListener('click', () => {
      Storage.removeTaskFromProject(taskId, parentProjectId)
      this.hideModal(document.querySelector('#update-task-modal'))
      this.loadTasks(parentProjectId)
      this.hideModal(document.getElementById('confirmationModal'))
    })
  }

  static loadMyProjects () {
    this.myProjectsDiv.innerHTML = ''
    const projects = Storage.getProjects()

    projects.forEach((project) => {
      if (!['1', '2', '3', '4', '5', '6'].includes(project.id)) {
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

    const headerContainer = document.createElement('div')
    headerContainer.classList.add('d-flex')
    const projectNameH2 = document.createElement('h2')
    projectNameH2.textContent = project.name
    headerContainer.appendChild(projectNameH2)
    this.mainContentsContainer.appendChild(headerContainer)

    const tasksUl = document.createElement('ul')
    tasksUl.classList.add('list-group', 'list-group-flush', 'my-3')

    const incompleteTasks = []
    const completedTasks = []

    project.tasks.forEach((task) => {
      if (task.completed) {
        completedTasks.push(task)
      } else {
        incompleteTasks.push(task)
      }
    })

    // Append incomplete tasks first, then completed tasks
    incompleteTasks.forEach((task) => this.createTaskItem(tasksUl, task))
    completedTasks.forEach((task) => this.createTaskItem(tasksUl, task))

    this.mainContentsContainer.appendChild(tasksUl)

    if (!['2', '3', '4', '5', '6'].includes(projectId)) {
      this.addAddTaskBtn()
      const controlBtns = document.createElement('div')
      controlBtns.classList.add('ms-auto', 'd-flex', 'gap-3')
      if (projectId !== '1') {
        this.addControlBtns(controlBtns, projectId)
        headerContainer.appendChild(controlBtns)
      }
    }

    this.addNumOfTasksBadges()
  }

  static createTaskItem (tasksUl, task) {
    const taskLi = document.createElement('li')
    taskLi.classList.add('list-group-item', 'd-flex', 'task')

    const toggleStatusInput = document.createElement('input')
    toggleStatusInput.type = 'checkbox'
    toggleStatusInput.name = 'task-status'
    toggleStatusInput.classList.add(
      'form-check-input',
      'me-3',
      'toggle-status',
      'rounded-circle',
      'fs-5'
    )
    toggleStatusInput.setAttribute('data-task-id', `${task.id}`)
    toggleStatusInput.setAttribute(
      'data-project-id',
      `${task.parentProjectId}`
    )
    toggleStatusInput.checked = task.completed

    toggleStatusInput.addEventListener('change', (event) => {
      const taskId = event.target.dataset.taskId
      const projectId = event.target.dataset.projectId
      this.handleToggleTaskStatus(taskId, projectId)
    })
    taskLi.appendChild(toggleStatusInput)

    const taskDetailsDiv = document.createElement('div')
    taskDetailsDiv.classList.add('task-details')
    if (task.completed) {
      taskDetailsDiv.classList.add('completed')
    }
    taskDetailsDiv.setAttribute('title', 'View/Update/Delete task')
    taskDetailsDiv.addEventListener('click', () =>
      this.handleTaskDetailsClick(task)
    )

    taskDetailsDiv.innerHTML = `
      <h6>${task.name}</h6>
      <p class="description">${task.description}</p>
      <div class="d-flex gap-2">
        <p class="due-date bg-primary-subtle">Due Date: ${this.formatDueDate(
          task.dueDate
        )}</p>
        <p class="priority ${this.getPriorityClass(
          task.priority
        )}">Priority: ${task.priority.toUpperCase()}</p>
      </div>
    `

    taskLi.appendChild(taskDetailsDiv)
    tasksUl.appendChild(taskLi)
  }

  static handleToggleTaskStatus (taskId, projectId) {
    Storage.toggleTaskStatus(taskId, projectId)
    this.loadTasks(projectId)
  }

  static formatDueDate (dueDate) {
    const date = new Date(dueDate)

    if (isToday(date)) {
      return 'Today'
    } else if (isTomorrow(date)) {
      return 'Tomorrow'
    } else if (isYesterday(date)) {
      return 'Yesterday'
    } else {
      return formatDistanceToNow(date, { addSuffix: true })
    }
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

    // Remove any previously attached event listeners to avoid multiple handlers
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
    // For easy identification and deletion
    this.deleteTaskBtn.id = task.id
    this.deleteTaskBtn.parentProjectId = task.parentProjectId
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

  static createTaskFromForm (form, customId = uuidv4()) {
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
    // Reset tasks for special projects
    this.resetSpecialProjectsTasks()

    // Get all tasks
    const allTasks = this.getAllTasks()

    // Today, start of this week, and end of this week
    const today = startOfDay(new Date())
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 0 })
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 0 })

    // Distribute tasks to special projects
    allTasks.forEach((task) => {
      const taskDueDate = parseISO(task.dueDate)

      if (isToday(taskDueDate)) {
        this.addTaskToSpecialProject(task, SPECIAL_PROJECT_IDS.TODAY)
      }
      if (isTomorrow(taskDueDate)) {
        this.addTaskToSpecialProject(task, SPECIAL_PROJECT_IDS.TOMORROW)
      }
      if (
        isWithinInterval(taskDueDate, {
          start: startOfThisWeek,
          end: endOfThisWeek
        })
      ) {
        this.addTaskToSpecialProject(task, SPECIAL_PROJECT_IDS.THIS_WEEK)
      }
      if (task.completed) {
        this.addTaskToSpecialProject(task, SPECIAL_PROJECT_IDS.COMPLETED)
      }
      if (isPast(taskDueDate) && !isToday(taskDueDate)) {
        this.addTaskToSpecialProject(task, SPECIAL_PROJECT_IDS.OVERDUE)
      }
    })

    // Update task badges
    document.querySelectorAll('.project-item').forEach((projectItem) => {
      const projectId = this.getProjectId(projectItem)
      const project = Storage.getProject(projectId)
      const numOfTasks = project.tasks.length
      projectItem.querySelector('.num-of-tasks').textContent =
        numOfTasks > 0 ? numOfTasks : ''
    })
  }

  static getAllTasks () {
    const projects = Storage.getProjects()
    return projects.reduce((allTasks, project) => {
      return allTasks.concat(project.tasks)
    }, [])
  }

  static resetSpecialProjectsTasks () {
    Object.values(SPECIAL_PROJECT_IDS).forEach((projectId) => {
      const project = Storage.getProject(projectId)
      if (project) {
        project.tasks = []
        Storage.updateProject(project)
      }
    })
  }

  static addTaskToSpecialProject (task, projectId) {
    const project = Storage.getProject(projectId)
    if (project) {
      project.tasks.push(task)
      Storage.updateProject(project)
    }
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

  static addControlBtns (parentContainer, projectId) {
    // Create edit button
    const editBtn = document.createElement('button')
    editBtn.className = 'btn btn-outline-secondary btn-sm rounded-circle ms-3'
    editBtn.setAttribute('data-project-id', projectId)
    editBtn.title = 'Edit project'

    const editIcon = document.createElement('i')
    editIcon.className = 'bi bi-pencil'
    editBtn.appendChild(editIcon)

    editBtn.addEventListener('click', () => {
      this.handleEditProject(projectId)
    })

    // Create delete button
    const deleteBtn = document.createElement('button')
    deleteBtn.className = 'btn btn-outline-danger btn-sm rounded-circle'
    deleteBtn.setAttribute('data-project-id', projectId)
    deleteBtn.title = 'Delete project'

    const deleteIcon = document.createElement('i')
    deleteIcon.className = 'bi bi-trash3'
    deleteBtn.appendChild(deleteIcon)

    deleteBtn.addEventListener('click', () => {
      this.handleDeleteProject(projectId)
    })

    parentContainer.appendChild(editBtn)
    parentContainer.appendChild(deleteBtn)
  }

  static handleEditProject (projectId) {
    const project = Storage.getProject(projectId)
    if (!project) return

    const editProjectModal = document.querySelector('#edit-project-modal')
    const editProjectForm = editProjectModal.querySelector('form')

    editProjectForm.querySelector('#project-name').value = project.name

    this.showModal(editProjectModal)

    // Handle form submission
    editProjectForm.onsubmit = (event) => {
      event.preventDefault()
      if (editProjectForm.checkValidity()) {
        const newName = editProjectForm.querySelector('#project-name').value
        project.name = newName
        Storage.updateProject(project)

        this.loadMyProjects()

        this.resetForm(editProjectModal.querySelector('.close-modal'))
        this.hideModal(editProjectModal)

        document.getElementById(projectId).closest('.project-item').click()
      } else {
        event.stopPropagation()
        editProjectForm.classList.add('was-validated')
      }
    }
  }

  static handleDeleteProject (projectId) {
    const confirmationModal = document.getElementById('confirmationModal')
    confirmationModal.querySelector('.confirmation-message').textContent =
      'Are you sure you want to delete this project? This action cannot be undone.'

    this.showModal(confirmationModal)

    let confirmDeleteButton = document.getElementById('confirmDeleteButton')

    // Remove any previously attached event listeners to avoid multiple handlers
    confirmDeleteButton.replaceWith(confirmDeleteButton.cloneNode(true))
    confirmDeleteButton = document.getElementById('confirmDeleteButton')

    confirmDeleteButton.addEventListener('click', () => {
      Storage.removeProject(projectId)
      this.loadMyProjects()
      this.hideModal(confirmationModal)
      document.querySelector('.project-item').click()
    })
  }

  static populateParentProjectSelect (form = null) {
    if (!form) form = this.addTaskForm
    const parentProjectSelect = form.querySelector('.parent-project-select')
    const projects = Storage.getProjects()
    parentProjectSelect.innerHTML = ''

    projects
      .filter((project) => !['2', '3', '4', '5', '6'].includes(project.id))
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
