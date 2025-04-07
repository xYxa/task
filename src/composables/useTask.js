import { ref } from 'vue'
import taskApi from '@/api/task'
import dayjs from 'dayjs'

export default function useTask() {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref(null)
  const processingIds = ref([])
  const submitting = ref(false)

  const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm')

  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('userInfo')) || {}
      return user.username || '当前用户'
    } catch {
      return '当前用户'
    }
  }

  const getUploaderFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search)
    let uploader = urlParams.get('uploader')
    if (!uploader || uploader.trim() === '') {
      console.warn('URL中未找到uploader参数，使用默认值')
      uploader = 'defaultUser'
    }
    return encodeURIComponent(uploader)
  }

  return {
    tasks,
    loading,
    error,
    processingIds,
    submitting,
    formatDate,
    getCurrentUser,
    getUploaderFromURL
  }
}