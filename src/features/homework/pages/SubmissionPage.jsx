import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Space,
  Divider,
  Upload,
  Button,
  Image,
  Typography,
  Flex,
  message,
  Spin,
} from "antd";
import {
  PlusOutlined,
  QuestionCircleOutlined,
  FileOutlined,
  CommentOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useProfileStore } from "../../../app/store/profileStore";
import { useMessageStore } from "../../../app/store/messageStore";
import { useNavigate } from "react-router-dom";
import { compressSmartOrKeep } from "../../../shared/utils/imageCompression";
import { apiService } from "../../../shared/services/apiClient";
import axios from "axios";
import { useClassStore } from "../../../app/store/classStore";
import { useHomeworkStore } from "../../../app/store/homeworkStore";

const { Text } = Typography;

export default function SubmissionPage() {
  const { classId, lessonId } = useParams();
  const { profile } = useProfileStore();
  const { onStudentSubmitted } = useMessageStore();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({}); // { [uid]: percent }
  const [loadingList, setLoadingList] = useState(false);
  const [images, setImages] = useState([]);
  const updateQuestionLocal = useHomeworkStore((s) => s.updateQuestionLocal);
  const { fetchPendingHW, fetchSubmittedHW } = useHomeworkStore();

  const getClassName = useClassStore((s) => s.getClassName);
  const getQuestion = useHomeworkStore((s) => s.getQuestion);

  useEffect(() => {
    setLoadingList(true);
    (async () => {
      try {
        const raw = await apiService.listImages(classId, lessonId);
        const data = raw?.data ?? raw; // 兼容 axios/fetch
        const items = (data?.items || []).map((it) => ({
          id: it.key, // 用 S3 key 作为唯一 id
          key: it.key,
          url: it.url, // 预签名URL（后端已返回）
        }));
        setImages(items);
        setQuestion(getQuestion(classId, lessonId));
      } catch (e) {
        message.error("加载图片失败");
      } finally {
        setLoadingList(false);
      }
    })();
  }, [classId, lessonId]);

  // 本地文件 -> base64
  const toDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // 简单从文件推断 ext
  const extFromFile = (file) => {
    const t = (file.type || "").toLowerCase();
    if (t === "image/jpeg") return "jpg"; // 或 "jpeg" 都行
    if (t === "image/png") return "png";
    if (t === "image/gif") return "gif";
    // 兜底用文件名后缀
    const m = /\.([a-z0-9]+)$/i.exec(file.name || "");
    return (m && m[1].toLowerCase()) || "jpg";
  };

  const uploadProps = {
    accept: "image/*",
    multiple: true,
    showUploadList: false, // 我们自己渲染缩略图
    listType: "picture-card",

    customRequest: async ({ file, onSuccess, onError }) => {
      setUploading((uploading) => ({ ...uploading, [file.uid]: 0 }));
      const previewUrl = URL.createObjectURL(file);
      setImages((prev) => [...prev, { id: file.uid, url: previewUrl }]);
      try {
        // 前端压缩
        const processed = await compressSmartOrKeep(file, {
          forceMime: "image/jpeg",
        });
        const uploadFile = processed.file || file;

        // 如果用了压缩，替换缩略图为压缩后的对象URL，并释放原URL
        if (uploadFile !== file) {
          const newUrl = URL.createObjectURL(uploadFile);
          setImages((prev) =>
            prev.map((img) =>
              img.id === file.uid ? { ...img, url: newUrl } : img
            )
          );
          URL.revokeObjectURL(previewUrl);
        }

        // 取 ext 调 Lambda
        const ext = extFromFile(uploadFile);
        const presign = await apiService.getS3PresignedUrl(
          classId,
          lessonId,
          ext
        );

        const { uploadUrl, fileKey, contentType } = presign;

        // PUT 到 S3（带 Content-Type；用 axios 便于进度回调）
        await axios.put(uploadUrl, uploadFile, {
          headers: { "Content-Type": contentType },
          onUploadProgress: (e) => {
            if (e.total) {
              const p = Math.round((e.loaded / e.total) * 100);
              setUploading((u) => ({ ...u, [file.uid]: p }));
            }
          },
        });

        onSuccess?.({ key: fileKey });
        // message.success("图片已上传");
      } catch (err) {
        setImages((prev) => prev.filter((img) => img.id !== file.uid));
        URL.revokeObjectURL(previewUrl);
        message.error("上传失败");
        onError?.(err);
      } finally {
        setUploading(({ [file.uid]: _, ...rest }) => rest);
      }
    },
  };

  const handleCancel = () => {
    navigate(`/homework`);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await apiService.submitHW({
        class_id: classId,
        lesson_id: lessonId,
        question: question,
        student_name: profile.name,
      });
      updateQuestionLocal(classId, lessonId, question);
      onStudentSubmitted({
        class_id: classId,
        lesson_id: lessonId,
      });
      fetchPendingHW();
      fetchSubmittedHW();
      message.success("提交成功");
      navigate(`/homework`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="submission-page">
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Flex justify="space-between" align="center">
          <h2 style={{ margin: 0 }}>
            {getClassName(classId)} · 第{lessonId}课 作业详情
          </h2>
          <Space>
            <Button color="danger" variant="outlined" onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              提交作业
            </Button>
          </Space>
        </Flex>
        <div>
          <Divider orientation="left" orientationMargin="0">
            <QuestionCircleOutlined style={{ color: "#1890ff" }} /> 我的疑问：
          </Divider>
          <Spin spinning={loadingList}>
            <Text
              editable={{
                tooltip: "click to edit text",
                onChange: setQuestion,
              }}
              className="question-text"
            >
              {question || "有问题的话可以在这里编辑哦✨✨✨"}
            </Text>
          </Spin>
        </div>
        <div>
          <Divider orientation="left" orientationMargin="0">
            <FileOutlined style={{ color: "#1890ff" }} />{" "}
            我的作业：（点击图片放大查看）
          </Divider>
          <div className="img-grid">
            <Image.PreviewGroup>
              {images.map((img, idx) => (
                <div
                  className="square fade-in"
                  key={img.id}
                  style={{
                    position: "relative",
                    animationDelay: `${idx * 0.2}s`,
                  }}
                >
                  <Image src={img.url} alt="" />

                  {uploading[img.id] != null && (
                    <div className="overlay">
                      <div style={{ width: 80 }}>
                        <div
                          style={{
                            color: "#fff",
                            textAlign: "center",
                            marginBottom: 8,
                          }}
                        >
                          {uploading[img.id]}%
                        </div>
                        <div
                          style={{
                            height: 6,
                            background: "rgba(255,255,255,0.3)",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${uploading[img.id]}%`,
                              background: "#1677ff",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 上传按钮作为最后一个“正方形卡片” */}
              <div
                className="square upload-box fade-in"
                key="uploader"
                style={{ animationDelay: `${images.length * 0.2 + 0.2}s` }}
              >
                <Upload
                  {...uploadProps}
                  style={{ width: "100%", height: "100%" }}
                  disabled={loadingList}
                >
                  {loadingList ? (
                    <div className="list-image-loading">
                      <LoadingOutlined style={{ fontSize: 28 }} spin />
                      <div style={{ marginTop: 12, fontWeight: 600 }}>
                        加载中...
                      </div>
                    </div>
                  ) : (
                    <div
                      className="fade-in"
                      style={{ color: "#444", fontSize: 16 }}
                    >
                      <PlusOutlined />
                      <div style={{ marginTop: 14 }}>上传图片</div>
                    </div>
                  )}
                </Upload>
              </div>
            </Image.PreviewGroup>
          </div>
        </div>
        <div>
          <Divider orientation="left" orientationMargin="0">
            <CommentOutlined style={{ color: "#1890ff" }} /> 教师评语：
          </Divider>
          <Text>{comment || "教师还没有评语哦～"}</Text>
        </div>
      </Space>
    </div>
  );
}
