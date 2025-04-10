<template>
  <div class="task-manager">
    <!-- 顶部操作栏 -->
    <div class="action-bar">
      <h2>运维任务管理</h2>
      <div class="quick-add">
        <input
            v-model="quickTaskName"
            placeholder="输入任务名称，回车添加"
            @keyup.enter="handleQuickAdd"
            :disabled="loading"
        >
        <button @click="fetchTasks" class="refresh-btn" :disabled="loading">
          ↻ 刷新
        </button>
        <button @click="generateWeeklyReport" class="report-btn" :disabled="loading">
          📊 生成周报
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
          :class="['task-item', { 'completed': task.done }]"
      >
        <input
            type="checkbox"
            :checked="task.done"
            @change="toggleTaskStatus(task)"
        >
        <div class="task-content" :class="{ 'strikethrough': task.done }">
          <h3>{{ task.name }}</h3>
          <p>{{ task.content || '无详细描述' }}</p>
          <div class="task-meta">
            <span class="type">{{ task.task_type || '未分类' }}</span>
            <span class="uploader">{{ task.uploader }}</span>
            <span v-if="task.priority" class="priority" :class="'priority-' + task.priority">
              优先级: {{ task.priority }}
            </span>
            <p>任务创建和更新时间：</p>
            <span class="time">
              {{ formatDate(task.createdAt) }}
            </span>
            <p>任务结束时间：</p>
            <span class="time">
              {{ formatDate(task.end_time) }}
            </span>
          </div>
        </div>
        <div class="task-actions">
          <button
              @click="showEditForm(task)"
              class="edit-btn"
              :disabled="processingIds.includes(task.ID)"
          >
            编辑
          </button>
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
    </div>

    <!-- 编辑/补充详情表单 -->
    <div v-if="showEditDialog" class="modal">
      <div class="form-container">
        <h3>{{ editingTask.ID ? '编辑任务' : '补充任务详情' }}</h3>
        <form @submit.prevent="handleSubmitTask">
          <div class="form-group">
            <label>任务名称 <span class="required">*</span></label>
            <input v-model="editingTask.name" required maxlength="50">
          </div>
          <div class="form-group">
            <label>任务类型</label>
            <select v-model="editingTask.task_type">
              <option value="">选择类型</option>
              <option value="巡检">巡检</option>
              <option value="维修">维修</option>
              <option value="维护">维护</option>
            </select>
          </div>
          <div class="form-group">
            <label>优先级</label>
            <select v-model="editingTask.priority">
              <option value="1">1 (最高)</option>
              <option value="2">2</option>
              <option value="3" selected>3</option>
              <option value="4">4</option>
              <option value="5">5 (最低)</option>
            </select>
          </div>
          <div class="form-group">
            <label>结束时间 <span class="required">*</span></label>
            <input
                type="datetime-local"
                v-model="editingTask.end_time_formatted"
                required
            >
          </div>
          <div class="form-group">
            <label>任务详情</label>
            <textarea v-model="editingTask.content" rows="4" maxlength="500"></textarea>
          </div>
          <div class="form-actions">
            <button
                type="button"
                @click="showEditDialog = false"
                :disabled="submitting"
            >
              取消
            </button>
            <button
                type="submit"
                :disabled="submitting"
            >
              <span v-if="submitting">提交中...</span>
              <span v-else>保存</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 在模板底部添加周报模态框 -->
    <div v-if="showReportModal" class="modal">
      <div class="report-container">
        <div class="report-header">
          <h3>运维周报</h3>
          <button @click="showReportModal = false" class="close-btn">×</button>
        </div>
        <div v-if="reportLoading" class="loading-overlay">
          <div class="loading-spinner"></div>
          <span>生成周报中...</span>
        </div>
        <div v-else class="report-content" v-html="weeklyReport"></div>
        <div class="report-actions">
          <button @click="downloadReport" class="download-btn">下载PDF</button>
          <button @click="showReportModal = false" class="close-btn">关闭</button>
        </div>
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
    const processingIds = ref([])
    const quickTaskName = ref('')
    const showEditDialog = ref(false)
    const submitting = ref(false)

    // 在setup()中添加新状态
    const showReportModal = ref(false)
    const weeklyReport = ref('')
    const reportLoading = ref(false)

// 添加生成周报方法
    const generateWeeklyReport = async () => {
      try {
        reportLoading.value = true
        showReportModal.value = true
        const response = await api.get('/user/weekly-report')
        weeklyReport.value = response.data.report
      } catch (err) {
        console.error('生成周报失败:', err)
        error.value = `生成周报失败: ${err.message}`
      } finally {
        reportLoading.value = false
      }
    }

// 添加下载报告方法
    const downloadReport = () => {
      // 这里可以使用html2pdf等库实现PDF下载
      alert('PDF下载功能需集成html2pdf库')
    }


    const editingTask = ref({
      ID: null,
      name: '',
      task_type: '',
      content: '',
      priority: 3,
      uploader: '',
      end_time: null,          // 存储原始时间对象
      end_time_formatted: ''   // 用于v-model绑定的格式化时间
    })
    const formatDateForInput = (date) => {
      if (!date) return ''
      // 将日期转换为YYYY-MM-DDTHH:mm格式，用于datetime-local输入
      return dayjs(date).format('YYYY-MM-DDTHH:mm')
    }
    const parseDateFromInput = (dateStr) => {
      if (!dateStr) return null
      return new Date(dateStr)
    }


    const api = axios.create({
      baseURL: 'http://192.168.106.5:8080',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })


    const formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm')

    const getCurrentUser = () => {
      try {
        const user = JSON.parse(localStorage.getItem('userInfo')) || {}
        return user.username || '当前用户'
      } catch {
        return '当前用户'
      }
    }

    const fetchTasks = async () => {
      try {
        loading.value = true
        error.value = null
        const response = await api.get('/user/tasks')
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
// 从当前页面URL获取参数（如: http://yourfrontend.com?uploader=user123）
    const getUploaderFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      let uploader = urlParams.get('uploader');

      // 验证参数是否存在
      if (!uploader || uploader.trim() === '') {
        console.warn('URL中未找到uploader参数，使用默认值');
        uploader = 'defaultUser'; // 设置默认值
      }

      return encodeURIComponent(uploader); // 编码特殊字符
    };


    const handleQuickAdd = async () => {
      if (!quickTaskName.value.trim()) return;

      try {
        loading.value = true;

        // 获取uploader参数（优先从URL，其次从localStorage）
        const uploader = getUploaderFromURL() ||
            JSON.parse(localStorage.getItem('userInfo'))?.username ||
            'defaultUser';

        // 方式1：通过axios的params自动拼接（推荐）
        const response = await api.post('/user/tasks',
            {
              name: quickTaskName.value.trim(),
              content: '',
              priority: 3
            },
            {
              params: { uploader } // 自动拼接到URL
            }
        );

        // 验证实际请求URL
        console.log('实际请求URL:', response.config.url);
        // 应输出：http://192.168.0.2:8080/user/tasks?uploader=user123

        quickTaskName.value = '';
        await fetchTasks();
      } catch (err) {
        console.error('请求详情:', {
          url: err.config?.url,    // 检查最终URL
          params: err.config?.params,
          error: err.message
        });
        alert(`创建失败: ${err.response?.data?.error || err.message}`);
      } finally {
        loading.value = false;
      }
    };

    const showEditForm = (task) => {
      editingTask.value = {
        ID: task.ID,
        name: task.name,
        task_type: task.task_type || '',
        content: task.content || '',
        priority: task.priority || 3,
        uploader: task.uploader || getCurrentUser(),
        end_time: task.end_time ? new Date(task.end_time) : new Date(Date.now() + 86400000), // 默认1天后
        end_time_formatted: formatDateForInput(task.end_time)
      }
      showEditDialog.value = true
    }

    const handleSubmitTask = async () => {
      try {
        submitting.value = true;

        // 获取当前用户
        const uploader = getUploaderFromURL() || getCurrentUser();

        // 转换时间格式
        const endTime = parseDateFromInput(editingTask.value.end_time_formatted) ||
            new Date(Date.now() + 86400000); // 默认1天后

        // 准备提交数据
        const payload = {
          name: editingTask.value.name,
          task_type: editingTask.value.task_type,
          content: editingTask.value.content,
          priority: parseInt(editingTask.value.priority) || 3,
          uploader: uploader,
          done: editingTask.value.done || false,
          end_time: endTime.toISOString() // 转换为ISO格式
        };

        let response;
        if (editingTask.value.ID) {
          response = await api.put(`/user/tasks/${editingTask.value.ID}`, payload);
        } else {
          response = await api.post('/user/tasks', payload, {
            params: { uploader }
          });
        }

        showEditDialog.value = false;
        await fetchTasks();
      } catch (err) {
        console.error('操作失败:', err);
        alert(`操作失败: ${err.response?.data?.error || err.message}`);
      } finally {
        submitting.value = false;
      }
    };

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
      quickTaskName,
      processingIds,
      showEditDialog,
      editingTask,
      submitting,
      showReportModal,
      weeklyReport,
      reportLoading,
      fetchTasks,
      generateWeeklyReport,
      handleQuickAdd,
      showEditForm,
      handleSubmitTask,
      deleteTask,
      toggleTaskStatus,
      formatDate,
      downloadReport
    }
  }
}
</script>

<style scoped>
/* 新增的快速添加样式 */
.quick-add {
  display: flex;
  gap: 10px;
  align-items: center;
}

.quick-add input {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  min-width: 200px;
}

/* 调整原有样式 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
}

.task-actions {
  display: flex;
  gap: 8px;
}
/* 已完成任务的栅格线效果 */
.task-completed-strike {
  position: relative;
}

.task-completed-strike::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: repeating-linear-gradient(
      to right,
      #ccc 0px,
      #ccc 2px,
      transparent 2px,
      transparent 4px
  );
  transform: translateY(-50%);
  pointer-events: none;
}

/* 保持原有completed样式 */
.task-item.completed {
  opacity: 0.7;
  background: #f9f9f9;
  color: #999; /* 可选：文字颜色变灰 */
}
/* 已完成任务整体样式 */
.task-item.completed {
  opacity: 0.7;
  background-color: #f9f9f9;
}

/* 删除线效果 */
.strikethrough h3,
.strikethrough p {
  position: relative;
  display: inline-block;
}

.strikethrough h3::after,
.strikethrough p::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1.5px;  /* 线粗 */
  background: #888; /* 线颜色 */
  transform: translateY(-50%);
  animation: strike 0.3s ease-out forwards;
}

/* 删除线动画 */
@keyframes strike {
  from { width: 0 }
  to { width: 100% }
}

/* 复选框样式调整 */
.task-item.completed input[type="checkbox"] {
  filter: grayscale(70%);
  opacity: 0.7;
}
.edit-btn {
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  min-width: 60px;
}

/* 其他原有样式保持不变 */
.task-manager {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
}
.task-completed-strike input[type="checkbox"] {
  opacity: 0.6;
  filter: grayscale(70%);
}
button {
  cursor: pointer;
  transition: all 0.2s;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn {
  padding: 8px 16px;
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