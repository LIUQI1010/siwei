import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";

// 初始状态
const initialState = {};

export const useStudentStore = create((set) => ({
  ...initialState,
  
  // 重置状态（用户登出时调用）
  reset: () => set(initialState),
}));
