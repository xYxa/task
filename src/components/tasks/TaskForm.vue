<script setup>
defineProps({
  task: Object,
  submitting: Boolean
})

defineEmits(['submit', 'cancel'])
</script>

<template>
  <!-- 确保这是文件中唯一的 template 标签 -->
  <div class="modal">
    <div class="form-container">
      <h3>{{ task.ID ? '编辑任务' : '补充任务详情' }}</h3>
      <form @submit.prevent="$emit('submit')">
        <div class="form-group">
          <label>任务名称 <span class="required">*</span></label>
          <input v-model="task.name" required maxlength="50">
        </div>
        <div class="form-group">
          <label>任务类型</label>
          <select v-model="task.task_type">
            <option value="">选择类型</option>
            <option value="巡检">巡检</option>
            <option value="维修">维修</option>
            <option value="维护">维护</option>
          </select>
        </div>
        <div class="form-group">
          <label>优先级</label>
          <select v-model="task.priority">
            <option value="1">1 (最高)</option>
            <option value="2">2</option>
            <option value="3" selected>3</option>
            <option value="4">4</option>
            <option value="5">5 (最低)</option>
          </select>
        </div>
        <div class="form-group">
          <label>任务详情</label>
          <textarea v-model="task.content" rows="4" maxlength="500"></textarea>
        </div>
        <div class="form-actions">
          <button
            type="button"
            @click="$emit('cancel')"
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
</template>

<style scoped>
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

/* ... rest of your styles ... */
</style>