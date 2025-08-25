import React from "react";
import { Typography, Card, Space, Divider, Avatar } from "antd";
import {
  MessageOutlined,
  WechatOutlined,
  BugOutlined,
} from "@ant-design/icons";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export default function SettingPage() {
  const { t } = useTranslation();

  return (
    <div
      style={{
        padding: "40px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          border: "none",
          overflow: "hidden",
        }}
      >
        <Space
          direction="vertical"
          align="center"
          size="large"
          style={{ width: "100%" }}
        >
          {/* Header Section */}
          <div style={{ textAlign: "center" }}>
            <Typography.Title
              level={3}
              style={{
                margin: "0 0 8px 0",
                background: "linear-gradient(135deg, #1890ff, #722ed1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 600,
              }}
            >
              {t("settingPage_feedbackTitle")}
            </Typography.Title>
          </div>

          {/* Description */}
          <Typography.Paragraph
            style={{
              textAlign: "center",
              fontSize: "16px",
              color: "#666",
              lineHeight: 1.6,
            }}
          >
            {t("settingPage_feedbackDescription")}
          </Typography.Paragraph>

          {/* QR Code Section */}
          <div
            style={{
              background: "#fafafa",
              borderRadius: "12px",
              padding: "20px",
              border: "2px dashed #d9d9d9",
              transition: "all 0.3s ease",
            }}
          >
            <img
              src="/images/qrcode.jpg"
              alt={t("settingPage_qrcodeAlt")}
              style={{
                width: "100%",
                maxWidth: 240,
                height: "auto",
                display: "block",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>

          {/* Developer Note */}
          <div
            style={{
              background: "rgba(24, 144, 255, 0.05)",
              border: "1px solid rgba(24, 144, 255, 0.15)",
              borderRadius: "12px",
              padding: "16px 20px",
              margin: "8px 0",
              width: "100%",
            }}
          >
            <Typography.Text
              style={{
                fontSize: "14px",
                fontStyle: "italic",
                textAlign: "center",
                color: "#1890ff",
                display: "block",
                lineHeight: 1.5,
              }}
            >
              <BugOutlined style={{ marginRight: "6px" }} />
              {t("settingPage_developerNote")}
            </Typography.Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
