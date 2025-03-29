<template>
  <div class="excel-report-container">
    <template>
      <div class="excel-report-container">
        <!-- 主标题 -->
        <div class="excel-header">
          <div class="excel-title">运维服务周报(10湖南-安化运维周报2025年第10周)</div>
          <div class="excel-subtitle">填写日期：2025年03月14日    报告填写人：余湘</div>
        </div>

        <!-- 双栏布局 -->
        <div class="excel-two-column">
          <!-- 左栏：本周工作 -->
          <div class="excel-column">
            <div class="excel-section-title">本 周 工 作 总 结</div>
            <table class="excel-table">
              <thead>
              <tr>
                <th style="width: 50px">编号</th>
                <th>本周主要工作</th>
                <th style="width: 80px">负责人</th>
                <th style="width: 80px">辅助人</th>
                <th style="width: 100px">完成情况</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(task, index) in currentWeekTasks" :key="'current-'+index">
                <td>{{ task.id }}</td>
                <td>{{ task.name }}</td>
                <td>{{ task.leader }}</td>
                <td>{{ task.assistant }}</td>
                <td :class="'status-' + task.status">{{ task.status }}</td>
              </tr>
              </tbody>
            </table>

            <!-- 本周问题 -->
            <div class="excel-section-title">运维工作遇到的主要问题</div>
            <table class="excel-table">
              <thead>
              <tr>
                <th style="width: 50px">编号</th>
                <th>1.本周运维工作遇到的主要问题</th>
                <th style="width: 80px">是否解决</th>
                <th style="width: 80px">负责人</th>
                <th style="width: 120px">是否需要协助</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(problem, index) in currentProblems" :key="'problem-'+index">
                <td>{{ problem.id }}</td>
                <td>{{ problem.description }}</td>
                <td>{{ problem.solved }}</td>
                <td>{{ problem.leader }}</td>
                <td>{{ problem.assistance }}</td>
              </tr>
              </tbody>
            </table>
          </div>

          <!-- 右栏：下周计划 -->
          <div class="excel-column">
            <div class="excel-section-title">下 周 工 作 计 划</div>
            <table class="excel-table">
              <thead>
              <tr>
                <th style="width: 50px">编号</th>
                <th>下周工作主要内容</th>
                <th style="width: 120px">计划完成时间</th>
                <th style="width: 80px">负责人</th>
                <th style="width: 120px">是否需要协助</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(plan, index) in nextWeekPlans" :key="'plan-'+index">
                <td>{{ plan.id }}</td>
                <td>{{ plan.name }}</td>
                <td>{{ plan.deadline }}</td>
                <td>{{ plan.leader }}</td>
                <td>{{ plan.assistance }}</td>
              </tr>
              </tbody>
            </table>

            <!-- 下周问题 -->
            <div class="excel-section-title">2.下周可能会遇到的主要问题</div>
            <table class="excel-table">
              <thead>
              <tr>
                <th style="width: 50px">编号</th>
                <th>问题描述</th>
                <th style="width: 80px">负责人</th>
                <th style="width: 120px">是否需要协助</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(problem, index) in nextProblems" :key="'next-problem-'+index">
                <td>{{ problem.id }}</td>
                <td>{{ problem.description }}</td>
                <td>{{ problem.leader }}</td>
                <td>{{ problem.assistance }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 意见及建议 -->
        <div class="excel-section-title">意见及建议</div>
        <table class="excel-table">
          <thead>
          <tr>
            <th style="width: 50px">编号</th>
            <th>意见及建议内容</th>
            <th style="width: 100px">提出人</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(suggestion, index) in suggestions" :key="'suggestion-'+index">
            <td>{{ suggestion.id }}</td>
            <td>{{ suggestion.content }}</td>
            <td>{{ suggestion.proposer }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </template>

    <script>
      export default {
        data() {
          return {
            currentWeekTasks: [
              { id: 1, name: '机房巡检', leader: '熊棋', assistant: '余湘', status: '已完成' },
              { id: 2, name: '灭火器检查', leader: '熊棋', assistant: '余湘', status: '已完成' },
              // 其他任务...
            ],
            currentProblems: [
              { id: 1, description: '无', solved: '已解决', leader: '熊棋', assistance: '否' }
            ],
            nextWeekPlans: [
              { id: 1, name: '系统升级', deadline: '2025-03-20', leader: '熊棋', assistance: '否' }
            ],
            nextProblems: [
              { id: 1, description: '可能出现的兼容性问题', leader: '熊棋', assistance: '否' }
            ],
            suggestions: [
              { id: 1, content: '无', proposer: 'XXX' }
            ]
          }
        }
      }
    </script>
  </div>
</template>

<script>
export default {
  props: ['reportData'], // 接收外部数据
  data() {
    return {
      // 保留示例数据作为默认值
    }
  }
}
</script>

<style scoped>
/* 基础容器 */
.excel-report-container {
  font-family: "Microsoft YaHei", Arial, sans-serif;
  background-color: #ffffff;
  padding: 15px;
  color: #000000;
  line-height: 1.5;
}

/* 标题样式 */
.excel-header {
  margin-bottom: 20px;
  text-align: center;
}
.excel-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}
.excel-subtitle {
  font-size: 12px;
  text-align: right;
}

/* 双栏布局 */
.excel-two-column {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.excel-column {
  flex: 1;
}

/* 表格样式 - 精确还原Excel */
.excel-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  font-size: 12px;
  table-layout: fixed;
}
.excel-table th, .excel-table td {
  border: 1px solid #d4d4d4;
  padding: 5px 8px;
  word-wrap: break-word;
}
.excel-table th {
  background-color: #4472c4;
  color: white;
  font-weight: bold;
  text-align: center;
}
.excel-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

/* 状态标签 */
.status-已完成 {
  color: #52c41a;
  background-color: #f6ffed;
}
.status-进行中 {
  color: #fa8c16;
  background-color: #fff7e6;
}

/* 区块标题 */
.excel-section-title {
  font-weight: bold;
  margin: 15px 0 8px 0;
  font-size: 14px;
}

/* 打印优化 */
@media print {
  .excel-report-container {
    padding: 0;
  }
  .excel-table {
    page-break-inside: avoid;
  }
}
</style>