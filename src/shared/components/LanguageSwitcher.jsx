import React from "react";
import { FloatButton, Tooltip } from "antd";
import { useTranslation } from "../i18n/hooks/useTranslation";

const LanguageSwitcher = () => {
  const { currentLanguage, toggleLanguage, t } = useTranslation();

  const getLanguageText = () => {
    return currentLanguage === "zh" ? "中" : "EN";
  };

  const getTooltipText = () => {
    return currentLanguage === "zh"
      ? t("switchToEnglish")
      : t("switchToChinese");
  };

  return (
    <Tooltip title={getTooltipText()} placement="left">
      <FloatButton
        onClick={toggleLanguage}
        style={{
          right: 24,
          bottom: 24,
          width: 50,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        description={
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#1890ff",
              textAlign: "center",
              lineHeight: 1,
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
