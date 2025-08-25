import { useLanguageStore } from "../store.js";

/**
 * 翻译 Hook
 * @returns {object} - { t, currentLanguage, toggleLanguage, isZh }
 */
export function useTranslation() {
  const { t, currentLanguage, toggleLanguage, isZh } = useLanguageStore();

  return {
    t,
    currentLanguage,
    toggleLanguage,
    isZh,
  };
}
