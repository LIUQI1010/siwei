import React from "react";
import { QRCode, Typography, Card, Space } from "antd";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export default function SettingPage() {
  const { t } = useTranslation();

  return (
    <Card style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <Space
        direction="vertical"
        align="center"
        size="large"
        style={{ width: "100%" }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t("settingPage_feedbackTitle")}
        </Typography.Title>
        <Typography.Text type="secondary">
          {t("settingPage_feedbackDescription")}
        </Typography.Text>

        {/* 关键：让图片随容器缩放，但不超过 280px（可按需调） */}
        <img
          src="/images/qrcode.jpg"
          alt={t("settingPage_qrcodeAlt")}
          style={{
            width: "100%",
            maxWidth: 280,
            height: "auto",
            display: "block",
          }}
        />
      </Space>
    </Card>
  );
}
