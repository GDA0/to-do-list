export default class Task {
  constructor (name, description, dueDate, priority, parentProject) {
    this.name = name
    this.description = description
    this.dueDate = dueDate
    this.priority = priority
    this.completed = false
    this.parentProject = parentProject
  }

  toggleCompleted () {
    this.completed = !this.completed
  }
}
