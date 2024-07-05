import { v4 as uuidv4 } from 'uuid'
import Task from './task'

export default class Project {
  constructor (name, id = uuidv4()) {
    this.name = name
    this.tasks = []
    this.id = id
  }

  addTask (task) {
    this.tasks.push(task)
  }

  editTask (taskId, updatedTask) {
    const taskIndex = this.tasks.findIndex((task) => task.id === taskId)
    if (taskIndex !== -1) {
      Object.assign(this.tasks[taskIndex], updatedTask)
    }
  }

  removeTask (taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId)
  }

  toggleTaskStatus (taskId) {
    const task = this.tasks.find((task) => task.id === taskId)
    if (task) {
      task.toggleCompleted()
    }
  }

  editProjectName (newName) {
    this.name = newName
  }

  static fromJSON (json) {
    const project = new Project(json.name, json.id)
    project.tasks = json.tasks.map((taskData) => Task.fromJSON(taskData))
    return project
  }
}
