import React from "react";
import { Card, Tag, Space, Typography, Divider, Statistic } from "antd";
import {
  FieldTimeOutlined,
  CalendarOutlined,
  ContainerOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/zh-cn";
import { useClassStore } from "../../../app/store/classStore";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("zh-cn");

const { Text } = Typography;

function getStatus(dueAtISO) {
  const now = dayjs();
  const due = dayjs(dueAtISO);
  const diffHours = due.diff(now, "hour", true);
  if (diffHours < 0) return { color: "red", text: "已逾期", overdue: true };
  if (diffHours <= 24)
    return { color: "gold", text: "即将到期", overdue: false };
  return { color: "processing", text: "未到期", overdue: false };
}

export default function PendingHomeworkCard({ data }) {
  const { class_id, lesson_id, created_at, due_at } = data;
  const getClassName = useClassStore((s) => s.getClassName);
  const class_name = getClassName(class_id);
  const status = getStatus(due_at);
  const title = `${class_name} · 第${String(lesson_id).padStart(2, "0")}课作业`;

  return (
    <Card
      hoverable
      title={title}
      extra={<Tag color={status.color}>{status.text}</Tag>}
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <Text type="secondary">
          <ContainerOutlined /> 布置时间：
        </Text>
        <Text>{dayjs(created_at).tz().format("YYYY-MM-DD HH:mm")}</Text>

        <Text type="secondary">
          <CalendarOutlined /> 截止时间：
        </Text>
        <Text>
          {dayjs(due_at).tz().format("YYYY-MM-DD HH:mm")}（
          {dayjs(due_at).fromNow()}）
        </Text>

        <Divider style={{ margin: "8px 0" }} />

        {status.overdue ? (
          <Text type="danger">
            <FieldTimeOutlined /> 已超过截止时间
          </Text>
        ) : (
          <Statistic.Countdown
            title="剩余时间"
            value={dayjs(due_at).valueOf()}
            format="D 天 H 时 m 分 s 秒"
          />
        )}
      </Space>
    </Card>
  );
}
