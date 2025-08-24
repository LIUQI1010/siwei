import React from "react";
import { QRCode, Typography, Card, Space } from "antd";

export default function SettingPage() {
  return (
    <Card style={{ width: "100%", maxWidth: 420, margin: "0 auto" }}>
      <Space
        direction="vertical"
        align="center"
        size="large"
        style={{ width: "100%" }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          问题 / BUG 反馈
        </Typography.Title>
        <Typography.Text type="secondary">
          扫描下方二维码添加作者微信，反馈问题
        </Typography.Text>

        {/* 关键：让图片随容器缩放，但不超过 280px（可按需调） */}
        <img
          src="/images/qrcode.jpg"
          alt="二维码"
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
