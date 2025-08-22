import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";

export const useHomeworkStore = create((set, get) => ({
  pending: [],
  submitted: [],
  graded: [],

  loading: false,
  error: "",

  fetchPendingHW: async () => {
    try {
      set({ loading: true });
      const response = await apiService.getPendingHW();
      set({ pending: response });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchSubmittedHW: async () => {
    try {
      set({ loading: true });
      const response = await apiService.getSubmittedHW();
      set({ submitted: response });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchGradedHW: async () => {
    try {
      set({ loading: true });
      const response = await apiService.getGradedHW();
      set({ graded: response });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  getQuestion: (class_id, lesson_id) => {
    const { submitted, graded } = get();

    const pickItems = (bucket) =>
      Array.isArray(bucket?.items)
        ? bucket.items
        : Array.isArray(bucket)
        ? bucket
        : [];

    const byClassLesson = (arr) =>
      arr.find(
        (it) =>
          it?.class_id === class_id &&
          String(it?.lesson_id) === String(lesson_id)
      );

    const hit =
      byClassLesson(pickItems(submitted)) || byClassLesson(pickItems(graded));

    return hit?.question ?? null; // 未提交或没找到时为 null
  },
}));
