<template>
  <div class="meeting-container">
    <div class="header">
      <h1><span class="icon">🎤</span> 一键会议发布系统</h1>
      <div>
        <span class="tag tag-primary">本周第{{ weekNumber }}周</span>
        <span class="tag tag-success">{{ currentDate }}</span>
      </div>
    </div>

    <!-- 会议表单 -->
    <div class="card">
      <div class="card-title"><span class="icon">📄</span> 会议基本信息</div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">会议主题 *</label>
          <input type="text" class="form-input" v-model="meeting.title" placeholder="请输入会议主题" required>
        </div>
        <div class="form-group">
          <label class="form-label">会议类型 *</label>
          <select class="form-select" v-model="meeting.type" required>
            <option value="日常例会">日常例会</option>
            <option value="项目评审">项目评审</option>
            <option value="技术分享">技术分享</option>
            <option value="客户会议">客户会议</option>
            <option value="紧急会议">紧急会议</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">开始时间 *</label>
          <input type="datetime-local" class="form-input" v-model="meeting.startTime" required>
        </div>
        <div class="form-group">
          <label class="form-label">结束时间 *</label>
          <input type="datetime-local" class="form-input" v-model="meeting.endTime" required>
        </div>
        <div class="form-group">
          <label class="form-label">会议地点 *</label>
          <input type="text" class="form-input" v-model="meeting.location" placeholder="请输入会议地点" required>
        </div>
        <div class="form-group">
          <label class="form-label">会议主持人 *</label>
          <input type="text" class="form-input" v-model="meeting.host" placeholder="请输入主持人姓名" required>
        </div>
      </div>

      <div class="form-group full-width">
        <label class="form-label">会议内容 *</label>
        <textarea class="form-textarea" v-model="meeting.content" rows="4" placeholder="请输入会议议程和主要内容" required></textarea>
      </div>
    </div>

    <!-- 参会人员管理 -->
    <div class="card">
      <div class="card-title"><span class="icon">👥</span> 参会人员管理</div>
      <div class="form-row">
        <div class="form-group full-width">
          <label class="form-label">添加参会人员</label>
          <div class="participant-add">
            <input type="text" class="form-input name-input" v-model="newParticipant.name" placeholder="姓名">
            <input type="text" class="form-input phone-input" v-model="newParticipant.phone" placeholder="手机号">
            <button class="btn btn-primary add-btn" @click="addParticipant">
              <span class="icon">➕</span> 添加
            </button>
          </div>
        </div>
      </div>

      <div class="participant-list">
        <div v-for="(participant, index) in meeting.participants" :key="index" class="participant-item">
          <div class="participant-info">
            <span>{{ participant.name }}</span>
            <span class="participant-phone">{{ participant.phone }}</span>
          </div>
          <button class="btn btn-danger delete-btn" @click="removeParticipant(index)">
            <span class="icon">🗑️</span> 删除
          </button>
        </div>
        <div v-if="meeting.participants.length === 0" class="empty-state">
          暂无参会人员，请添加
        </div>
      </div>
    </div>

    <!-- 通知设置 -->
    <div class="card">
      <div class="card-title"><span class="icon">🔔</span> 会议通知设置</div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">通知方式</label>
          <div>
            <label style="display: block; margin-bottom: 8px;">
              <input type="checkbox" v-model="notification.mqtt" checked> MQTT通知
            </label>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">提前提醒时间</label>
          <select class="form-select" v-model="notification.remindBefore">
            <option value="0">不提前提醒</option>
            <option value="15">提前15分钟</option>
            <option value="30" selected>提前30分钟</option>
            <option value="60">提前1小时</option>
            <option value="1440">提前1天</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 会议预览 -->
    <div class="meeting-preview">
      <h3><span class="icon">👀</span> 会议预览</h3>
      <div class="preview-item">
        <span class="preview-label">会议主题:</span>
        <span>{{ meeting.title || '未填写' }}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">会议类型:</span>
        <span>{{ meeting.type || '未选择' }}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">会议时间:</span>
        <span>{{ formatDateTime(meeting.startTime) }} 至 {{ formatDateTime(meeting.endTime) }}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">会议地点:</span>
        <span>{{ meeting.location || '未填写' }}</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">参会人员:</span>
        <span>{{ meeting.participants.length }} 人</span>
      </div>
      <div class="preview-item">
        <span class="preview-label">发布状态:</span>
        <span>
          <span class="status-indicator" :class="publishStatus.class"></span>
          {{ publishStatus.text }}
        </span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="btn btn-secondary" @click="resetForm">
        <span class="icon">🔄</span> 重置
      </button>
      <button class="btn btn-secondary" @click="saveDraft">
        <span class="icon">💾</span> 保存草稿
      </button>
      <button class="btn btn-primary publish-btn" @click="publishMeeting" :disabled="publishing">
        <span class="icon">📤</span> {{ publishing ? '发布中...' : '一键发布会议' }}
      </button>
    </div>

    <!-- 消息提示 -->
    <div v-if="message.show" :class="['message', message.type]">
      {{ message.text }}
    </div>

    <!-- 已保存的会议列表 -->
    <div class="card" v-if="savedMeetings.length > 0">
      <div class="card-title"><span class="icon">📋</span> 已保存的会议</div>
      <div class="meeting-list">
        <div v-for="savedMeeting in savedMeetings" :key="savedMeeting.id" class="meeting-item">
          <div class="meeting-info">
            <h4>{{ savedMeeting.title }}</h4>
            <p>时间: {{ formatDateTime(savedMeeting.startTime) }} - {{ formatDateTime(savedMeeting.endTime) }}</p>
            <p>地点: {{ savedMeeting.location }}</p>
            <p>参会人员: {{ savedMeeting.participants.length }}人</p>
            <p>状态: <span class="status-text">{{ savedMeeting.status || '已保存' }}</span></p>
          </div>
          <div class="meeting-actions">
            <button class="btn btn-secondary" @click="loadMeeting(savedMeeting)">
              <span class="icon">📝</span> 编辑
            </button>
            <button class="btn btn-danger" @click="deleteMeeting(savedMeeting.id)">
              <span class="icon">🗑️</span> 删除
            </button>
            <button class="btn btn-primary" @click="resendNotification(savedMeeting)" v-if="savedMeeting.status !== '通知已发送'">
              <span class="icon">🔔</span> 重发通知
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'MeetingView',
  setup() {
    // 当前日期和周数
    const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }))

    const getWeekNumber = () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 1)
      const days = Math.floor((now - start) / (24 * 60 * 60 * 1000))
      return Math.ceil((days + start.getDay() + 1) / 7)
    }

    const weekNumber = ref(getWeekNumber())

    // 消息提示
    const message = ref({
      show: false,
      text: '',
      type: 'success'
    })

    // 会议数据
    const meeting = ref({
      id: null,
      title: '',
      type: '日常例会',
      startTime: '',
      endTime: '',
      location: '',
      host: '',
      content: '',
      participants: []
    })

    // 新参会人员
    const newParticipant = ref({
      name: '',
      phone: ''
    })

    // 通知设置
    const notification = ref({
      mqtt: true,
      remindBefore: '30'
    })

    // 发布状态
    const publishing = ref(false)
    const publishStatus = ref({
      class: 'status-pending',
      text: '未发布'
    })

    // 已保存的会议
    const savedMeetings = ref([])

    // 显示消息
    const showMessage = (text, type = 'success') => {
      message.value = { show: true, text, type }
      setTimeout(() => {
        message.value.show = false
      }, 3000)
    }

    // 添加参会人员
    const addParticipant = () => {
      if (newParticipant.value.name && newParticipant.value.phone) {
        meeting.value.participants.push({
          name: newParticipant.value.name,
          phone: newParticipant.value.phone
        })
        newParticipant.value.name = ''
        newParticipant.value.phone = ''
        showMessage('参会人员添加成功', 'success')
      } else {
        showMessage('请填写姓名和手机号', 'error')
      }
    }

    // 删除参会人员
    const removeParticipant = (index) => {
      meeting.value.participants.splice(index, 1)
      showMessage('参会人员已删除', 'success')
    }

    // 格式化日期时间显示
    const formatDateTime = (datetime) => {
      if (!datetime) return '未设置'
      const date = new Date(datetime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 格式化时间为API需要的格式
    const formatDateTimeForAPI = (datetime) => {
      if (!datetime) return new Date().toISOString()
      return new Date(datetime).toISOString()
    }

    // 重置表单
    const resetForm = () => {
      meeting.value = {
        id: null,
        title: '',
        type: '日常例会',
        startTime: '',
        endTime: '',
        location: '',
        host: '',
        content: '',
        participants: []
      }
      notification.value = {
        mqtt: true,
        remindBefore: '30'
      }
      publishStatus.value = {
        class: 'status-pending',
        text: '未发布'
      }
      showMessage('表单已重置', 'success')
    }

    // 保存草稿到本地存储
    const saveDraft = () => {
      if (!meeting.value.title) {
        showMessage('请填写会议主题', 'error')
        return
      }

      const draft = {
        ...meeting.value,
        notification: { ...notification.value }
      }

      localStorage.setItem('meeting_draft', JSON.stringify(draft))
      showMessage('会议草稿保存成功', 'success')
    }

    // 加载草稿
    const loadDraft = () => {
      const draft = localStorage.getItem('meeting_draft')
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft)
          meeting.value = { ...parsedDraft }
          if (parsedDraft.notification) {
            notification.value = { ...parsedDraft.notification }
          }
          showMessage('草稿已加载', 'success')
        } catch (error) {
          console.error('加载草稿失败:', error)
          showMessage('加载草稿失败', 'error')
        }
      }
    }

    // 保存会议到本地存储
    const saveMeetingToLocal = (meetingData, notificationStatus = '已保存') => {
      try {
        const meetings = JSON.parse(localStorage.getItem('saved_meetings') || '[]')
        if (meetingData.id) {
          // 更新现有会议
          const index = meetings.findIndex(m => m.id === meetingData.id)
          if (index !== -1) {
            meetings[index] = {
              ...meetingData,
              status: notificationStatus,
              updatedAt: new Date().toISOString()
            }
          }
        } else {
          // 添加新会议
          meetingData.id = Date.now().toString()
          meetingData.createdAt = new Date().toISOString()
          meetingData.status = notificationStatus
          meetings.push(meetingData)
        }
        localStorage.setItem('saved_meetings', JSON.stringify(meetings))
        loadSavedMeetings()
      } catch (error) {
        console.error('保存会议失败:', error)
        showMessage('保存会议失败', 'error')
      }
    }

    // 修改加载已保存会议的函数
    const loadSavedMeetings = async () => {
      try {
        // 先从本地存储加载
        const localMeetings = JSON.parse(localStorage.getItem('saved_meetings') || '[]')

        // 再从服务器获取
        const response = await axios.get('/user/meetings')
        if (response.data.code === 200) {
          const serverMeetings = response.data.data.map(meeting => ({
            id: meeting.id.toString(),
            title: meeting.title,
            type: meeting.type,
            startTime: meeting.startTime,
            endTime: meeting.endTime,
            location: meeting.location,
            host: meeting.host,
            content: meeting.content,
            participants: [], // 从content中解析参会人员
            status: meeting.status,
            createdAt: meeting.createdAt
          }))

          // 合并本地和服务器数据
          savedMeetings.value = [...localMeetings, ...serverMeetings].sort((a, b) =>
              new Date(b.createdAt) - new Date(a.createdAt)
          )
        }
      } catch (error) {
        console.error('加载会议列表失败:', error)
        // 失败时只使用本地数据
        const meetings = JSON.parse(localStorage.getItem('saved_meetings') || '[]')
        savedMeetings.value = meetings.sort((a, b) =>
            new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
        )
      }
    }

    // 加载会议到表单
    const loadMeeting = (meetingData) => {
      meeting.value = { ...meetingData }
      showMessage('会议已加载到表单', 'success')
    }

    // 删除会议
    const deleteMeeting = (id) => {
      try {
        const meetings = JSON.parse(localStorage.getItem('saved_meetings') || '[]')
        const filteredMeetings = meetings.filter(m => m.id !== id)
        localStorage.setItem('saved_meetings', JSON.stringify(filteredMeetings))
        loadSavedMeetings()
        showMessage('会议已删除', 'success')
      } catch (error) {
        console.error('删除会议失败:', error)
        showMessage('删除会议失败', 'error')
      }
    }

// 修改重发通知函数
    const resendNotification = async (meetingData) => {
      try {
        console.log('重发通知，会议ID:', meetingData.id)

        const response = await axios.post(`/user/meetings/${meetingData.id}/notify`, {}, {
          headers: {
            'Content-Type': 'application/json'
          }
        })

        console.log('重发通知响应:', response.data)

        if (response.data.code === 200) {
          saveMeetingToLocal(meetingData, '通知已发送')
          showMessage('通知重发成功', 'success')
          loadSavedMeetings()
        } else {
          showMessage('通知重发失败: ' + (response.data.error || '未知错误'), 'error')
        }
      } catch (error) {
        console.error('重发通知失败详情:', error)
        if (error.response) {
          showMessage(`重发失败: ${error.response.status} - ${error.response.data?.error || '未知错误'}`, 'error')
        } else {
          showMessage('重发通知失败: ' + error.message, 'error')
        }
      }
    }

// 添加调试函数到mounted
    onMounted(() => {
      const now = new Date()
      const startTime = new Date(now.getTime() + 60 * 60 * 1000)
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000)

      meeting.value.startTime = startTime.toISOString().slice(0, 16)
      meeting.value.endTime = endTime.toISOString().slice(0, 16)

      // 测试API连接
      testAPIConnection()

      loadDraft()
      loadSavedMeetings()
    })

// 添加测试API连接的函数
    const testAPIConnection = async () => {
      try {
        const response = await axios.get('/user/tasks')
        console.log('API连接测试成功:', response.status)
      } catch (error) {
        console.error('API连接测试失败:', error)
      }
    }

    // 修复后的发送MQTT通知函数
    const sendMeetingNotification = async (meetingData) => {
      try {
        // 构建参会人员名单
        const participantsList = meetingData.participants.map(p => `${p.name}(${p.phone})`).join('、')

        // 使用现有的创建任务API来发送MQTT通知
        const taskData = {
          name: `会议通知: ${meetingData.title}`,
          content: `会议类型: ${meetingData.type}\n时间: ${formatDateTime(meetingData.startTime)} - ${formatDateTime(meetingData.endTime)}\n地点: ${meetingData.location}\n主持人: ${meetingData.host}\n参会人员: ${participantsList || '暂无'}`,
          task_type: '会议通知',
          address: meetingData.location,
          uploader: meetingData.host || '系统管理员',
          start_time: formatDateTimeForAPI(meetingData.startTime),
          end_time: formatDateTimeForAPI(meetingData.endTime),
          priority: 2
        }

        console.log('准备发送会议通知:', taskData)

        // 修改请求路径为 /user/tasks
        const response = await axios.post('/user/tasks', taskData, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        })

        if (response.data && (response.data.code === 200 || response.data.message === '创建成功')) {
          console.log('MQTT会议通知发送成功')
          return true
        } else {
          console.error('API响应异常:', response.data)
          throw new Error(response.data?.error || 'API响应异常')
        }
      } catch (error) {
        console.error('发送MQTT通知失败:', error)
        if (error.response) {
          console.error('响应状态:', error.response.status)
          console.error('响应数据:', error.response.data)
          throw new Error(`服务器错误: ${error.response.status} - ${error.response.data?.error || '未知错误'}`)
        } else if (error.request) {
          console.error('请求未收到响应:', error.request)
          throw new Error('网络连接失败，请检查网络连接')
        } else {
          throw new Error('请求配置错误: ' + error.message)
        }
      }
    }

    // 修改发布会议函数，添加调试信息
    const publishMeeting = async () => {
      // 表单验证...

      publishing.value = true

      try {
        // 准备会议数据
        const meetingData = {
          title: meeting.value.title,
          type: meeting.value.type,
          startTime: new Date(meeting.value.startTime).toISOString(),
          endTime: new Date(meeting.value.endTime).toISOString(),
          location: meeting.value.location,
          host: meeting.value.host,
          content: meeting.value.content,
          participants: meeting.value.participants,
          notification: {
            mqtt: notification.value.mqtt,
            remindBefore: notification.value.remindBefore
          }
        }

        console.log('发送会议数据:', meetingData)

        // 调用后端API - 使用完整的URL路径
        const response = await axios.post('/user/meetings', meetingData, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10秒超时
        })

        console.log('API响应:', response.data)

        if (response.data.code === 200) {
          showMessage('会议发布成功！', 'success')
          publishStatus.value = {
            class: 'status-published',
            text: '已发布'
          }

          // 保存到本地存储
          saveMeetingToLocal({
            ...meeting.value,
            id: response.data.data.id,
            createdAt: response.data.data.createdAt
          }, '已发布')

          // 重置表单
          resetForm()

          // 重新加载会议列表
          loadSavedMeetings()
        } else {
          throw new Error(response.data.message || '发布失败')
        }
      } catch (error) {
        console.error('发布失败详情:', error)
        if (error.response) {
          // 服务器响应了错误状态码
          console.error('响应状态:', error.response.status)
          console.error('响应数据:', error.response.data)
          showMessage(`发布失败: ${error.response.status} - ${error.response.data?.error || '未知错误'}`, 'error')
        } else if (error.request) {
          // 请求已发出但没有收到响应
          console.error('无响应:', error.request)
          showMessage('网络连接失败，请检查网络连接', 'error')
        } else {
          // 其他错误
          showMessage('发布失败: ' + error.message, 'error')
        }
      } finally {
        publishing.value = false
      }
    }

    // 初始化
    onMounted(() => {
      const now = new Date()
      const startTime = new Date(now.getTime() + 60 * 60 * 1000) // 1小时后
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 2小时后

      meeting.value.startTime = startTime.toISOString().slice(0, 16)
      meeting.value.endTime = endTime.toISOString().slice(0, 16)

      // 加载草稿和已保存的会议
      loadDraft()
      loadSavedMeetings()
    })

    return {
      currentDate,
      weekNumber,
      message,
      meeting,
      newParticipant,
      notification,
      publishing,
      publishStatus,
      savedMeetings,
      addParticipant,
      removeParticipant,
      formatDateTime,
      resetForm,
      saveDraft,
      publishMeeting,
      loadMeeting,
      deleteMeeting,
      resendNotification
    }
  }
}
</script>

<style scoped>
.meeting-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #333;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eaeaea;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.icon {
  margin-right: 5px;
}

.tag {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 10px;
}

.tag-primary {
  background-color: #e8f4ff;
  color: #1890ff;
}

.tag-success {
  background-color: #f6ffed;
  color: #52c41a;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  padding: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  min-width: 200px;
}

.form-group.full-width {
  flex: 0 0 100%;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  border-color: #1890ff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.participant-add {
  display: flex;
  gap: 10px;
}

.name-input, .phone-input {
  flex: 1;
}

.add-btn {
  white-space: nowrap;
}

.participant-list {
  margin-top: 15px;
}

.participant-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 8px;
}

.participant-info {
  display: flex;
  flex-direction: column;
}

.participant-name {
  font-weight: 500;
}

.participant-phone {
  font-size: 13px;
  color: #666;
}

.delete-btn {
  padding: 5px 10px;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #999;
  font-style: italic;
}

.notification-options {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.meeting-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-item {
  display: flex;
  align-items: center;
}

.preview-label {
  font-weight: 500;
  min-width: 100px;
  color: #666;
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-pending {
  background-color: #faad14;
}

.status-publishing {
  background-color: #1890ff;
}

.status-success {
  background-color: #52c41a;
}

.status-error {
  background-color: #ff4d4f;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #666;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e6e6e6;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
}

.btn-danger {
  background-color: #ff4d4f;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #ff7875;
}

.publish-btn {
  min-width: 140px;
}

.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.message.success {
  background-color: #52c41a;
}

.message.error {
  background-color: #ff4d4f;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.meeting-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.meeting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
}

.meeting-info h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.meeting-info p {
  margin: 4px 0;
  font-size: 14px;
  color: #666;
}

.meeting-actions {
  display: flex;
  gap: 10px;
}

@media (max-width: 768px) {
  .meeting-container {
    padding: 15px;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .form-row {
    flex-direction: column;
    gap: 15px;
  }

  .participant-add {
    flex-direction: column;
  }

  .action-bar {
    flex-direction: column;
  }

  .meeting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .meeting-actions {
    align-self: flex-end;
  }
}
</style>