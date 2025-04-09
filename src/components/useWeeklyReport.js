// src/composables/useWeeklyReport.js
import { ref, computed, watch } from 'vue'

export default function useWeeklyReport(tasksRef) {
    // 状态
    const showReportForm = ref(false)
    const generatingReport = ref(false)

    // 计算当前周数
    const getWeekNumber = () => {
        const date = new Date()
        date.setHours(0, 0, 0, 0)
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
        const week1 = new Date(date.getFullYear(), 0, 4)
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
    }

    // 表单数据
    const reportForm = ref({
        reportTitle: `运维服务周报(${new Date().getFullYear()}年第${getWeekNumber()}周)`,
        filler: localStorage.getItem('username') || '运维人员',
        currentWeekTasks: []
    })

    // 计算已完成任务
    const completedTasks = computed(() => {
        return tasksRef.value.filter(task => task.done)
    })

    // 自动填充任务数据
    watch(completedTasks, (newTasks) => {
        reportForm.value.currentWeekTasks = newTasks.map(task => ({
            work: `${task.taskType || '运维'}: ${task.name}`,
            leader: task.uploader || '运维组',
            assistant: task.assistant || '',
            status: '已完成',
            content: task.content || ''
        }))
    }, { immediate: true })

    // 添加任务行
    const addTask = () => {
        reportForm.value.currentWeekTasks.push({
            work: '',
            leader: '',
            assistant: '',
            status: '已完成',
            content: ''
        })
    }

    // 删除任务行
    const removeTask = (index) => {
        reportForm.value.currentWeekTasks.splice(index, 1)
    }

    // 生成周报
    const generateReport = async () => {
        generatingReport.value = true
        try {
            // 实际项目中替换为API调用
            console.log('生成周报数据:', JSON.parse(JSON.stringify(reportForm.value)))
            await new Promise(resolve => setTimeout(resolve, 1500))
            alert('周报已生成！')
            showReportForm.value = false
        } catch (error) {
            console.error('周报生成失败:', error)
            alert(`生成失败: ${error.message}`)
        } finally {
            generatingReport.value = false
        }
    }

    return {
        showReportForm,
        generatingReport,
        reportForm,
        completedTasks,
        addTask,
        removeTask,
        generateReport
    }
}