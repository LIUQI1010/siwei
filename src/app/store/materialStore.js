import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";

export const useMaterialStore = create((set, get) => ({
  materialsOfClass: [],
  loading: false,
  error: null,

  fetchMaterials: async () => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.listMaterials();
      set({ materialsOfClass: response.classes });
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addMaterial: (class_id, material) =>
    set((state) => {
      const classes = state.materialsOfClass || [];
      const idx = classes.findIndex((c) => c.class_id === class_id);
      if (idx === -1) {
        return { materialsOfClass: classes };
      }

      const cls = classes[idx];
      const list = Array.isArray(cls.materials) ? cls.materials : [];
      const mat = { ...material, class_id }; // 确保带上 class_id

      // 按 file_id 去重/覆盖
      const pos = list.findIndex((m) => m.file_id === mat.file_id);
      const nextMaterials =
        pos >= 0
          ? list.map((m, i) => (i === pos ? { ...m, ...mat } : m))
          : [mat, ...list]; // 新增放前面；想放末尾用 [...list, mat]

      const nextClasses = classes.slice();
      nextClasses[idx] = { ...cls, materials: nextMaterials };
      return { materialsOfClass: nextClasses };
    }),

  deleteMaterial: async (class_id, file_id) => {
    try {
      // 先请求后端
      await apiService.deleteMaterial(class_id, file_id);

      // 成功后再更新本地状态
      set((state) => {
        const classes = state.materialsOfClass || [];
        const idx = classes.findIndex((c) => c.class_id === class_id);
        if (idx === -1) return { materialsOfClass: classes };

        const cls = classes[idx];
        const list = Array.isArray(cls.materials) ? cls.materials : [];
        const nextMaterials = list.filter((m) => m.file_id !== file_id);

        const nextClasses = classes.slice();
        nextClasses[idx] = { ...cls, materials: nextMaterials };

        return { materialsOfClass: nextClasses };
      });
    } catch (e) {
      // 可选：记录错误
      set({ error: e?.message || String(e) });
      throw e;
    }
  },

  filterByExpiredStatus: (status = "active") => {
    const list = get().materialsOfClass ?? [];
    if (status === "all") return list;
    if (status === "expired") return list.filter((c) => !!c.class_is_expired);
    return list.filter((c) => !c.class_is_expired); // 'active'
  },
}));
