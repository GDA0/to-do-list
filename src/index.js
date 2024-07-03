// Import our custom CSS
import './index.scss'
import * as bootstrap from 'bootstrap'

import UI from './views/ui'
import Storage from './utils/storage'
import Project from './models/project'
import Task from './models/task'

const newUI = new UI()
const newStorage = new Storage()

// Default projects
const defaultProjectsArray = [
  { name: 'Index', id: 1 },
  { name: 'Today', id: 2 },
  { name: 'Tomorrow', id: 3 },
  { name: 'This Week', id: 4 },
  { name: 'Completed', id: 5 }
]

defaultProjectsArray.forEach((defaultProject) => {
  const newProject = new Project(defaultProject.name, defaultProject.id)
  newStorage.addProject(newProject)
})

document.addEventListener('DOMContentLoaded', () => {})
