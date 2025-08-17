import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";
import { AmplifyAuthService } from "../../shared/services/amplifyAuth";

export const useProfileStore = create((set, get) => ({
  profile: {
    name: "",
    email: "",
    phone: "",
    personalIntro: "",
    grade: 0,
  },

  role: "",

  loading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ loading: true, error: null });
      const response = await apiService.getProfile();
      const userInfo = await AmplifyAuthService.getCurrentUserInfo();
      set({
        profile: {
          name: response.name,
          email: response.email,
          phone: response.phone,
          personalIntro: response.personalIntro,
          grade: response.grade,
        },
        role: userInfo.role,
        loading: false,
      });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProfile: (patch) =>
    set((s) => ({ profile: { ...s.profile, ...patch } })),

  saveProfile: async () => {
    try {
      set({ error: null });
      const payload = get().profile;
      const res = await apiService.updateProfile(payload);
      set({
        profile: { ...res, ...payload },
      });
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },
}));
