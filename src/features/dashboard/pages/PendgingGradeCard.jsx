import React from "react";
import { Card, Space, Typography, Statistic } from "antd";
import {
  FieldTimeOutlined,
  CalendarOutlined,
  ContainerOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/zh-cn";
import { useClassStore } from "../../../app/store/classStore";
import { motion } from "framer-motion";
import { generatePath, Link } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("zh-cn");

const { Text, Paragraph } = Typography;

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
  const {
    class_id,
    lesson_id,
    created_at,
    due_at,
    student_name,
    submitted_at,
    student_id,
  } = data;
  const getClassName = useClassStore((s) => s.getClassName);
  const class_name = getClassName(class_id);
  const status = getStatus(due_at);
  const to = generatePath(
    "/homework/grade/:classId/:lessonId/:studentId/:studentName",
    {
      classId: class_id,
      lessonId: lesson_id,
      studentId: student_id,
      studentName: student_name,
    }
  );

  return (
    <Link to={to}>
      <Card
        styles={{
          header: { paddingTop: 16, paddingBottom: 12, minHeight: 64 },
        }}
        hoverable
        title={
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: 18 }}>
              {class_name}
            </Text>
            <Text type="secondary">
              第{String(lesson_id).padStart(2, "0")}课作业
            </Text>
          </Space>
        }
        extra={
          status.overdue ? (
            <Text type="danger">
              <FieldTimeOutlined /> 已截止
            </Text>
          ) : (
            <Statistic.Timer
              type="countup"
              title="提交时间"
              value={dayjs(submitted_at)}
              format="D 天 H 时 m 分"
              valueStyle={{ fontSize: 12, lineHeight: "16px" }}
            />
          )
        }
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Text type="secondary">
            <UserOutlined /> 学生：{student_name}
          </Text>
          <Text type="secondary">
            <ContainerOutlined /> 布置时间：
            {dayjs(created_at).tz().format("YYYY-MM-DD HH:mm")}
          </Text>

          <Text type="secondary">
            <CalendarOutlined /> 截止时间：
            {dayjs(due_at).tz().format("YYYY-MM-DD HH:mm")}
          </Text>
          <Text type="secondary">
            <CalendarOutlined /> 提交时间：
            {dayjs(submitted_at).tz().format("YYYY-MM-DD HH:mm")}
          </Text>
        </Space>
      </Card>
    </Link>
  );
}
