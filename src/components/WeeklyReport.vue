<template>
  <div class="weekly-report-form">
    <h2>生成运维周报</h2>
    <form @submit.prevent="generateReport">
      <div class="form-group">
        <label>周报标题</label>
        <input v-model="form.reportTitle" required>
      </div>

      <div class="form-group">
        <label>填写人</label>
        <input v-model="form.filler" required>
      </div>

      <div class="form-section">
        <h3>本周工作总结</h3>
        <div v-for="(task, index) in form.currentWeekTasks" :key="'current-'+index" class="task-item">
          <input v-model="task.work" placeholder="工作内容" required>
          <input v-model="task.leader" placeholder="负责人" required>
          <input v-model="task.assistant" placeholder="辅助人">
          <select v-model="task.status">
            <option value="已完成">已完成</option>
            <option value="进行中">进行中</option>
          </select>
          <button @click="removeTask('current', index)" type="button">删除</button>
        </div>
        <button @click="addTask('current')" type="button">+ 添加任务</button>
      </div>

      <!-- 下周计划、问题等类似结构 -->

      <div class="form-actions">
        <button type="submit" :disabled="loading">
          {{ loading ? '生成中...' : '生成周报' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      form: {
        reportTitle: `运维服务周报(10湖南-安化运维周报${new Date().getFullYear()}年第${this.getWeekNumber()}周)`,
        filler: localStorage.getItem('username') || '',
        currentWeekTasks: [
          { work: '', leader: '', assistant: '', status: '已完成' }
        ],
        nextWeekPlans: [],
        problems: [],
        nextProblems: [],
        suggestions: []
      }
    }
  },
  methods: {
    getWeekNumber() {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
      const week1 = new Date(date.getFullYear(), 0, 4);
      return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    },
    addTask(section) {
      this.form[`${section}Tasks`].push({
        work: '',
        leader: '',
        assistant: '',
        status: '已完成'
      });
    },
    removeTask(section, index) {
      this.form[`${section}Tasks`].splice(index, 1);
    },
    async generateReport() {
      try {
        this.loading = true;
        const response = await axios.post('/api/weekly-reports', {
          ...this.form,
          fillDate: new Date().toLocaleDateString('zh-CN')
        });

        // 下载生成的Excel
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', this.form.reportTitle + '.xls');
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        alert('生成周报失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>