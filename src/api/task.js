import axios from 'axios'

const api = axios.create({
  baseURL: 'http://192.168.106.5:8080',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

export default {
  fetchTasks() {
    return api.get('/user/tasks')
  },
  createTask(task, uploader) {
    return api.post('/user/tasks', task, { params: { uploader } })
  },
  updateTask(id, task) {
    return api.put(`/user/tasks/${id}`, task)
  },
  deleteTask(id) {
    return api.delete(`/user/tasks/${id}`)
  },
  toggleTaskStatus(id, status) {
    return api.put(`/user/tasks/${id}`, { done: status })
  }
}