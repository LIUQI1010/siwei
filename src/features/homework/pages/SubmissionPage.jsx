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
  CameraOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useProfileStore } from "../../../app/store/profileStore";
import { useMessageStore } from "../../../app/store/messageStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
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
  const { t } = useTranslation();
  const [question, setQuestion] = useState("");
  const [comment, setComment] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({}); // { [uid]: percent }
  const [loadingList, setLoadingList] = useState(false);
  const [images, setImages] = useState([]);
  const updateQuestionLocal = useHomeworkStore((s) => s.updateQuestionLocal);
  const { fetchPendingHW, fetchSubmittedHW } = useHomeworkStore();

  const getClassName = useClassStore((s) => s.getClassName);
  const getQuestion = useHomeworkStore((s) => s.getQuestion);
  const { pending, submitted, graded } = useHomeworkStore();

  // 获取当前作业的状态
  const getCurrentHomeworkStatus = () => {
    const allHomework = [
      ...(pending?.items || pending || []).map((hw) => ({
        ...hw,
        status: "PENDING",
      })),
      ...(submitted?.items || submitted || []).map((hw) => ({
        ...hw,
        status: "SUBMITTED",
      })),
      ...(graded?.items || graded || []).map((hw) => ({
        ...hw,
        status: "GRADED",
      })),
    ];

    const currentHW = allHomework.find(
      (hw) =>
        hw.class_id === classId && String(hw.lesson_id) === String(lessonId)
    );

    return currentHW?.status || "PENDING";
  };

  useEffect(() => {
    setLoadingList(true);
    (async () => {
      try {
        const homeworkStatus = getCurrentHomeworkStatus();

        // 只有已提交或已评分的作业才调用 getHWGradedDetail
        if (homeworkStatus === "SUBMITTED" || homeworkStatus === "GRADED") {
          try {
            const res = await apiService.getHWGradedDetail(classId, lessonId);
            console.log(res);
            setComment(res.submission.comment || "");
            setScore(res.submission.score || 0);
          } catch (detailError) {
            // 获取作业详情失败时显示错误消息
            message.error(t("submissionPage_loadDetailsFailed"));
            console.error("Failed to load submission details:", detailError);
          }
        } else {
          // 待提交作业的默认值
          setComment("");
          setScore(0);
        }

        // 设置问题（从store中获取）
        setQuestion(getQuestion(classId, lessonId) || "");

        // 单独处理图片加载，避免因为没有图片而显示错误
        try {
          const raw = await apiService.listImages(classId, lessonId);
          const data = raw?.data ?? raw; // 兼容 axios/fetch
          const items = (data?.items || []).map((it) => ({
            id: it.key, // 用 S3 key 作为唯一 id
            key: it.key,
            url: it.url, // 预签名URL（后端已返回）
          }));
          setImages(items);
        } catch (imageError) {
          // 图片加载失败时，只在控制台记录错误，不显示用户错误消息
          // 因为可能是正常的"没有图片"情况
          console.warn("Failed to load images:", imageError);
          setImages([]);
        }
      } catch (e) {
        // 其他未预期的错误
        console.error("Unexpected error in SubmissionPage:", e);
      } finally {
        setLoadingList(false);
      }
    })();
  }, [classId, lessonId, pending, submitted, graded]);

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

  // 通用的文件上传处理函数
  const handleFileUpload = async (file) => {
    const uid = file.uid || `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    file.uid = uid;
    
    setUploading((uploading) => ({ ...uploading, [uid]: 0 }));
    const previewUrl = URL.createObjectURL(file);
    setImages((prev) => [...prev, { id: uid, url: previewUrl }]);
    
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
            img.id === uid ? { ...img, url: newUrl } : img
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
            setUploading((u) => ({ ...u, [uid]: p }));
          }
        },
      });

      // message.success("图片已上传");
    } catch (err) {
      setImages((prev) => prev.filter((img) => img.id !== uid));
      URL.revokeObjectURL(previewUrl);
      message.error(t("submissionPage_uploadError"));
      throw err;
    } finally {
      setUploading(({ [uid]: _, ...rest }) => rest);
    }
  };

  // 从本地选择文件
  const handleLocalUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        try {
          await handleFileUpload(file);
        } catch (error) {
          console.error('Upload failed:', error);
        }
      }
    };
    input.click();
  };

  // 检查是否为移动设备
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  };

  // 打开相机拍照
  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // 使用后置摄像头
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          await handleFileUpload(file);
        } catch (error) {
          console.error('Camera upload failed:', error);
        }
      }
    };
    input.click();
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
      
      // 先更新通知状态
      onStudentSubmitted({
        class_id: classId,
        lesson_id: lessonId,
      });
      
      // 重新获取最新的作业状态
      await fetchPendingHW();
      await fetchSubmittedHW();
      
      // 在获取最新状态后再更新question
      updateQuestionLocal(classId, lessonId, question);
      
      message.success(t("submissionPage_submitSuccess"));
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
            {getClassName(classId)} ·{" "}
            {t("homeworkCard_lesson", { number: lessonId })}{" "}
            {t("submissionPage_homeworkDetails")}
          </h2>
          <Space>
            <Button color="danger" variant="outlined" onClick={handleCancel}>
              {t("submissionPage_cancel")}
            </Button>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              {t("submissionPage_submit")}
            </Button>
          </Space>
        </Flex>
        <div>
          <Divider orientation="left" orientationMargin="0">
            <QuestionCircleOutlined style={{ color: "#1890ff" }} />{" "}
            {t("submissionPage_myQuestion")}:
          </Divider>
          <Spin spinning={loadingList}>
            <Text
              editable={{
                tooltip: t("submissionPage_editTooltip"),
                onChange: setQuestion,
              }}
              className="question-text"
            >
              {question || t("submissionPage_questionPlaceholder")}
            </Text>
          </Spin>
        </div>
        <div>
          <Divider orientation="left" orientationMargin="0">
            <FileOutlined style={{ color: "#1890ff" }} />{" "}
            {t("submissionPage_myHomework")}
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

              {/* 本地上传按钮 */}
              <div
                className="square upload-box fade-in"
                key="local-uploader"
                style={{ animationDelay: `${images.length * 0.2 + 0.2}s` }}
              >
                {loadingList ? (
                  <div className="list-image-loading">
                    <LoadingOutlined style={{ fontSize: 24 }} spin />
                    <div style={{ marginTop: 8, fontWeight: 600, fontSize: 12 }}>
                      {t("homework_loading")}
                    </div>
                  </div>
                ) : (
                  <Button
                    type="dashed"
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      border: "2px dashed #1890ff",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    disabled={loadingList}
                    onClick={handleLocalUpload}
                  >
                    <div
                      className="fade-in"
                      style={{ color: "#1890ff", fontSize: 14 }}
                    >
                      <FolderOpenOutlined style={{ fontSize: 20 }} />
                      <div style={{ marginTop: 8, fontSize: 12 }}>
                        {t("submissionPage_uploadFromLocal")}
                      </div>
                    </div>
                  </Button>
                )}
              </div>

              {/* 相机拍照按钮 - 只在移动设备上显示 */}
              {isMobileDevice() && (
                <div
                  className="square upload-box fade-in"
                  key="camera-uploader"
                  style={{ animationDelay: `${images.length * 0.2 + 0.4}s` }}
                >
                  {loadingList ? (
                    <div className="list-image-loading">
                      <LoadingOutlined style={{ fontSize: 24 }} spin />
                      <div style={{ marginTop: 8, fontWeight: 600, fontSize: 12 }}>
                        {t("homework_loading")}
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="dashed"
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        border: "2px dashed #52c41a",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      disabled={loadingList}
                      onClick={handleCameraCapture}
                    >
                      <div
                        className="fade-in"
                        style={{ color: "#52c41a", fontSize: 14 }}
                      >
                        <CameraOutlined style={{ fontSize: 20 }} />
                        <div style={{ marginTop: 8, fontSize: 12 }}>
                          {t("submissionPage_takePhoto")}
                        </div>
                      </div>
                    </Button>
                  )}
                </div>
              )}
            </Image.PreviewGroup>
          </div>
        </div>
        <div>
          <Divider orientation="left" orientationMargin="0">
            <CommentOutlined style={{ color: "#1890ff" }} />{" "}
            {t("submissionPage_teacherComment")}:
            {!loadingList && (
              <Text>{t("submissionPage_scoreDisplay", { score })}</Text>
            )}
          </Divider>
          <Spin spinning={loadingList}>
            <Text>{comment || t("submissionPage_noComment")}</Text>
          </Spin>
        </div>
      </Space>

    </div>
  );
}
