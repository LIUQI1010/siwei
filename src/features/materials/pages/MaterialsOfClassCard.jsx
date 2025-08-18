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
} from "antd";
import { CaretRightOutlined, UploadOutlined } from "@ant-design/icons";
import MaterialCard from "./MaterialCard";
import { useProfileStore } from "../../../app/store/profileStore";
import { apiService } from "../../../shared/services/apiClient";
import { useState } from "react";
import { useMaterialStore } from "../../../app/store/materialStore";

const { Text } = Typography;

export default function MaterialsOfClassCard({ data }) {
  const { class_id, class_name, class_is_expired, materials } = data;
  const { role } = useProfileStore();
  const [uploading, setUploading] = useState(false);
  const { addMaterial } = useMaterialStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [fileList, setFileList] = useState([]);

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
      message.warning("请先选择文件");
      return;
    }
    // 50MB 限制
    if (file.size > 50 * 1024 * 1024) {
      message.error("文件大小超过50MB");
      return;
    }

    setUploading(true);
    const key = "upload";

    message.loading({ content: "正在上传...", key, duration: 0 });
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
      if (!upload_url) throw new Error("上传URL获取失败");

      // 2) PUT 到 S3
      const putRes = await fetch(upload_url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });
      if (!putRes.ok) {
        throw new Error(`S3上传失败: ${putRes.status} ${putRes.statusText}`);
      }

      // 3) 更新 Store
      addMaterial(class_id, material);

      // 4) 清理并关闭
      setFileList([]);
      setDescription("");
      setIsModalOpen(false);

      message.success({ content: "上传成功", key, duration: 1 });
    } catch (error) {
      console.error("上传失败:", error);
      message.error({
        content: `上传失败: ${error?.message || "未知错误"}`,
        key,
        duration: 2,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
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
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Tag color="blue" bordered={false}>
                  {materials.length} 个
                </Tag>
                <Tag
                  color={class_is_expired ? "red" : "green"}
                  bordered={false}
                >
                  {class_is_expired ? "已结束" : "进行中"}
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
                />
                <Modal
                  title="上传文件"
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
                      <Button icon={<UploadOutlined />}>点击上传</Button>
                    </Upload>
                    <Input
                      placeholder="请输入文件描述（可选）"
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
  );
}
