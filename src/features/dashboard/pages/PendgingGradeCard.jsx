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
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
import { motion } from "framer-motion";
import { generatePath, Link } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("zh-cn");

const { Text, Paragraph } = Typography;

function getStatus(dueAtISO, t) {
  const now = dayjs();
  const due = dayjs(dueAtISO);
  const diffHours = due.diff(now, "hour", true);
  if (diffHours < 0)
    return {
      color: "red",
      text: t("pendingGradeCard_statusOverdue"),
      overdue: true,
    };
  if (diffHours <= 24)
    return {
      color: "gold",
      text: t("pendingGradeCard_statusDueSoon"),
      overdue: false,
    };
  return {
    color: "processing",
    text: t("pendingGradeCard_statusPending"),
    overdue: false,
  };
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
  const { t } = useTranslation();
  const status = getStatus(due_at, t);
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
    <Link to={to} state={{ from: "/dashboard" }}>
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
              {t("pendingGradeCard_lessonNumber", {
                number: String(lesson_id).padStart(2, "0"),
              })}
            </Text>
          </Space>
        }
        extra={
          status.overdue ? (
            <Text type="danger">
              <FieldTimeOutlined /> {t("pendingGradeCard_overdue")}
            </Text>
          ) : (
            <Statistic.Timer
              type="countup"
              title={t("pendingGradeCard_submitTime")}
              value={dayjs(submitted_at)}
              format="D 天 H 时 m 分"
              valueStyle={{ fontSize: 12, lineHeight: "16px" }}
            />
          )
        }
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Text type="secondary">
            <UserOutlined /> {t("pendingGradeCard_student")}：{student_name}
          </Text>
          <Text type="secondary">
            <ContainerOutlined /> {t("pendingGradeCard_assignTime")}：
            {dayjs(created_at).tz().format("YYYY-MM-DD HH:mm")}
          </Text>

          <Text type="secondary">
            <CalendarOutlined /> {t("pendingGradeCard_dueTime")}：
            {dayjs(due_at).tz().format("YYYY-MM-DD HH:mm")}
          </Text>
          <Text type="secondary">
            <CalendarOutlined /> {t("pendingGradeCard_submitTime")}：
            {dayjs(submitted_at).tz().format("YYYY-MM-DD HH:mm")}
          </Text>
        </Space>
      </Card>
    </Link>
  );
}
