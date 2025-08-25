import {
  List,
  Collapse,
  Tag,
  Typography,
  Button,
  message,
  Modal,
  Input,
  Upload,
  Space,
  Badge,
} from "antd";
import { CaretRightOutlined, UploadOutlined } from "@ant-design/icons";
import MaterialCard from "./MaterialCard";
import { useProfileStore } from "../../../app/store/profileStore";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
import { apiService } from "../../../shared/services/apiClient";
import { useState } from "react";
import { useMaterialStore } from "../../../app/store/materialStore";
import dayjs from "dayjs";

const { Text } = Typography;

export default function MaterialsOfClassCard({ data }) {
  const { class_id, class_name, class_is_expired, materials } = data;
  const { role } = useProfileStore();
  const [uploading, setUploading] = useState(false);
  const { addMaterial } = useMaterialStore();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);

  // 获取班级状态
  const getClassStatus = () => {
    if (class_is_expired) {
      return { color: "gray", text: t("materialsOfClassCard_statusEnded") };
    }
    return { color: "blue", text: t("materialsOfClassCard_statusOngoing") };
  };

  const status = getClassStatus();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFileList([]);
    setDescription("");
  };

  const handleOk = async () => {
    const file = fileList && fileList[0] && fileList[0].originFileObj;
    if (!file) {
      message.warning(t("materialsOfClassCard_selectFileFirst"));
      return;
    }
    // 50MB 限制
    if (file.size > 50 * 1024 * 1024) {
      message.error(t("materialsOfClassCard_fileTooLarge"));
      return;
    }

    setUploading(true);
    const key = "upload";

    message.loading({
      content: t("materialsOfClassCard_uploading"),
      key,
      duration: 0,
    });
    try {
      // 1) 获取预签名URL
      const resp = await apiService.uploadMaterial(
        class_id,
        description,
        file.name,
        file.type || "application/octet-stream",
        file.size
      );

      const uploadData = resp?.body
        ? typeof resp.body === "string"
          ? JSON.parse(resp.body)
          : resp.body
        : resp;

      const { upload_url, material } = uploadData?.data || {};
      if (!upload_url)
        throw new Error(t("materialsOfClassCard_uploadUrlFailed"));

      // 2) PUT 到 S3
      const putRes = await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });
      if (!putRes.ok) {
        throw new Error(
          `${t("materialsOfClassCard_s3UploadFailed")}: ${putRes.status} ${
            putRes.statusText
          }`
        );
      }

      // 3) 更新 Store
      addMaterial(class_id, material);

      // 4) 清理并关闭
      setFileList([]);
      setDescription("");
      setIsModalOpen(false);

      message.success({
        content: t("materialsOfClassCard_uploadSuccess"),
        key,
        duration: 1,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      message.error({
        content: `${t("materialsOfClassCard_uploadFailed")}: ${
          error?.message || t("materialsOfClassCard_unknownError")
        }`,
        key,
        duration: 2,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Badge.Ribbon text={status.text} color={status.color}>
      <Collapse
        collapsible="header"
        className="materialsCollapse"
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
        items={[
          {
            key: class_id,
            label: (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  width: "100%",
                  minWidth: 0,
                  paddingRight: "60px", // 为上传按钮留出空间
                }}
              >
                {/* 第1行：标题 */}
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                    lineHeight: 1.2,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {class_name}
                </div>
                {/* 第2行：只显示资料数量标签，移除状态标签 */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <Tag color="blue" bordered={false}>
                    {t("materialsOfClassCard_materialCount", {
                      count: materials.length,
                    })}
                  </Tag>
                </div>
              </div>
            ),

            extra:
              role === "teacher" ? (
                <>
                  <Button
                    disabled={uploading}
                    loading={uploading}
                    color="primary"
                    variant="filled"
                    shape="circle"
                    icon={<UploadOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      showModal();
                    }}
                    style={{ marginRight: "8px" }} // 为 ribbon 留出空间
                  />
                  <Modal
                    title={t("materialsOfClassCard_uploadFile")}
                    closable={{ "aria-label": "Custom Close Button" }}
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    confirmLoading={uploading}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Upload
                        maxCount={1}
                        beforeUpload={() => false}
                        // showUploadList={false}
                        fileList={fileList}
                        onChange={({ fileList }) => setFileList(fileList)}
                        onRemove={() => setFileList([])}
                      >
                        <Button icon={<UploadOutlined />}>
                          {t("materialsOfClassCard_clickUpload")}
                        </Button>
                      </Upload>
                      <Input
                        placeholder={t(
                          "materialsOfClassCard_descriptionPlaceholder"
                        )}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Space>
                  </Modal>
                </>
              ) : null,
            children: (
              <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={materials}
                rowKey="file_id"
                renderItem={(item) => (
                  <List.Item>
                    <MaterialCard data={item} />
                  </List.Item>
                )}
              />
            ),
          },
        ]}
      />
    </Badge.Ribbon>
  );
}
