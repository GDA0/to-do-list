// Import our custom CSS
import './index.scss'
import * as bootstrap from 'bootstrap'

import UI from './views/ui'
import Storage from './utils/storage'
import Project from './models/project'
import Task from './models/task'

document.addEventListener('DOMContentLoaded', () => {
  // Add default projects and tasks

  // Default projects
  const defaultProjects = [
    { name: 'Inbox', id: 1 },
    { name: 'Today', id: 2 },
    { name: 'Tomorrow', id: 3 },
    { name: 'This week', id: 4 },
    { name: 'Completed', id: 5 }
  ]

  // Default tasks
  const defaultTasks = [
    {
      name: 'Set Up Development Environment',
      description: 'Install Node.js, npm, and necessary development tools.',
      dueDate: 'Today',
      priority: 'high',
      parentProjectId: 1
    },
    {
      name: 'Create Initial Project Structure',
      description:
        'Set up the initial project structure with folders for components, services, and assets.',
      dueDate: 'Tomorrow',
      priority: 'medium',
      parentProjectId: 1
    },
    {
      name: 'Implement Authentication',
      description: 'Develop and integrate user authentication using JWT.',
      dueDate: 'Saturday',
      priority: 'high',
      parentProjectId: 1
    },
    {
      name: 'Design Database Schema',
      description: 'Create the database schema and set up initial tables.',
      dueDate: 'Monday',
      priority: 'medium',
      parentProjectId: 1
    },
    {
      name: 'Build REST API',
      description: 'Develop REST API endpoints for CRUD operations.',
      dueDate: '10th July, 2024',
      priority: 'high',
      parentProjectId: 1
    },
    {
      name: 'Set Up CI/CD Pipeline',
      description: 'Configure continuous integration and deployment pipeline.',
      dueDate: 'Next week',
      priority: 'medium',
      parentProjectId: 1
    },
    {
      name: 'Write Unit Tests',
      description: 'Write unit tests for the main components and services.',
      dueDate: 'Next month',
      priority: 'low',
      parentProjectId: 1
    }
  ]

  defaultProjects.forEach((defaultProject) => {
    const newProject = new Project(defaultProject.name, defaultProject.id)
    if (newProject.id === 1) {
      defaultTasks.forEach((defaultTask) => {
        const newTask = new Task(
          defaultTask.name,
          defaultTask.description,
          defaultTask.dueDate,
          defaultTask.priority,
          defaultTask.parentProjectId
        )
        newProject.addTask(newTask)
      })
    }

    Storage.addProject(newProject)
  })

  UI.initialize()

  // Click first project btn which is Inbox
  document.querySelector('.project-btn').click()
})
