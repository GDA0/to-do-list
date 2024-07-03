// Import our custom CSS
import './index.scss'
import * as bootstrap from 'bootstrap'

import UI from './views/ui'
import Storage from './utils/storage'
import Project from './models/project'

document.addEventListener('DOMContentLoaded', () => {
  UI.initialize()

  // Default projects
  const defaultProjectsArray = [
    { name: 'Inbox', id: 1 },
    { name: 'Today', id: 2 },
    { name: 'Tomorrow', id: 3 },
    { name: 'This week', id: 4 },
    { name: 'Completed', id: 5 }
  ]

  defaultProjectsArray.forEach((defaultProject) => {
    const newProject = new Project(defaultProject.name, defaultProject.id)
    Storage.addProject(newProject)
  })
})
