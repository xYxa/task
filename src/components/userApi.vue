<!--<template>-->
<!--  <div v-if="showReportModal" class="modal">...<button @click="generateWeeklyReport">生成周报</button></div>-->

<!--  <div class="app">-->
<!--    <h1>每日计划</h1>-->
<!--    <div class="container">-->
<!--      &lt;!&ndash; 左侧任务列表 &ndash;&gt;-->
<!--      <div class="task-list">-->
<!--        <h2>任务列表</h2>-->
<!--        <div class="add-task">-->
<!--          <input v-model="newTask" placeholder="输入任务内容" @keyup.enter="addTask" />-->
<!--          <button @click="addTask">添加任务</button>-->
<!--        </div>-->
<!--        <ul>-->
<!--          <li v-for="task in tasks" :key="task.id" @click="selectTask(task)">-->
<!--            <div class="task-item" :class="{ completed: task.done }">-->
<!--              <input type="checkbox" v-model="task.done" @change="updateTask(task)" />-->
<!--              <span>{{ task.content }}</span>-->
<!--              <button @click.stop="deleteTask(task.id)">删除</button>-->
<!--            </div>-->
<!--          </li>-->
<!--        </ul>-->
<!--      </div>-->

<!--      &lt;!&ndash; 右侧任务详情 &ndash;&gt;-->
<!--      <div class="task-detail">-->
<!--        <h2>任务详情</h2>-->
<!--        <div v-if="selectedTask">-->
<!--          <p><strong>任务内容：</strong>{{ selectedTask.content }}</p>-->
<!--          <p>-->
<!--            <strong>状态：</strong>-->
<!--            <span :class="{ completed: selectedTask.done }">-->
<!--              {{ selectedTask.done ? "已完成" : "未完成" }}-->
<!--            </span>-->
<!--          </p>-->
<!--          <button @click="deleteTask(selectedTask.id)">删除任务</button>-->
<!--        </div>-->
<!--        <div v-else>-->
<!--          <p>请选择一个任务查看详情。</p>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--export default {-->
<!--  data() {-->
<!--    return {-->
<!--      newTask: "",-->
<!--      tasks: [],-->
<!--      selectedTask: null,-->
<!--    };-->
<!--  },-->
<!--  created() {-->
<!--    this.fetchTasks();-->
<!--  },-->
<!--  methods: {-->
<!--    async fetchTasks() {-->
<!--      const response = await fetch('http://localhost:8080/user/tasks');-->
<!--      const result = await response.json();-->
<!--      this.tasks = result.data;-->
<!--    },-->
<!--    async addTask() {-->
<!--      if (this.newTask.trim() === "") return;-->
<!--      const response = await fetch('http://localhost:8080/user/tasks', {-->
<!--        method: 'POST',-->
<!--        headers: { 'Content-Type': 'application/json' },-->
<!--        body: JSON.stringify({ content: this.newTask, done: false })-->
<!--      });-->
<!--      const result = await response.json();-->
<!--      this.tasks.push(result.data);-->
<!--      this.newTask = "";-->
<!--    },-->
<!--    async updateTask(task) {-->
<!--      await fetch(`http://localhost:8080/user/tasks/${task.id}`, {-->
<!--        method: 'PUT',-->
<!--        headers: { 'Content-Type': 'application/json' },-->
<!--        body: JSON.stringify(task)-->
<!--      });-->
<!--    },-->
<!--    async deleteTask(id) {-->
<!--      await fetch(`http://localhost:8080/user/tasks/${id}`, { method: 'DELETE' });-->
<!--      this.tasks = this.tasks.filter(task => task.id !== id);-->
<!--      if (this.selectedTask && this.selectedTask.id === id) {-->
<!--        this.selectedTask = null;-->
<!--      }-->
<!--    },-->
<!--    selectTask(task) {-->
<!--      this.selectedTask = task;-->
<!--    },-->
<!--  },-->
<!--};-->
<!--// 在setup()中更新generateWeeklyReport方法-->
<!--const generateWeeklyReport = async () => {-->
<!--  try {-->
<!--    reportLoading.value = true-->
<!--    showReportModal.value = true-->
<!--    const response = await api.get('/user/weekly-report')-->

<!--    // 使用Excel模板格式展示数据-->
<!--    weeklyReport.value = formatExcelStyleReport(response.data.data)-->
<!--  } catch (err) {-->
<!--    console.error('生成周报失败:', err)-->
<!--    error.value = `生成周报失败: ${err.message}`-->
<!--  } finally {-->
<!--    reportLoading.value = false-->
<!--  }-->
<!--}-->

<!--// 格式化Excel样式报告-->
<!--const formatExcelStyleReport = (reportData) => {-->
<!--  let html = `-->
<!--        <div class="excel-report">-->
<!--            <div class="report-header">-->
<!--                <h2>${reportData.report_title}</h2>-->
<!--                <p>填写日期：${reportData.fill_date}    报告填写人：${reportData.filler}</p>-->
<!--            </div>-->

<!--            <div class="two-columns">-->
<!--                <div class="column">-->
<!--                    <h3>本 周 工 作 总 结</h3>-->
<!--                    <table>-->
<!--                        <thead>-->
<!--                            <tr>-->
<!--                                <th>编号</th>-->
<!--                                <th>本周主要工作</th>-->
<!--                                <th>负责人</th>-->
<!--                                <th>辅助人</th>-->
<!--                                <th>完成情况</th>-->
<!--                            </tr>-->
<!--                        </thead>-->
<!--                        <tbody>-->
<!--    `-->

<!--  // 本周工作内容-->
<!--  reportData.current_week.forEach(task => {-->
<!--    html += `-->
<!--            <tr>-->
<!--                <td>${task.id}</td>-->
<!--                <td>${task.work}</td>-->
<!--                <td>${task.leader}</td>-->
<!--                <td>${task.assistant || '-'}</td>-->
<!--                <td>${task.status}</td>-->
<!--            </tr>-->
<!--        `-->
<!--  })-->

<!--  html += `-->
<!--                        </tbody>-->
<!--                    </table>-->

<!--                    <h3>运维工作遇到的主要问题</h3>-->
<!--                    <table>-->
<!--                        <thead>-->
<!--                            <tr>-->
<!--                                <th>编号</th>-->
<!--                                <th>本周运维工作遇到的主要问题</th>-->
<!--                                <th>是否解决</th>-->
<!--                                <th>负责人</th>-->
<!--                                <th>是否需要协助</th>-->
<!--                            </tr>-->
<!--                        </thead>-->
<!--                        <tbody>-->
<!--                            <tr>-->
<!--                                <td>1</td>-->
<!--                                <td>暂无记录</td>-->
<!--                                <td>-</td>-->
<!--                                <td>-</td>-->
<!--                                <td>否</td>-->
<!--                            </tr>-->
<!--                        </tbody>-->
<!--                    </table>-->
<!--                </div>-->

<!--                <div class="column">-->
<!--                    <h3>下 周 工 作 计 划</h3>-->
<!--                    <table>-->
<!--                        <thead>-->
<!--                            <tr>-->
<!--                                <th>编号</th>-->
<!--                                <th>下周工作主要内容</th>-->
<!--                                <th>计划完成时间</th>-->
<!--                                <th>负责人</th>-->
<!--                                <th>是否需要协助</th>-->
<!--                            </tr>-->
<!--                        </thead>-->
<!--                        <tbody>-->
<!--                            <tr>-->
<!--                                <td>1</td>-->
<!--                                <td>系统自动生成计划待补充</td>-->
<!--                                <td>-</td>-->
<!--                                <td>-</td>-->
<!--                                <td>否</td>-->
<!--                            </tr>-->
<!--                        </tbody>-->
<!--                    </table>-->

<!--                    <h3>下周可能会遇到的主要问题</h3>-->
<!--                    <table>-->
<!--                        <thead>-->
<!--                            <tr>-->
<!--                                <th>编号</th>-->
<!--                                <th>下周可能会遇到的主要问题</th>-->
<!--                                <th>负责人</th>-->
<!--                                <th>是否需要协助</th>-->
<!--                            </tr>-->
<!--                        </thead>-->
<!--                        <tbody>-->
<!--                            <tr>-->
<!--                                <td>1</td>-->
<!--                                <td>系统自动生成问题待补充</td>-->
<!--                                <td>-</td>-->
<!--                                <td>否</td>-->
<!--                            </tr>-->
<!--                        </tbody>-->
<!--                    </table>-->
<!--                </div>-->
<!--            </div>-->

<!--            <div class="suggestions">-->
<!--                <h3>意见及建议</h3>-->
<!--                <table>-->
<!--                    <thead>-->
<!--                        <tr>-->
<!--                            <th>编号</th>-->
<!--                            <th>意见及建议内容</th>-->
<!--                            <th>提出人</th>-->
<!--                        </tr>-->
<!--                    </thead>-->
<!--                    <tbody>-->
<!--                        <tr>-->
<!--                            <td>1</td>-->
<!--                            <td>系统自动生成建议待补充</td>-->
<!--                            <td>-</td>-->
<!--                        </tr>-->
<!--                    </tbody>-->
<!--                </table>-->
<!--            </div>-->
<!--        </div>-->
<!--    `-->

<!--  return html-->
<!--}-->
<!--</script>-->

<!--<style>-->
<!--body {-->
<!--  font-family: Arial, sans-serif;-->
<!--  background-color: #f5f5f5;-->
<!--  margin: 0;-->
<!--  padding: 0;-->
<!--}-->

<!--.app {-->
<!--  max-width: 1200px;-->
<!--  margin: 0 auto;-->
<!--  padding: 20px;-->
<!--}-->

<!--h1 {-->
<!--  text-align: center;-->
<!--  color: #333;-->
<!--}-->

<!--.container {-->
<!--  display: flex;-->
<!--  gap: 20px;-->
<!--}-->

<!--.task-list, .task-detail {-->
<!--  background-color: #fff;-->
<!--  padding: 20px;-->
<!--  border-radius: 8px;-->
<!--  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);-->
<!--}-->

<!--.task-list {-->
<!--  flex: 1;-->
<!--}-->

<!--.task-detail {-->
<!--  flex: 1;-->
<!--}-->

<!--.add-task {-->
<!--  display: flex;-->
<!--  gap: 10px;-->
<!--  margin-bottom: 20px;-->
<!--}-->

<!--.add-task input {-->
<!--  flex: 1;-->
<!--  padding: 10px;-->
<!--  border: 1px solid #ddd;-->
<!--  border-radius: 4px;-->
<!--}-->

<!--.add-task button {-->
<!--  padding: 10px 20px;-->
<!--  background-color: #007bff;-->
<!--  color: #fff;-->
<!--  border: none;-->
<!--  border-radius: 4px;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.add-task button:hover {-->
<!--  background-color: #0056b3;-->
<!--}-->

<!--ul {-->
<!--  list-style: none;-->
<!--  padding: 0;-->
<!--}-->

<!--li {-->
<!--  margin-bottom: 10px;-->
<!--}-->

<!--.task-item {-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  gap: 10px;-->
<!--  padding: 10px;-->
<!--  border: 1px solid #ddd;-->
<!--  border-radius: 4px;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.task-item:hover {-->
<!--  background-color: #f9f9f9;-->
<!--}-->

<!--.task-item.completed {-->
<!--  text-decoration: line-through;-->
<!--  color: #888;-->
<!--}-->

<!--.task-item input[type="checkbox"] {-->
<!--  cursor: pointer;-->
<!--}-->

<!--.task-item button {-->
<!--  margin-left: auto;-->
<!--  padding: 5px 10px;-->
<!--  background-color: #ff4d4d;-->
<!--  color: #fff;-->
<!--  border: none;-->
<!--  border-radius: 4px;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.task-item button:hover {-->
<!--  background-color: #cc0000;-->
<!--}-->

<!--.task-detail p {-->
<!--  margin: 10px 0;-->
<!--}-->

<!--.task-detail button {-->
<!--  padding: 10px 20px;-->
<!--  background-color: #ff4d4d;-->
<!--  color: #fff;-->
<!--  border: none;-->
<!--  border-radius: 4px;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.task-detail button:hover {-->
<!--  background-color: #cc0000;-->
<!--}-->
<!--/* Excel样式报告 */-->
<!--.excel-report {-->
<!--  font-family: Arial, sans-serif;-->
<!--  font-size: 14px;-->
<!--  color: #000;-->
<!--}-->

<!--.excel-report h2 {-->
<!--  text-align: center;-->
<!--  font-size: 18px;-->
<!--  margin-bottom: 5px;-->
<!--}-->

<!--.excel-report h3 {-->
<!--  font-size: 16px;-->
<!--  margin: 15px 0 10px;-->
<!--  color: #333;-->
<!--}-->

<!--.excel-report p {-->
<!--  margin: 5px 0 15px;-->
<!--  text-align: right;-->
<!--}-->

<!--.two-columns {-->
<!--  display: flex;-->
<!--  gap: 20px;-->
<!--}-->

<!--.column {-->
<!--  flex: 1;-->
<!--}-->

<!--.excel-report table {-->
<!--  width: 100%;-->
<!--  border-collapse: collapse;-->
<!--  margin-bottom: 20px;-->
<!--}-->

<!--.excel-report th, .excel-report td {-->
<!--  border: 1px solid #ddd;-->
<!--  padding: 8px 12px;-->
<!--  text-align: left;-->
<!--}-->

<!--.excel-report th {-->
<!--  background-color: #f2f2f2;-->
<!--  font-weight: bold;-->
<!--  text-align: center;-->
<!--}-->

<!--.excel-report tr:nth-child(even) {-->
<!--  background-color: #f9f9f9;-->
<!--}-->

<!--.suggestions {-->
<!--  margin-top: 20px;-->
<!--}-->
<!--</style>-->