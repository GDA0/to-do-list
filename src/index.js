import './index.scss'
import * as bootstrap from 'bootstrap'
import { subYears, addDays, addMonths, addYears, format } from 'date-fns'

import UI from './views/ui'
import Storage from './utils/storage'
import Project from './models/project'
import Task from './models/task'

// Function to generate default tasks with dynamic due dates
const generateDefaultTasks = () => {
  const today = new Date()
  const tasks = [
    {
      name: 'Set Up Development Environment',
      description: 'Install Node.js, npm, and necessary development tools.',
      dueDate: format(subYears(today, new Date().getFullYear()), 'yyyy-MM-dd'), // Current year years ago
      priority: 'high',
      parentProjectId: '1'
    },
    {
      name: 'Create Initial Project Structure',
      description:
        'Set up the initial project structure with folders for components, services, and assets.',
      dueDate: format(addDays(today, -1), 'yyyy-MM-dd'), // Yesterday
      priority: 'medium',
      parentProjectId: '1'
    },
    {
      name: 'Implement Authentication',
      description: 'Develop and integrate user authentication using JWT.',
      dueDate: format(today, 'yyyy-MM-dd'), // Today
      priority: 'low',
      parentProjectId: '1'
    },
    {
      name: 'Design Database Schema',
      description: 'Create the database schema and set up initial tables.',
      dueDate: format(addDays(today, 1), 'yyyy-MM-dd'), // Tomorrow
      priority: 'medium',
      parentProjectId: '1'
    },
    {
      name: 'Build REST API',
      description: 'Develop REST API endpoints for CRUD operations.',
      dueDate: format(addDays(today, 5), 'yyyy-MM-dd'), // In 5 days
      priority: 'high',
      parentProjectId: '1'
    },
    {
      name: 'Set Up CI/CD Pipeline',
      description: 'Configure continuous integration and deployment pipeline.',
      dueDate: format(addMonths(today, 6), 'yyyy-MM-dd'), // In 6 months
      priority: 'low',
      parentProjectId: '1'
    },
    {
      name: 'Write Unit Tests',
      description: 'Write unit tests for the main components and services.',
      dueDate: format(addYears(today, 100000), 'yyyy-MM-dd'), // In 100,000 years
      priority: 'medium',
      parentProjectId: '1'
    }
  ]

  return tasks
}

document.addEventListener('DOMContentLoaded', () => {
  // Add default projects and tasks

  // Default projects
  const defaultProjects = [
    { name: 'Inbox', id: '1' },
    { name: 'Today', id: '2' },
    { name: 'Tomorrow', id: '3' },
    { name: 'This week', id: '4' },
    { name: 'Completed', id: '5' },
    { name: 'Overdue', id: '6' }
  ]

  // Default tasks
  const defaultTasks = generateDefaultTasks()

  defaultProjects.forEach((defaultProject) => {
    const newProject = new Project(defaultProject.name, defaultProject.id)
    if (newProject.id === '1') {
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
})
