import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";

// 创建消息store
export const useMessageStore = create((set, get) => ({
  // 状态
  messages: {
    pendingHomework: 0,
    pendingGrading: 0,
    homeworkAlerts: [],
    gradingAlerts: [],
  },

  // 加载状态
  loading: false,
  error: null,

  // 获取dashboard统计数据
  fetchDashboardStats: async () => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.getDashboardStats();
      // console.log(response);

      // 处理响应数据
      if (response) {
        const pendingHomework = response?.stats?.pending_homework || 0;
        const pendingGrading = response?.stats?.pending_grading || 0;
        const homeworkAlerts = response?.homework_alerts || [];
        const gradingAlerts = response?.grading_alerts || [];

        set({
          messages: {
            pendingHomework,
            pendingGrading,
            homeworkAlerts,
            gradingAlerts,
          },
          loading: false,
        });
      } else {
        set({
          messages: {
            pendingHomework: 0,
            pendingGrading: 0,
            homeworkAlerts: [],
            gradingAlerts: [],
          },
        });
        set({ loading: false });
      }

      return response;
    } catch (error) {
      console.error("获取dashboard数据失败:", error);
      set({
        error: error.message || "获取数据失败",
        loading: false,
      });
      throw error;
    }
  },

  // 重置错误状态
  clearError: () => {
    set({ error: null });
  },

  onStudentSubmitted: ({ class_id, lesson_id, alertsDeleted = 1 } = {}) =>
    set((state) => {
      const prev = state.messages || {};
      const list = prev.homeworkAlerts || [];

      // 删除同班同课次的所有待办（如果有重复提醒，会一次性清掉）
      const after = list.filter(
        (a) =>
          !(
            a.class_id === class_id && String(a.lesson_id) === String(lesson_id)
          )
      );

      const removed = list.length - after.length;
      const dec = alertsDeleted ?? (removed || 1); // 优先用后端返回的删除条数

      const cur = Number.isFinite(prev.pendingHomework)
        ? prev.pendingHomework
        : 0;
      const nextCount = Math.max(0, cur - dec); // 不得为负

      return {
        messages: {
          ...prev,
          homeworkAlerts: after,
          pendingHomework: nextCount,
        },
      };
    }),

  // 批改完成后更新本地状态
  onGradingCompleted: ({
    class_id,
    lesson_id,
    student_id,
    alertsDeleted = 1,
  } = {}) =>
    set((state) => {
      const prev = state.messages || {};
      const list = prev.gradingAlerts || [];

      // 删除对应的批改提醒（根据班级、课次、学生ID匹配）
      const after = list.filter(
        (a) =>
          !(
            a.class_id === class_id &&
            String(a.lesson_id) === String(lesson_id) &&
            a.student_id === student_id
          )
      );

      const removed = list.length - after.length;
      const dec = alertsDeleted ?? (removed || 1); // 优先用实际删除的条数

      const cur = Number.isFinite(prev.pendingGrading)
        ? prev.pendingGrading
        : 0;
      const nextCount = Math.max(0, cur - dec); // 不得为负

      return {
        messages: {
          ...prev,
          gradingAlerts: after,
          pendingGrading: nextCount,
        },
      };
    }),
}));
