// 翻译系统入口
import { zhTranslations } from "./zh/index.js";
import { enTranslations } from "./en/index.js";

export const translations = {
  zh: zhTranslations,
  en: enTranslations,
};

// 获取翻译文本的工具函数
export function getTranslation(language, key, params = {}) {
  let text = translations[language]?.[key] || key;

  // 替换参数 {param} 格式
  Object.keys(params).forEach((param) => {
    text = text.replace(new RegExp(`\\{${param}\\}`, "g"), params[param]);
  });

  return text;
}
