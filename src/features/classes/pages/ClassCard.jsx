import React from "react";
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

const { Text, Paragraph } = Typography;

function StatusTag({ start, end }) {
  const now = dayjs();
  const s = dayjs(start);
  const e = dayjs(end);
  if (now.isBefore(s, "day")) return <Tag color="gold">未开始</Tag>;
  if (now.isAfter(e, "day")) return <Tag>已结束</Tag>;
  return <Tag color="processing">进行中</Tag>;
}

function ClassCard({ data }) {
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
    <Card
      hoverable
      title={class_name}
      extra={
        <Space>
          <Tag>{subject}</Tag> <StatusTag start={start_date} end={end_date} />
        </Space>
      }
      key={class_id}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Space size={8} wrap>
          <Tag>年级：{grade}</Tag>
          <Tag>
            <BookOutlined /> 课次：{lessons}
          </Tag>
          <Tag>
            <TeamOutlined /> 容量：{capacity}
          </Tag>
        </Space>

        <Text type="secondary">
          <UserOutlined /> 任课老师：
        </Text>
        <Text>{teacher_name || "-"}</Text>

        <Text type="secondary">
          <EnvironmentOutlined /> 教室/地点：
        </Text>
        <Text>{classroom || "-"}</Text>

        <Text type="secondary">
          <ClockCircleOutlined /> 上课时间：
        </Text>
        <Text>{class_time || "-"}</Text>

        <Text type="secondary">
          <CalendarOutlined /> 开始-结束：
        </Text>
        <Text>
          {dayjs(start_date).format("YYYY-MM-DD")} ~{" "}
          {dayjs(end_date).format("YYYY-MM-DD")}
        </Text>

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
  );
}

export default React.memo(ClassCard);
