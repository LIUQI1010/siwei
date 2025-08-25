import React from "react";
import { Card, Space, Button } from "antd";
import { useTranslation } from "../i18n/hooks/useTranslation";

const TranslationTest = () => {
  const { t, currentLanguage, toggleLanguage } = useTranslation();

  return (
    <Card title={t("translationTest_title")} style={{ margin: 20 }}>
      <Space direction="vertical" size="middle">
        <div>
          <strong>{t("translationTest_currentLanguage")}:</strong>{" "}
          {currentLanguage}
        </div>

        <div>
          <strong>{t("translationTest_commonTranslations")}:</strong>
          <ul>
            <li>{t("login")}</li>
            <li>{t("logout")}</li>
            <li>{t("dashboard")}</li>
            <li>{t("profile")}</li>
          </ul>
        </div>

        <div>
          <strong>{t("translationTest_authTranslations")}:</strong>
          <ul>
            <li>{t("loginPage_title")}</li>
            <li>{t("loginPage_subtitle")}</li>
            <li>{t("registerPage_title")}</li>
            <li>{t("registerPage_email")}</li>
          </ul>
        </div>

        <Button type="primary" onClick={toggleLanguage}>
          {t("translationTest_switchLanguage")}
        </Button>
      </Space>
    </Card>
  );
};

export default TranslationTest;
