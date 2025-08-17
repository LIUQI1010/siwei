import { Button, Card, Space, Tag, Typography } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(timezone);
dayjs.extend(utc);

const { Text, Paragraph } = Typography;

export default function MaterialCard({ data }) {
  const {
    filename,
    file_type,
    description,
    size_human,
    uploader_name,
    created_at,
  } = data;
  return (
    <div>
      <Card
        hoverable
        title={
          <Paragraph
            style={{ marginBottom: 0 }} // 去掉段落默认外边距
            ellipsis={{ rows: 1, tooltip: filename }} // 1 行省略，悬停显示完整内容
          >
            {filename}
          </Paragraph>
        }
        extra={<Button type="primary" icon={<DownloadOutlined />} />}
      >
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Text type="secondary">
            <Tag color="blue">{file_type}</Tag>
          </Text>
          <Text type="secondary">
            <FileTextOutlined /> {size_human}
          </Text>
          <Text type="secondary">
            <UserOutlined /> {uploader_name}
          </Text>
          <Text type="secondary">
            <CalendarOutlined />
            {dayjs(created_at).tz().format("YYYY-MM-DD")}
          </Text>
          <Text type="secondary">{description}</Text>
        </Space>
      </Card>
    </div>
  );
}
