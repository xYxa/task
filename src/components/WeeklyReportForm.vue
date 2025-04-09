<template>
  <transition name="modal">
    <div class="weekly-report-modal" v-if="visible">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="$emit('submit')">
            <!-- 周报标题 -->
            <div class="form-row">
              <label>周报标题</label>
              <input
                  v-model="formData.reportTitle"
                  type="text"
                  required
                  placeholder="请输入周报标题"
              >
            </div>

            <!-- 填写人 -->
            <div class="form-row">
              <label>填写人</label>
              <input
                  v-model="formData.filler"
                  type="text"
                  required
                  placeholder="请输入填写人姓名"
              >
            </div>

            <!-- 本周工作 -->
            <div class="section-title">
              <h4>本周工作总结 ({{ formData.currentWeekTasks.length }}项)</h4>
              <button
                  type="button"
                  class="add-btn"
                  @click="$emit('add-task')"
              >
                + 添加
              </button>
            </div>

            <div class="tasks-table">
              <div class="table-header">
                <div class="th">工作内容</div>
                <div class="th">负责人</div>
                <div class="th">辅助人</div>
                <div class="th">状态</div>
                <div class="th">操作</div>
              </div>

              <div
                  v-for="(task, index) in formData.currentWeekTasks"
                  :key="index"
                  class="table-row"
              >
                <div class="td">
                  <input v-model="task.work" required>
                </div>
                <div class="td">
                  <input v-model="task.leader" required>
                </div>
                <div class="td">
                  <input v-model="task.assistant">
                </div>
                <div class="td">
                  <select v-model="task.status">
                    <option value="已完成">已完成</option>
                    <option value="进行中">进行中</option>
                  </select>
                </div>
                <div class="td">
                  <button
                      v-if="index > 0"
                      type="button"
                      class="remove-btn"
                      @click="$emit('remove-task', index)"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button
                  type="submit"
                  :disabled="isGenerating"
                  class="submit-btn"
              >
                {{ isGenerating ? '生成中...' : '生成周报' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    title: {
      type: String,
      default: '运维周报生成'
    },
    formData: {
      type: Object,
      required: true
    },
    isGenerating: Boolean
  },
  emits: ['close', 'submit', 'add-task', 'remove-task']
}
</script>

<style scoped>
.weekly-report-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  width: 800px;
  max-height: 90vh;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  font-size: 24px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.form-row {
  margin-bottom: 16px;
}

.form-row label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-row input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.add-btn {
  padding: 4px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tasks-table {
  margin-bottom: 24px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 80px;
  background: #fafafa;
  font-weight: bold;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 80px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.table-row:last-child {
  border-bottom: none;
}

.td input, .td select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.remove-btn {
  padding: 4px 8px;
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions {
  text-align: right;
}

.submit-btn {
  padding: 10px 24px;
  background: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.submit-btn:disabled {
  background: #a0d911;
  cursor: not-allowed;
}

/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>