import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";
import dayjs from "dayjs";

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

  // 计算单个班级的状态：upcoming / ongoing / finished
  getStatus: (cls, now = dayjs()) => {
    const s = dayjs(cls.start_date);
    const e = dayjs(cls.end_date);
    if (now.isBefore(s, "day")) return "upcoming";
    if (now.isAfter(e, "day")) return "finished";
    return "ongoing";
  },

  // 按状态取列表（不修改 state，按需计算，永远最新）
  getByStatus: (status = "ongoing") => {
    const list = get().classes;
    if (!Array.isArray(list)) return [];
    if (status === "all") return list;
    const now = dayjs();
    return list.filter((cls) => get().getStatus(cls, now) === status);
  },

  // 便捷函数
  ongoingClasses: () => get().getByStatus("ongoing"),
  finishedClasses: () => get().getByStatus("finished"),
  upcomingClasses: () => get().getByStatus("upcoming"),

  // 统计
  counts: () => {
    const list = get().classes || [];
    const now = dayjs();
    let ongoing = 0,
      finished = 0,
      upcoming = 0;
    for (const cls of list) {
      const st = get().getStatus(cls, now);
      if (st === "ongoing") ongoing++;
      else if (st === "finished") finished++;
      else upcoming++;
    }
    return { ongoing, finished, upcoming, total: list.length };
  },
}));
