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
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
import { useState } from "react";
import { useMaterialStore } from "../../../app/store/materialStore";
dayjs.extend(timezone);
dayjs.extend(utc);

const { Text, Paragraph } = Typography;

export default function MaterialCard({ data }) {
  const { role } = useProfileStore();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { deleteMaterial } = useMaterialStore();
  const { t } = useTranslation();
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
        throw new Error(t("materialCard_downloadError"));
      }
      const key = `download_${material.s3_key}`;

      // 设置下载状态
      message.loading({
        content: t("materialCard_downloading"),
        key,
        duration: 0,
      });

      // 调用下载API获取预签名URL
      const response = await apiService.downloadMaterial(material.s3_key);

      // 根据API返回的结构获取下载URL
      const downloadUrl = response.url;

      if (!downloadUrl) {
        throw new Error(t("materialCard_downloadError"));
      }

      // 使用API返回的文件名，如果没有则使用material中的文件名
      const fileName =
        response.fileName || material.filename || "defaultFilename";

      window.open(downloadUrl, "_blank");

      message.success({
        content: t("materialCard_downloadSuccess"),
        key,
        duration: 1,
      });
    } catch (error) {
      message.error({ content: error.message, key, duration: 1 });
    }
  };

  // 处理删除
  const handleDelete = async (material) => {
    try {
      setDeleteLoading(true);
      const key = `delete_${material.file_id}`;
      message.loading({
        content: t("materialCard_deleting"),
        key,
        duration: 0,
      });
      await deleteMaterial(material.class_id, material.file_id);
      message.success({
        content: t("materialCard_deleteSuccess"),
        key,
        duration: 1,
      });
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
            {role === "teacher" ? (
              <Popconfirm
                title={t("materialCard_deleteConfirm")}
                onConfirm={() => handleDelete(data)}
                okText={t("materialCard_delete")}
                cancelText={t("materialCard_cancel")}
              >
                <Button
                  color="danger"
                  loading={deleteLoading}
                  disabled={deleteLoading}
                  variant="dashed"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            ) : null}
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
        <Text type="secondary">
          {description || t("materialCard_noDescription")}
        </Text>
      </Card>
    </div>
  );
}
