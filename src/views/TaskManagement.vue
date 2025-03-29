<template>
  <div class="task-manager">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <h2>运维任务管理</h2>
      <div>
        <button @click="fetchTasks" class="refresh-btn" :disabled="loading">
          ↻ 刷新
        </button>
        <button @click="showCreateForm = true" class="create-btn" :disabled="loading">
          + 新建任务
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
      <button @click="fetchTasks">重试</button>
    </div>

    <!-- 任务列表 -->
    <div v-if="!loading && !error" class="task-list">
      <div
          v-for="task in tasks"
          :key="task.ID"
          :class="['task-item', { completed: task.done }]"
      >
        <input
            type="checkbox"
            :checked="task.done"
            @change="toggleTaskStatus(task)"
        >
        <div class="task-content">
          <h3>{{ task.name }}</h3>
          <p>{{ task.content || '无详细描述' }}</p>
          <div class="task-meta">
            <span class="type">{{ task.task_type || '未分类' }}</span>
            <span class="uploader">{{ task.uploader }}</span>
            <span v-if="task.priority" class="priority" :class="'priority-' + task.priority">
              优先级: {{ task.priority }}
            </span>
            <span class="time">
              {{ formatDate(task.createdAt) }}
            </span>
          </div>
        </div>
        <button
            @click="deleteTask(task.ID)"
            class="delete-btn"
            :disabled="processingIds.includes(task.ID)"
        >
          <span v-if="processingIds.includes(task.ID)">删除中...</span>
          <span v-else>删除</span>
        </button>
      </div>
    </div>

    <!-- 新建任务表单 -->
    <div v-if="showCreateForm" class="modal">
      <div class="form-container">
        <h3>新建任务</h3>
        <form @submit.prevent="handleCreateTask">
          <div class="form-group">
            <label>任务名称 <span class="required">*</span></label>
            <input v-model="newTask.name" required maxlength="50">
          </div>
          <div class="form-group">
            <label>任务类型</label>
            <select v-model="newTask.taskType">
              <option value="">选择类型</option>
              <option value="巡检">巡检</option>
              <option value="维修">维修</option>
              <option value="维护">维护</option>
            </select>
          </div>
          <div class="form-group">
            <label>优先级</label>
            <select v-model="newTask.priority">
              <option value="1">1 (最高)</option>
              <option value="2">2</option>
              <option value="3" selected>3</option>
              <option value="4">4</option>
              <option value="5">5 (最低)</option>
            </select>
          </div>
          <div class="form-group">
            <label>任务详情</label>
            <textarea v-model="newTask.content" rows="4" maxlength="500"></textarea>
          </div>
          <div class="form-actions">
            <button
                type="button"
                @click="showCreateForm = false"
                :disabled="submitting"
            >
              取消
            </button>
            <button
                type="submit"
                :disabled="submitting"
            >
              <span v-if="submitting">提交中...</span>
              <span v-else>提交</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import dayjs from 'dayjs'

export default {
  setup() {
    const tasks = ref([])
    const loading = ref(false)
    const error = ref(null)
    const showCreateForm = ref(false)
    const submitting = ref(false)
    const processingIds = ref([])

    const newTask = ref({
      name: '',
      taskType: '',
      content: '',
      priority: 3,
      uploader: '当前用户' // 根据实际登录用户修改
    })

    const api = axios.create({
      baseURL: 'http://192.168.0.4:8080',
      // baseURL: 'http://192.168.106.5:8080',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm')

    const fetchTasks = async () => {
      try {
        loading.value = true
        error.value = null

        // 打印完整请求路径
        //const fullUrl = api.defaults.baseURL + '/user/tasks';


        const response = await api.get('/user/tasks')
       // console.log('完整请求路径:', fullUrl);
        tasks.value = response.data.data || []
      } catch (err) {
        console.error('获取任务失败:', err)
        error.value = `获取任务失败: ${err.message}`
        if (err.response) {
          error.value += ` (状态码: ${err.response.status})`
        }
      } finally {
        loading.value = false
      }
    }

    const handleCreateTask = async () => {
      if (!newTask.value.name.trim()) {
        alert('任务名称不能为空')
        return
      }

      try {
        submitting.value = true

        // 1. 获取当前用户（优先从本地存储，其次用默认值）
        const user = JSON.parse(localStorage.getItem('userInfo')) || {}
        const uploader = user.username || '当前用户'

        // 2. 构造请求参数（注意中文编码）
        const params = new URLSearchParams()
        params.append('uploader', encodeURIComponent(uploader))

        // 3. 发送请求（参数通过URL传递）
        const response = await api.post('/user/tasks', {
          name: newTask.value.name.trim(),
          content: newTask.value.content.trim(),
          priority: parseInt(newTask.value.priority),
          taskType: newTask.value.taskType
        }, {
          params: params // 自动拼接到URL
        })
        if (response.status === 200) {
          showCreateForm.value = false
          resetNewTaskForm()
          await fetchTasks()
          alert('任务创建成功')
        }
      } catch (err) {
        console.error('创建任务失败:', err)
        alert(`创建失败: ${err.response?.data?.error || err.message}`)
      } finally {
        submitting.value = false
      }
    }

    const resetNewTaskForm = () => {
      newTask.value = {
        name: '',
        taskType: '',
        content: '',
        priority: 3,
        uploader: '当前用户',
        startTime: new Date().toISOString(),      // 默认当前时间
        endTime: new Date(Date.now() + 86400000).toISOString() // 默认24小时后
      }
    }

    const deleteTask = async (id) => {
      if (!confirm('确定要删除此任务吗？')) return

      try {
        processingIds.value.push(id)
        await api.delete(`/user/tasks/${id}`)
        await fetchTasks()
      } catch (err) {
        console.error('删除任务失败:', err)
        alert(`删除失败: ${err.response?.data?.error || err.message}`)
      } finally {
        processingIds.value = processingIds.value.filter(item => item !== id)
      }
    }

    const toggleTaskStatus = async (task) => {
      try {
        processingIds.value.push(task.ID)
        await api.put(`/user/tasks/${task.ID}`, {
          ...task,
          done: !task.done
        })
        await fetchTasks()
      } catch (err) {
        console.error('更新状态失败:', err)
        alert(`更新失败: ${err.response?.data?.error || err.message}`)
      } finally {
        processingIds.value = processingIds.value.filter(item => item !== task.ID)
      }
    }

    onMounted(fetchTasks)

    return {
      tasks,
      loading,
      error,
      showCreateForm,
      newTask,
      submitting,
      processingIds,
      fetchTasks,
      handleCreateTask,
      deleteTask,
      toggleTaskStatus,
      formatDate
    }
  }
}
</script>



<style scoped>
/* 基础样式 */
.task-manager {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

button {
  cursor: pointer;
  transition: all 0.2s;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.create-btn {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
}

.refresh-btn {
  padding: 8px 16px;
  margin-right: 10px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
}

.delete-btn {
  padding: 6px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  min-width: 60px;
}

/* 任务列表样式 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.task-item.completed {
  opacity: 0.7;
  background: #f9f9f9;
}

.task-content {
  flex: 1;
  margin: 0 16px;
}

.task-meta {
  font-size: 13px;
  color: #666;
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.task-meta span {
  display: inline-flex;
  align-items: center;
}

.priority-1 { color: #ff4d4f; font-weight: bold; }
.priority-2 { color: #fa8c16; }
.priority-3 { color: #faad14; }
.priority-4 { color: #52c41a; }
.priority-5 { color: #1890ff; }

/* 表单样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.form-container {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group .required {
  color: #ff4d4f;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.form-actions button {
  padding: 10px 20px;
  border-radius: 4px;
}

.form-actions button[type="submit"] {
  background: #42b983;
  color: white;
  border: none;
}

/* 加载状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误提示 */
.error-message {
  padding: 16px;
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.error-message button {
  padding: 4px 8px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 2px;
  font-size: 12px;
}
</style>