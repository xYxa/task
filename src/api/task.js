import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000
})

export default {
  getDailyTasks(date) {
    return api.get('/tasks', {
      params: {
        start_time: date + ' 00:00:00',
        end_time: date + ' 23:59:59'
      }
    })
  },
  
  createTask(task) {
    return api.post('/tasks', task)
  },
  
  updateTask(id, updates) {
    return api.put(`/tasks/${id}`, updates)
  },
  
  completeTask(id) {
    return api.patch(`/tasks/${id}`, { done: true })
  }
}