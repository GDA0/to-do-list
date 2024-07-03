import Project from '../models/project'

export default class Storage {
  static projects = JSON.parse(localStorage.getItem('projects')) || []

  // Create
  static addProject (project) {
    if (!this.projects.some((proj) => proj.id === project.id)) {
      this.projects.push(project)
      this._commit()
    }
  }

  static addTaskToProject (task, projectId) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)

    if (parentProject) {
      const newParentProject = new Project(
        parentProject.name,
        parentProject.id
      )

      parentProject.tasks.forEach((task) => {
        newParentProject.addTask(task)
      })

      newParentProject.addTask(task)

      Object.assign(parentProject, newParentProject)

      this._commit()
    }
  }

  // Read
  static getProjects () {
    return this.projects
  }

  static getProject (projectId) {
    return this.projects.find((proj) => proj.id === projectId)
  }

  // Update
  static _commit () {
    localStorage.setItem('projects', JSON.stringify(this.projects))
  }

  static editTaskStatus (taskId, projectId) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)

    if (parentProject) {
      parentProject.toggleTaskStatus(taskId)
      this._commit()
    }
  }

  static editTask (taskId, projectId, editedTask) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)

    if (parentProject) {
      parentProject.editTask(taskId, editedTask)

      // If parent project changed
      if (editedTask.parentProjectId !== projectId) {
        this.removeTaskFromProject(taskId, projectId)
        this.addTaskToProject(editedTask, editedTask.parentProjectId)
      }
      this._commit()
    }
  }

  static editProjectName (projectId, editedProjectName) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)

    if (parentProject) {
      parentProject.editProjectName(editedProjectName)
      this._commit()
    }
  }

  // Delete
  static removeTaskFromProject (taskId, projectId) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)

    if (parentProject) {
      parentProject.removeTask(taskId)
      this._commit()
    }
  }

  static removeProject (projectId) {
    this.projects = this.projects.filter((proj) => proj.id !== projectId)
    this._commit()
  }
}
