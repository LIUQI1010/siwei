import React, { useState } from "react";
import { Card, Tag, Space, Typography, Button, Divider } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ClockCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useProfileStore } from "../../../app/store/profileStore";

const { Text, Paragraph } = Typography;

function StatusTag({ start, end }) {
  const now = dayjs();
  const s = dayjs(start);
  const e = dayjs(end);
  if (now.isBefore(s, "day")) return <Tag color="gold">未开始</Tag>;
  if (now.isAfter(e, "day")) return <Tag>已结束</Tag>;
  return <Tag color="processing">进行中</Tag>;
}

function ClassCard({ data, showDrawer }) {
  const { role } = useProfileStore();
  const {
    class_id,
    class_name,
    subject,
    grade,
    teacher_name,
    classroom,
    class_time,
    capacity,
    lessons,
    start_date,
    end_date,
    description,
  } = data;

  return (
    <>
      <Card
        styles={{
          header: {
            paddingTop: 16,
            paddingBottom: 12,
            minHeight: 64,
          },
        }}
        hoverable
        title={
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* 第一行：班级名（单行省略 + tooltip） */}
            <div
              title={class_name}
              style={{
                fontSize: 18, // 或 18，看你的视觉规范
                fontWeight: 600,
                lineHeight: "22px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {class_name}
            </div>

            {/* 第二行：标签 */}
            <div>
              <Space size={2} wrap>
                <StatusTag start={start_date} end={end_date} />
                <Tag>{subject}</Tag>
                <Tag>年级：{grade}</Tag>
              </Space>
            </div>
          </div>
        }
        extra={
          role === "teacher" && (
            <Button
              type="link"
              size="small"
              onClick={() => showDrawer(class_id, class_name)}
            >
              详情
            </Button>
          )
        }
        key={class_id}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <div className="field-grid-aligned">
            <span className="icon">
              <UserOutlined />
            </span>
            <span className="label">任课老师</span>
            <span className="colon">：</span>
            <span className="value">{teacher_name || "-"}</span>

            <span className="icon">
              <EnvironmentOutlined />
            </span>
            <span className="label">教室/地点</span>
            <span className="colon">：</span>
            <span className="value">{classroom || "-"}</span>

            <span className="icon">
              <ClockCircleOutlined />
            </span>
            <span className="label">上课时间</span>
            <span className="colon">：</span>
            <span className="value">{class_time || "-"}</span>

            <span className="icon">
              <BookOutlined />
            </span>
            <span className="label">总课时</span>
            <span className="colon">：</span>
            <span className="value">{lessons} 课时</span>

            <span className="icon">
              <TeamOutlined />
            </span>
            <span className="label">最大人数</span>
            <span className="colon">：</span>
            <span className="value">{capacity} 人</span>

            <span className="icon">
              <CalendarOutlined />
            </span>
            <span className="label">开始日期</span>
            <span className="colon">：</span>
            <span className="value">
              {start_date ? dayjs(start_date).format("YYYY-MM-DD") : "-"}
            </span>

            <span className="icon">
              <CalendarOutlined />
            </span>
            <span className="label">结束日期</span>
            <span className="colon">：</span>
            <span className="value">
              {end_date ? dayjs(end_date).format("YYYY-MM-DD") : "-"}
            </span>
          </div>

          {description && (
            <>
              <Divider style={{ margin: "8px 0" }} />
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 2, expandable: true, symbol: "展开" }}
              >
                {description}
              </Paragraph>
            </>
          )}
        </Space>
      </Card>
    </>
  );
}

export default React.memo(ClassCard);
