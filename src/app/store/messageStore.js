import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";

// 创建消息store
export const useMessageStore = create((set, get) => ({
  // 状态
  messages: {
    pendingHomework: null,
    pendingGrading: null,
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

      // 处理响应数据
      const pendingHomework = response.stats.pending_homework || 0;
      const pendingGrading = response.stats.pending_grading || 0;
      const homeworkAlerts = response.homework_alerts || [];
      const gradingAlerts = response.grading_alerts || [];

      set({
        messages: {
          pendingHomework,
          pendingGrading,
          homeworkAlerts,
          gradingAlerts,
        },
        loading: false,
      });

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
}));
