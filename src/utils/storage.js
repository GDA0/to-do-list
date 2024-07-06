import Project from '../models/project'

export default class Storage {
  static loadProjects () {
    const projects = JSON.parse(localStorage.getItem('projects')) || []
    return projects.map((project) => Project.fromJSON(project))
  }

  static saveProjects (projects) {
    localStorage.setItem('projects', JSON.stringify(projects))
  }

  static getProjects () {
    return this.loadProjects()
  }

  static getProject (projectId) {
    const projects = this.loadProjects()
    return projects.find((proj) => proj.id === projectId)
  }

  static addProject (project) {
    const projects = this.loadProjects()
    if (!projects.some((proj) => proj.id === project.id)) {
      projects.push(project)
      this.saveProjects(projects)
    }
  }

  static updateProject (updatedProject) {
    const projects = this.loadProjects()
    const projectIndex = projects.findIndex(
      (proj) => proj.id === updatedProject.id
    )
    if (projectIndex !== -1) {
      projects[projectIndex] = updatedProject
      this.saveProjects(projects)
    }
  }

  static removeProject (projectId) {
    let projects = this.loadProjects()
    projects = projects.filter((proj) => proj.id !== projectId)
    this.saveProjects(projects)
  }

  static addTaskToProject (task, projectId) {
    const projects = this.loadProjects()
    const project = projects.find((proj) => proj.id === projectId)
    if (project) {
      project.addTask(task)
      this.updateProject(project)
    }
  }

  static updateTask (taskId, projectId, updatedTask) {
    const project = this.getProject(projectId)
    if (project) {
      if (projectId !== updatedTask.parentProjectId) {
        this.removeTaskFromProject(taskId, projectId)
        this.addTaskToProject(updatedTask, updatedTask.parentProjectId)
      } else {
        project.editTask(taskId, updatedTask)
        this.updateProject(project)
      }
    }
  }

  static removeTaskFromProject (taskId, projectId) {
    const project = this.getProject(projectId)
    if (project) {
      project.removeTask(taskId)
      this.updateProject(project)
    }
  }

  static toggleTaskStatus (taskId, projectId) {
    const project = this.getProject(projectId)
    if (project) {
      project.toggleTaskStatus(taskId)
      this.updateProject(project)
    }
  }
}
