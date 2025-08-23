import { Card, Space, Typography, Button, Divider } from "antd";
import { InfoCircleOutlined, FieldTimeOutlined } from "@ant-design/icons";
import { useClassStore } from "../../../app/store/classStore";
import dayjs from "dayjs";
import { generatePath } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

export default function HomeworkCard({ data }) {
  const navigate = useNavigate();
  const { getClassName } = useClassStore();
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
            第{String(data.lesson_id).padStart(2, "0")}课作业
          </Text>
        </Space>
      }
      extra={
        <Button type="link" size="small" onClick={() => navigate(to)}>
          查看
        </Button>
      }
    >
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Title level={5} style={{ margin: 0 }}>
          <InfoCircleOutlined /> 作业描述：
        </Title>
        <Text>{data.description || "（无描述）"}</Text>
      </Space>
      <Divider />
      <Space direction="vertical" size={6} style={{ width: "100%" }}>
        <Text>
          <FieldTimeOutlined /> 截止时间：
          {dayjs(data.due_at).tz().format("YYYY-MM-DD HH:mm")}
        </Text>
      </Space>
    </Card>
  );
}
