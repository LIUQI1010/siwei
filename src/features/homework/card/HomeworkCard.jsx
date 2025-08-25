import { Card, Space, Typography, Button, Divider } from "antd";
import { InfoCircleOutlined, FieldTimeOutlined } from "@ant-design/icons";
import { useClassStore } from "../../../app/store/classStore";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
import dayjs from "dayjs";
import { generatePath } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

export default function HomeworkCard({ data }) {
  const navigate = useNavigate();
  const { getClassName } = useClassStore();
  const { t } = useTranslation();
  const to = generatePath("/homework/:classId/:lessonId/submit", {
    classId: data.class_id,
    lessonId: data.lesson_id,
  });

  return (
    <Card
      className={"fade-in"}
      styles={{
        header: { paddingTop: 16, paddingBottom: 12, minHeight: 64 },
      }}
      hoverable
      title={
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 16 }}>
            {getClassName(data.class_id)}
          </Text>
          <Text type="secondary">
            {t("homeworkCard_lesson", {
              number: String(data.lesson_id).padStart(2, "0"),
            })}
          </Text>
        </Space>
      }
      extra={
        <Button type="link" size="small" onClick={() => navigate(to)}>
          {t("homeworkCard_viewDetails")}
        </Button>
      }
    >
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Title level={5} style={{ margin: 0 }}>
          <InfoCircleOutlined /> {t("homeworkDetailsModal_description")}:
        </Title>
        <Text>{data.description || t("homeworkCard_noDescription")}</Text>
      </Space>
      <Divider />
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Text>
          <FieldTimeOutlined /> {t("homeworkCard_dueDate")}:
          {dayjs(data.due_at).tz().format("YYYY-MM-DD HH:mm")}
        </Text>
      </Space>
    </Card>
  );
}
