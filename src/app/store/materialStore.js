import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";

export const useMaterialStore = create((set, get) => ({
  materials: null,
  loading: false,
  error: null,

  fetchMaterials: async () => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.listMaterials();
      set({ materials: response });
      set({ loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
