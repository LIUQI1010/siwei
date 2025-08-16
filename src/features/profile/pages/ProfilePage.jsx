import React, { useState, useEffect } from "react";
import { useProfileStore } from "../../../app/store/profileStore";
import { Card, Descriptions, theme } from "antd";

export default function ProfilePage() {
  const { profile, loading, error } = useProfileStore();
  const { token } = theme.useToken(); // 用主题色，避免写死颜色

  if (error) {
    return <div>错误: {error}</div>;
  }

  if (!profile) {
    return <div>暂无数据</div>;
  }

  return (
    <div>
      <Card
        title="个人信息"
        hoverable
        loading={loading}
        variant="borderless"
        extra={<a href="#">编辑</a>}
      >
        <Descriptions
          column={1} // ← 一行一个
          colon
          styles={{
            label: { width: 80, color: token.colorTextSecondary },
            content: {
              color: token.colorText,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
          }}
        >
          <Descriptions.Item label="姓名">
            {profile.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">
            {profile.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="电话">
            {profile.phone || "-"}
          </Descriptions.Item>
          {profile.role === "student" && (
            <Descriptions.Item label="年级">
              {profile.grade || "-"}年级
            </Descriptions.Item>
          )}
          <Descriptions.Item label="个人简介">
            {profile.personalIntro || "暂无简介"}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
