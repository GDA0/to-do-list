export default class Project {
  constructor (name, customId = null) {
    this.name = name
    this.tasks = []
    this.id = customId || Date.now()
  }

  addTask (task) {
    this.tasks.push(task)
  }

  toggleTaskStatus (taskId) {
    const task = this.tasks.find((task) => task.id === taskId)
    if (task) {
      task.toggleCompleted()
    }
  }

  editTask (taskId, editedTask) {
    const task = this.tasks.find((task) => task.id === taskId)
    if (task) {
      task.editTask(editedTask)
    }
  }

  editProjectName (editedProjectName) {
    this.name = editedProjectName
  }

  removeTask (taskId) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId)
  }
}
