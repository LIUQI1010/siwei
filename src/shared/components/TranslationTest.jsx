import React from "react";
import { Card, Space, Button } from "antd";
import { useTranslation } from "../i18n/hooks/useTranslation";

const TranslationTest = () => {
  const { t, currentLanguage, toggleLanguage } = useTranslation();

  return (
    <Card title="翻译功能测试" style={{ margin: 20 }}>
      <Space direction="vertical" size="middle">
        <div>
          <strong>当前语言:</strong> {currentLanguage}
        </div>

        <div>
          <strong>通用翻译测试:</strong>
          <ul>
            <li>{t("login")}</li>
            <li>{t("logout")}</li>
            <li>{t("dashboard")}</li>
            <li>{t("profile")}</li>
          </ul>
        </div>

        <div>
          <strong>认证模块翻译测试:</strong>
          <ul>
            <li>{t("loginPage_title")}</li>
            <li>{t("loginPage_subtitle")}</li>
            <li>{t("registerPage_title")}</li>
            <li>{t("registerPage_email")}</li>
          </ul>
        </div>

        <Button type="primary" onClick={toggleLanguage}>
          切换语言 / Switch Language
        </Button>
      </Space>
    </Card>
  );
};

export default TranslationTest;
