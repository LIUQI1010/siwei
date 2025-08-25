import React, { useState } from "react";
import { FloatButton, Tooltip } from "antd";
import { useTranslation } from "../i18n/hooks/useTranslation";

const LanguageSwitcher = () => {
  const { currentLanguage, toggleLanguage, t } = useTranslation();
  const [isClicked, setIsClicked] = useState(false);

  const getLanguageText = () => {
    return currentLanguage === "zh" ? "中" : "EN";
  };

  const getTooltipText = () => {
    return currentLanguage === "zh"
      ? t("switchToEnglish")
      : t("switchToChinese");
  };

  const handleClick = () => {
    setIsClicked(true);
    toggleLanguage();

    // 重置动画状态
    setTimeout(() => {
      setIsClicked(false);
    }, 200);
  };

  return (
    <Tooltip title={getTooltipText()} placement="left">
      <FloatButton
        onClick={handleClick}
        style={{
          right: 24,
          bottom: 24,
          width: 50,
          height: 50,
          transition: "all 0.2s ease",
          transform: isClicked ? "scale(0.9)" : "scale(1)",
          boxShadow: isClicked
            ? "0 2px 8px rgba(24, 144, 255, 0.6)"
            : "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        icon={
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#1890ff",
              textAlign: "center",
              lineHeight: 1,
              transition: "all 0.2s ease",
              transform: isClicked ? "rotate(360deg)" : "rotate(0deg)",
            }}
          >
            {getLanguageText()}
          </div>
        }
      />
    </Tooltip>
  );
};

export default LanguageSwitcher;
