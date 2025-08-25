import { create } from "zustand";
import { persist } from "zustand/middleware";
import { translations, getTranslation } from "./translations/index.js";

const useLanguageStore = create(
  persist(
    (set, get) => ({
      currentLanguage: "zh",

      // 设置语言
      setLanguage: (language) => {
        if (translations[language]) {
          set({ currentLanguage: language });
        }
      },

      // 切换语言
      toggleLanguage: () => {
        const current = get().currentLanguage;
        const newLanguage = current === "zh" ? "en" : "zh";
        set({ currentLanguage: newLanguage });
      },

      // 获取翻译文本
      t: (key, params = {}) => {
        const { currentLanguage } = get();
        return getTranslation(currentLanguage, key, params);
      },

      // 获取当前语言
      getCurrentLanguage: () => get().currentLanguage,

      // 检查是否为中文
      isZh: () => get().currentLanguage === "zh",
    }),
    {
      name: "language-store",
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
      }),
    }
  )
);

export { useLanguageStore };
