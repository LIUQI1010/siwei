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
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
import { col } from "framer-motion/client";
import { color } from "framer-motion";

const { Text, Paragraph } = Typography;

function StatusTag({ start, end }) {
  const { t } = useTranslation();
  const now = dayjs();
  const s = dayjs(start);
  const e = dayjs(end);
  if (now.isBefore(s, "day"))
    return <Tag color="gold">{t("classCard_statusNotStarted")}</Tag>;
  if (now.isAfter(e, "day")) return <Tag>{t("classCard_statusEnded")}</Tag>;
  return <Tag color="processing">{t("classCard_statusInProgress")}</Tag>;
}

function ClassCard({ data, showCDDrawer, showHWDrawer }) {
  const { role } = useProfileStore();
  const { t } = useTranslation();

  // 翻译学科名称
  const getSubjectName = (subject) => {
    if (!subject) return "";

    // 中文学科名到英文翻译键的映射
    const subjectMap = {
      数学: "math",
      语文: "chinese",
      英语: "english",
      物理: "physics",
      化学: "chemistry",
      生物: "biology",
      历史: "history",
      地理: "geography",
      政治: "politics",
      音乐: "music",
      美术: "art",
      体育: "pe",
      计算机: "computer",
      科学: "science",
    };

    // 获取对应的英文键名
    const englishKey = subjectMap[subject];
    if (!englishKey) {
      // 如果没有映射，返回原始值
      return subject;
    }

    const subjectKey = `subject_${englishKey}`;
    const translated = t(subjectKey);

    // 如果翻译键不存在，返回原始值
    return translated === subjectKey ? subject : translated;
  };

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
              <Tag>{getSubjectName(subject)}</Tag>
              <Tag>
                {t("classCard_grade")}：{grade}
              </Tag>
            </Space>
          </div>
        </div>
      }
      key={class_id}
      actions={
        role === "teacher"
          ? [
              <Button
                color="primary"
                variant="link"
                key="detail"
                onClick={() => showCDDrawer(class_id, class_name)}
              >
                {t("classCard_viewDetails")}
              </Button>,
              <Button
                color="cyan"
                variant="link"
                key="createHW"
                onClick={() => showHWDrawer(class_id, class_name)}
              >
                {t("classCard_createHomework")}
              </Button>,
            ]
          : undefined
      }
    >
      <Space direction="vertical" size={8} style={{ width: "100%" }}>
        <div className="field-grid-aligned">
          <span className="icon">
            <UserOutlined />
          </span>
          <span className="label">{t("classCard_teacher")}</span>
          <span className="colon">：</span>
          <span className="value">{teacher_name || "-"}</span>

          <span className="icon">
            <EnvironmentOutlined />
          </span>
          <span className="label">{t("classCard_classroom")}</span>
          <span className="colon">：</span>
          <span className="value">{classroom || "-"}</span>

          <span className="icon">
            <ClockCircleOutlined />
          </span>
          <span className="label">{t("classCard_classTime")}</span>
          <span className="colon">：</span>
          <span className="value">{class_time || "-"}</span>

          <span className="icon">
            <BookOutlined />
          </span>
          <span className="label">{t("classCard_totalLessons")}</span>
          <span className="colon">：</span>
          <span className="value">
            {lessons} {t("classCard_lessonsUnit")}
          </span>

          <span className="icon">
            <TeamOutlined />
          </span>
          <span className="label">{t("classCard_maxCapacity")}</span>
          <span className="colon">：</span>
          <span className="value">
            {capacity} {t("classCard_peopleUnit")}
          </span>

          <span className="icon">
            <CalendarOutlined />
          </span>
          <span className="label">{t("classCard_startDate")}</span>
          <span className="colon">：</span>
          <span className="value">
            {start_date ? dayjs(start_date).format("YYYY-MM-DD") : "-"}
          </span>

          <span className="icon">
            <CalendarOutlined />
          </span>
          <span className="label">{t("classCard_endDate")}</span>
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
              ellipsis={{
                rows: 2,
                expandable: true,
                symbol: t("classCard_expand"),
              }}
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
