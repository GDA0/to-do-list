export default class Task {
  constructor (name, description, dueDate, priority, parentProjectId) {
    this.name = name
    this.description = description
    this.dueDate = dueDate
    this.priority = priority
    this.completed = false
    this.parentProjectId = parentProjectId
  }

  toggleCompleted () {
    this.completed = !this.completed
  }

  editTask (editedTask) {
    Object.assign(this, editedTask)
  }
}
