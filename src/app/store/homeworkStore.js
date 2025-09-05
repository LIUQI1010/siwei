import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";

export const useHomeworkStore = create((set, get) => ({
  //学生的作业信息
  pending: [],
  submitted: [],
  graded: [],

  //老师的作业信息
  ongoing: [],
  ended: [],

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

  fetchOngoingHW: async () => {
    try {
      set({ loading: true });
      const response = await apiService.listHW("ongoing");
      set({ ongoing: response });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchEndedHW: async () => {
    try {
      set({ loading: true });
      const response = await apiService.listHW("ended");
      set({ ended: response });
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

  updateQuestionLocal: (class_id, lesson_id, question) => {
    const { submitted, graded } = get();

    const getItems = (bucket) =>
      Array.isArray(bucket?.items)
        ? bucket.items
        : Array.isArray(bucket)
        ? bucket
        : [];

    const buildBucket = (oldBucket, newItems) =>
      Array.isArray(oldBucket?.items) || typeof oldBucket?.count === "number"
        ? {
            count:
              typeof oldBucket?.count === "number"
                ? oldBucket.count
                : newItems.length,
            items: newItems,
          }
        : newItems;

    const match = (it) =>
      it?.class_id === class_id && String(it?.lesson_id) === String(lesson_id);

    let found = false;

    const newSubmitted = getItems(submitted).map((it) => {
      if (match(it)) {
        found = true;
        return { ...it, question };
      }
      return it;
    });
    const newGraded = getItems(graded).map((it) => {
      if (match(it)) {
        found = true;
        return { ...it, question };
      }
      return it;
    });

    set({
      submitted: buildBucket(submitted, newSubmitted),
      graded: buildBucket(graded, newGraded),
      error: found ? "" : "未找到对应提交记录（仅提交/已批改可更新）",
    });

    return found; // true=已更新，false=未找到
  },
}));
