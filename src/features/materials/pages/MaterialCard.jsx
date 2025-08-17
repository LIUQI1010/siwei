import { Button, Card, Space, Typography, message, Popconfirm } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { apiService } from "../../../shared/services/apiClient";
import { useProfileStore } from "../../../app/store/profileStore";
import { useState } from "react";
import { useMaterialStore } from "../../../app/store/materialStore";
dayjs.extend(timezone);
dayjs.extend(utc);

const { Text, Paragraph } = Typography;

export default function MaterialCard({ data }) {
  const { role } = useProfileStore();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { deleteMaterial } = useMaterialStore();
  const {
    filename,
    file_type,
    description,
    size_human,
    uploader_name,
    created_at,
  } = data;

  // 处理下载
  const handleDownload = async (material) => {
    try {
      // 检查s3_key是否存在
      if (!material.s3_key) {
        throw new Error("文件路径缺失");
      }
      const key = `download_${material.s3_key}`;

      // 设置下载状态
      message.loading({ content: "正在下载...", key, duration: 0 });

      // 调用下载API获取预签名URL
      const response = await apiService.downloadMaterial(material.s3_key);

      // 根据API返回的结构获取下载URL
      const downloadUrl = response.url;

      if (!downloadUrl) {
        throw new Error("下载失败");
      }

      // 使用API返回的文件名，如果没有则使用material中的文件名
      const fileName =
        response.fileName || material.filename || "defaultFilename";

      window.open(downloadUrl, "_blank");

      message.success({ content: "下载成功", key, duration: 1 });
    } catch (error) {
      message.error({ content: error.message, key, duration: 1 });
    }
  };

  // 处理删除
  const handleDelete = async (material) => {
    try {
      setDeleteLoading(true);
      const key = `delete_${material.file_id}`;
      message.loading({ content: "正在删除...", key, duration: 0 });
      await deleteMaterial(material.class_id, material.file_id);
      message.success({ content: "删除成功", key, duration: 1 });
    } catch (error) {
      message.error({ content: error.message, key, duration: 1 });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <Card
        hoverable
        title={
          <Paragraph
            style={{ marginBottom: 0 }}
            ellipsis={{ rows: 1, tooltip: filename }}
          >
            {filename}
          </Paragraph>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(data)}
            />
            <Popconfirm
              title="确定删除吗？"
              onConfirm={() => handleDelete(data)}
              okText="删除"
              cancelText="取消"
            >
              <Button
                color="danger"
                loading={deleteLoading}
                disabled={deleteLoading}
                variant="dashed"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        }
      >
        <Space direction="horizontal" size={10}>
          <Text type="secondary">
            <FileTextOutlined /> {size_human}
          </Text>
          <Text type="secondary">
            <UserOutlined /> {uploader_name}
          </Text>
          <Text type="secondary">
            <CalendarOutlined /> {dayjs(created_at).tz().format("YYYY-MM-DD")}
          </Text>
        </Space>
        <br />
        <Text type="secondary">{description || "无描述"}</Text>
      </Card>
    </div>
  );
}
