import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";

export const useClassStore = create((set, get) => ({
  classes: [],
  loading: false,
  error: null,

  fetchClasses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiService.listClasses();
      set({ classes: data.classes });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  getClassName: (class_id) => {
    const list = get().classes;
    const found = Array.isArray(list)
      ? list.find((c) => c.class_id === class_id)
      : undefined;
    return found?.class_name ?? ""; // 没找到就返回空字符串
  },
}));
