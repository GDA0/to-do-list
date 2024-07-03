export default class Storage {
  constructor () {
    this.projects = JSON.parse(localStorage.getItem('projects')) || []
  }

  //   Create
  addProject (project) {
    this.projects.push(project)
    this._commit()
  }

  addTaskToProject (task, projectId) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)
    const inbox = this.projects.find((proj) => proj.id === 0)

    if (parentProject && inbox) {
      parentProject.addTask(task)
      inbox.addTask(task)
      this._commit()
    }
  }

  //   Read
  getProjects () {
    return this.projects
  }

  getProject (projectId) {
    return this.projects.find((proj) => proj.id === projectId)
  }

  //   Update
  _commit () {
    localStorage.setItem('projects', JSON.stringify(this.projects))
  }

  editTaskStatus (taskId, projectId) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)
    const inbox = this.projects.find((proj) => proj.id === 0)

    if (parentProject && inbox) {
      parentProject.editTaskStatus(taskId)
      inbox.editTaskStatus(taskId)
      this._commit()
    }
  }

  editTask (taskId, projectId, editedTask) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)
    const inbox = this.projects.find((proj) => proj.id === 0)

    if (parentProject && inbox) {
      parentProject.editTask(taskId, editedTask)
      inbox.editTask(taskId, editedTask)

      //   Parent project changed
      if (editedTask.parentProjectId !== projectId) {
        this.removeTaskFromProject(taskId, projectId)
        this.addTaskToProject(editedTask, editedTask.parentProjectId)
      }
      this._commit()
    }
  }

  editProjectName (projectId, editedProjectName) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)

    if (parentProject) {
      parentProject.editProjectName(editedProjectName)
      this._commit()
    }
  }

  //   Delete
  removeTaskFromProject (taskId, projectId) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)
    const inbox = this.projects.find((proj) => proj.id === 0)

    if (parentProject && inbox) {
      parentProject.removeTask(taskId)
      inbox.removeTask(taskId)
      this._commit()
    }
  }

  removeProject (projectId) {
    const parentProject = this.projects.find((proj) => proj.id === projectId)
    const index = this.projects.find((proj) => proj.id === 0)

    parentProject.tasks.forEach((task) => {
      index.tasks = index.tasks.filter((iTask) => iTask.id !== task.id)
    })

    this._commit()
  }
}
