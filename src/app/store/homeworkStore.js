import { create } from "zustand";
import { apiService } from "../../shared/services/apiClient";
import { useMessageStore } from "./messageStore";

export const useHomeworkStore = create((set, get) => ({
  pending: [],
  ungraded: [],
  graded: [],

  loading: false,
  error: "",
}));
