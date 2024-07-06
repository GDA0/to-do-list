import { v4 as uuidv4 } from 'uuid'

export default class Task {
  constructor (
    name,
    description,
    dueDate,
    priority,
    parentProjectId,
    id = uuidv4()
  ) {
    this.name = name
    this.description = description
    this.dueDate = dueDate
    this.priority = priority
    this.completed = false
    this.id = id
    this.parentProjectId = parentProjectId
  }

  toggleCompleted () {
    this.completed = !this.completed
  }

  static fromJSON (json) {
    const task = new Task(
      json.name,
      json.description,
      json.dueDate,
      json.priority,
      json.parentProjectId,
      json.id
    )
    task.completed = json.completed
    return task
  }
}
