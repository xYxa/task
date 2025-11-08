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
            :disabled="loading || !currentUploader"
            class="quick-input"
        >
        <button @click="fetchTasks" class="refresh-btn" :disabled="loading || !currentUploader">
          ↻
        </button>
      </div>
    </div>

    <!-- 快捷操作按钮组 -->
    <div class="quick-operation-group">
      <div class="operation-buttons">
        <button @click="quickOperation('桌面及其他设备运维')" class="operation-btn desktop-operation" :disabled="loading || !currentUploader">
          <span class="icon">💻</span>
          <span class="text">桌面运维</span>
        </button>
        <button @click="quickOperation('会议运维')" class="operation-btn meeting-operation" :disabled="loading || !currentUploader">
          <span class="icon">📊</span>
          <span class="text">会议运维</span>
        </button>
        <button @click="quickOperation('网络设备运维')" class="operation-btn network-operation" :disabled="loading || !currentUploader">
          <span class="icon">🌐</span>
          <span class="text">网络运维</span>
        </button>
        <button @click="quickOperation('其他运维')" class="operation-btn other-operation" :disabled="loading || !currentUploader">
          <span class="icon">🔧</span>
          <span class="text">其他运维</span>
        </button>
      </div>
    </div>

    <!-- 未检测到用户信息时的提示 -->
    <div v-if="!currentUploader" class="empty-uploader-message">
      <div class="empty-content">
        <h3>⚠️ 未检测到用户信息</h3>
        <p>无法显示任务列表</p>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>加载中...</span>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-message">
      <div class="error-content">
        <span class="error-text">{{ error }}</span>
        <button @click="fetchTasks" class="retry-btn">重试</button>
      </div>
    </div>

    <!-- 任务列表 -->
    <div v-else class="task-list-container">
      <div class="user-info">
        <span class="user-name">{{ currentUploader }}</span>
        <span class="task-count">({{ filteredTasks.length }}个任务)</span>
      </div>

      <div v-if="filteredTasks.length === 0" class="no-tasks-message">
        <div class="empty-icon">📝</div>
        <p>暂无任务</p>
        <p class="hint">点击上方按钮创建新任务</p>
      </div>

      <div v-else class="task-list">
        <div
            v-for="task in filteredTasks"
            :key="task.ID"
            :class="['task-item', { 'completed': task.done }]"
        >
          <div class="task-checkbox">
            <input
                type="checkbox"
                :checked="task.done"
                @change="toggleTaskStatus(task)"
                class="checkbox"
            >
          </div>
          <div class="task-content" :class="{ 'strikethrough': task.done }">
            <h3 class="task-title">{{ task.name }}</h3>
            <p class="task-desc">{{ task.content || '无详细描述' }}</p>
            <div class="task-meta">
              <span class="task-type">{{ task.task_type || '未分类' }}</span>
              <span class="task-priority" :class="'priority-' + task.priority">
                优先级{{ task.priority }}
              </span>
              <span class="task-time">{{ formatDate(task.createdAt) }}</span>
            </div>
          </div>
          <div class="task-actions">
            <button
                @click="showEditForm(task)"
                class="action-btn edit-btn"
                :disabled="processingIds.includes(task.ID)"
            >
              编辑
            </button>
            <button
                @click="deleteTask(task.ID)"
                class="action-btn delete-btn"
                :disabled="processingIds.includes(task.ID)"
            >
              <span v-if="processingIds.includes(task.ID)">...</span>
              <span v-else>删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑/补充详情表单 -->
    <div v-if="showEditDialog" class="modal">
      <div class="form-container">
        <div class="form-header">
          <h3>{{ isEditingExisting ? '编辑任务' : '创建新任务' }}</h3>
          <button @click="showEditDialog = false" class="close-btn">×</button>
        </div>
        <form @submit.prevent="handleSubmitTask" class="task-form">
          <div class="form-group">
            <label>任务名称 <span class="required">*</span></label>
            <input v-model="editingTask.name" required maxlength="50" class="form-input" placeholder="请输入任务名称">
          </div>
          <div class="form-group">
            <label>任务类型</label>
            <select v-model="editingTask.task_type" class="form-select">
              <option value="">选择类型</option>
              <option value="巡检">巡检</option>
              <option value="维修">维修</option>
              <option value="维护">维护</option>
              <option value="桌面及其他设备运维">桌面及其他设备运维</option>
              <option value="会议运维">会议运维</option>
              <option value="网络设备运维">网络设备运维</option>
              <option value="其他运维">其他运维</option>
            </select>
          </div>
          <div class="form-group">
            <label>优先级</label>
            <select v-model="editingTask.priority" class="form-select">
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
                class="form-input"
            >
          </div>
          <div class="form-group">
            <label>任务详情</label>
            <textarea v-model="editingTask.content" rows="4" maxlength="500" class="form-textarea" placeholder="请输入任务详细描述..."></textarea>
          </div>
          <div class="form-actions">
            <button
                type="button"
                @click="showEditDialog = false"
                :disabled="submitting"
                class="cancel-btn"
            >
              取消
            </button>
            <button
                type="submit"
                :disabled="submitting"
                class="submit-btn"
            >
              <span v-if="submitting">提交中...</span>
              <span v-else>{{ isEditingExisting ? '保存' : '创建' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 周报模态框 -->
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
import {ref, onMounted, computed} from 'vue'
import { parseBackendDate } from '@/utils/date'
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
    const showReportModal = ref(false)
    const weeklyReport = ref('')
    const reportLoading = ref(false)

    // 获取当前用户的 uploader
    const getCurrentUploader = () => {
      const urlParams = new URLSearchParams(window.location.search);
      let uploader = urlParams.get('uploader');

      if (uploader && uploader.trim() !== '') {
        return uploader.trim();
      }

      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.username && userInfo.username.trim() !== '') {
          return userInfo.username.trim();
        }
      } catch (e) {
        console.error('解析用户信息失败:', e);
      }

      return null;
    };

    const currentUploader = ref(getCurrentUploader());

    const isSpecialUser = computed(() => {
      return currentUploader.value && ['yx', '余湘'].includes(currentUploader.value.toLowerCase());
    });

    const filteredTasks = computed(() => {
      if (!currentUploader.value) {
        return [];
      }

      const todayStart = dayjs().startOf('day');

      return tasks.value.filter(task => {
        if (!isSpecialUser.value) {
          if (task.uploader !== currentUploader.value) {
            return false;
          }
        }

        if (!task.done) return true;

        const updatedAt = parseBackendDate(task.updatedAt || task.UpdatedAt);
        return updatedAt.isAfter(todayStart);
      });
    });

    // 判断是否正在编辑现有任务
    const isEditingExisting = computed(() => {
      return !!editingTask.value.ID;
    });

    const editingTask = ref({
      ID: null,
      name: '',
      task_type: '',
      content: '',
      priority: 3,
      uploader: '',
      end_time: null,
      end_time_formatted: ''
    });

    const formatDateForInput = (date) => {
      if (!date) return ''
      return dayjs(date).format('YYYY-MM-DDTHH:mm')
    }

    const parseDateFromInput = (dateStr) => {
      if (!dateStr) return null
      return new Date(dateStr)
    }

    const api = axios.create({
      baseURL: 'http://121.4.53.44:8080',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const formatDate = (date) => {
      return parseBackendDate(date).format('MM-DD HH:mm')
    }

    // 修改：快捷操作只打开表单，不立即创建任务
    const quickOperation = (operationType) => {
      if (!currentUploader.value) {
        alert('请先登录或设置用户信息');
        return;
      }

      // 根据操作类型设置默认值
      const operationConfig = {
        '桌面及其他设备运维': {
          name: `桌面运维 - ${dayjs().format('MM-DD')}`,
          content: '桌面设备、外设、办公软件等相关运维工作',
          priority: 3
        },
        '会议运维': {
          name: `会议运维 - ${dayjs().format('MM-DD')}`,
          content: '会议系统调试、设备准备、现场保障等工作',
          priority: 2
        },
        '网络设备运维': {
          name: `网络运维 - ${dayjs().format('MM-DD')}`,
          content: '网络设备巡检、配置维护、故障处理等工作',
          priority: 2
        },
        '其他运维': {
          name: `运维任务 - ${dayjs().format('MM-DD')}`,
          content: '其他类型的运维工作',
          priority: 3
        }
      };

      const config = operationConfig[operationType] || operationConfig['其他运维'];

      // 设置默认结束时间为明天
      const defaultEndTime = dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm');

      // 初始化编辑表单
      editingTask.value = {
        ID: null, // 新任务没有ID
        name: config.name,
        task_type: operationType,
        content: config.content,
        priority: config.priority,
        uploader: currentUploader.value,
        end_time: null,
        end_time_formatted: defaultEndTime
      };

      // 打开编辑对话框
      showEditDialog.value = true;
    };

    const fetchTasks = async () => {
      if (!currentUploader.value) {
        return;
      }

      try {
        loading.value = true
        error.value = null
        const response = await api.get('/user/tasks')

        tasks.value = response.data.data.map(task => ({
          ...task,
          createdAt: task.createdAt || task.CreatedAt
        }))
      } catch (err) {
        console.error('获取任务失败:', err)
        error.value = `获取任务失败: ${err.message}`
      } finally {
        loading.value = false
      }
    }

    const handleQuickAdd = async () => {
      if (!quickTaskName.value.trim() || !currentUploader.value) return;

      try {
        loading.value = true;

        const response = await api.post('/user/tasks',
            {
              name: quickTaskName.value.trim(),
              content: '',
              priority: 3
            },
            {
              params: { uploader: currentUploader.value }
            }
        );

        quickTaskName.value = '';
        await fetchTasks();
      } catch (err) {
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
        uploader: task.uploader || currentUploader.value,
        end_time: parseBackendDate(task.end_time).toDate(),
        end_time_formatted: parseBackendDate(task.end_time).format('YYYY-MM-DDTHH:mm'),
      }
      showEditDialog.value = true
    }

    const handleSubmitTask = async () => {
      if (!currentUploader.value) {
        alert('用户信息无效，无法保存任务');
        return;
      }

      try {
        submitting.value = true;

        const endTime = parseDateFromInput(editingTask.value.end_time_formatted) ||
            new Date(Date.now() + 86400000);

        const payload = {
          name: editingTask.value.name,
          task_type: editingTask.value.task_type,
          content: editingTask.value.content,
          priority: parseInt(editingTask.value.priority) || 3,
          uploader: currentUploader.value,
          done: editingTask.value.done || false,
          end_time: endTime.toISOString()
        };

        let response;
        if (editingTask.value.ID) {
          // 编辑现有任务
          response = await api.put(`/user/tasks/${editingTask.value.ID}`, payload);
        } else {
          // 创建新任务
          response = await api.post('/user/tasks', payload, {
            params: { uploader: currentUploader.value }
          });
        }

        showEditDialog.value = false;
        await fetchTasks();

        // 清空编辑表单
        editingTask.value = {
          ID: null,
          name: '',
          task_type: '',
          content: '',
          priority: 3,
          uploader: '',
          end_time: null,
          end_time_formatted: ''
        };
      } catch (err) {
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
        alert(`更新失败: ${err.response?.data?.error || err.message}`)
      } finally {
        processingIds.value = processingIds.value.filter(item => item !== task.ID)
      }
    }

    const generateWeeklyReport = async () => {
      if (!currentUploader.value) {
        alert('用户信息无效，无法生成周报');
        return;
      }

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

    const downloadReport = () => {
      alert('PDF下载功能需集成html2pdf库')
    }

    onMounted(() => {
      if (currentUploader.value) {
        fetchTasks();
      }
    })

    return {
      tasks,
      filteredTasks,
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
      currentUploader,
      isSpecialUser,
      isEditingExisting,
      fetchTasks,
      generateWeeklyReport,
      handleQuickAdd,
      showEditForm,
      handleSubmitTask,
      deleteTask,
      toggleTaskStatus,
      formatDate,
      downloadReport,
      quickOperation
    }
  }
}
</script>

<style scoped>
.other-operation {
  background: #fff7e6;
  color: #fa8c16;
}

/* 无任务提示文字更新 */
.hint {
  font-size: 14px;
  margin-top: 8px;
  color: #ccc;
}

.task-manager {
  max-width: 100%;
  margin: 0 auto;
  padding: 16px;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 顶部操作栏 */
.action-bar {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 12px;
}

.action-bar h2 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
  text-align: center;
}

.quick-add {
  display: flex;
  gap: 8px;
  align-items: center;
}

.quick-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
}

.refresh-btn {
  padding: 12px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  min-width: 50px;
}

/* 快捷操作按钮组 */
.quick-operation-group {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 12px;
}

.operation-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.operation-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  background: #f8f9fa;
  transition: all 0.3s;
}

.operation-btn:active {
  transform: scale(0.95);
}

.operation-btn .icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.operation-btn .text {
  font-size: 11px;
  line-height: 1.2;
}

.desktop-operation { background: #e6f7ff; color: #1890ff; }
.meeting-operation { background: #f6ffed; color: #52c41a; }
.network-operation { background: #f9f0ff; color: #722ed1; }
.report-operation { background: #fff7e6; color: #fa8c16; }

/* 用户信息 */
.user-info {
  background: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-name {
  color: #1890ff;
  font-weight: bold;
}

.task-count {
  color: #666;
  font-size: 12px;
}

/* 任务列表 */
.task-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.task-item.completed {
  opacity: 0.6;
  background: #fafafa;
}

.task-checkbox {
  margin-right: 12px;
  margin-top: 2px;
}

.checkbox {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
  line-height: 1.3;
  word-break: break-word;
}

.task-desc {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  word-break: break-word;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #999;
}

.task-type, .task-priority, .task-time {
  padding: 2px 6px;
  background: #f5f5f5;
  border-radius: 4px;
}

.priority-1 { background: #fff2f0; color: #ff4d4f; }
.priority-2 { background: #fff7e6; color: #fa8c16; }
.priority-3 { background: #fffbe6; color: #faad14; }
.priority-4 { background: #f6ffed; color: #52c41a; }
.priority-5 { background: #e6f7ff; color: #1890ff; }

.task-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-left: 8px;
}

.action-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  min-width: 50px;
}

.edit-btn {
  background: #1890ff;
  color: white;
}

.delete-btn {
  background: #ff4d4f;
  color: white;
}

/* 无任务提示 */
.no-tasks-message {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 12px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.hint {
  font-size: 14px;
  margin-top: 8px;
  color: #ccc;
}

/* 模态框 */
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
  padding: 16px;
}

.form-container, .report-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-header, .report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.form-header h3, .report-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
}

.task-form {
  padding: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #ff4d4f;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: #fafafa;
  box-sizing: border-box;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.cancel-btn, .submit-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.submit-btn {
  background: #52c41a;
  color: white;
}

/* 错误提示 */
.error-message {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.error-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-text {
  color: #ff4d4f;
  font-size: 14px;
  flex: 1;
}

.retry-btn {
  padding: 6px 12px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  margin-left: 12px;
}

/* 加载状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #52c41a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .task-manager {
    padding: 12px;
  }

  .action-bar, .quick-operation-group {
    padding: 12px;
  }

  .operation-buttons {
    grid-template-columns: repeat(4, 1fr);
    gap: 6px;
  }

  .operation-btn {
    padding: 10px 6px;
  }

  .operation-btn .icon {
    font-size: 18px;
  }

  .operation-btn .text {
    font-size: 10px;
  }

  .task-item {
    padding: 12px;
  }

  .task-actions {
    flex-direction: row;
  }

  .action-btn {
    min-width: 40px;
    padding: 6px 8px;
  }
}

/* 删除线动画 */
.strikethrough .task-title,
.strikethrough .task-desc {
  position: relative;
}

.strikethrough .task-title::after,
.strikethrough .task-desc::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #888;
  transform: translateY(-50%);
  animation: strike 0.3s ease-out forwards;
}

@keyframes strike {
  from { width: 0 }
  to { width: 100% }
}
</style>