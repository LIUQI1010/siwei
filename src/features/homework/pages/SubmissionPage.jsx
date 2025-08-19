import React, { useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  QuestionCircleOutlined,
  FileOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { apiService } from "../../../shared/services/apiClient";
import { useProfileStore } from "../../../app/store/profileStore";
import { useMessageStore } from "../../../app/store/messageStore";
import { useNavigate } from "react-router-dom";

const { Text, Paragraph } = Typography;

export default function SubmissionPage({ initial = [] }) {
  const { classId, lessonId } = useParams();
  const { profile } = useProfileStore();
  const { onStudentSubmitted } = useMessageStore();
  const navigate = useNavigate();
  const [images, setImages] = useState(
    initial.map((u, i) => ({ id: `${i}-${u}`, url: u }))
  );
  const [question, setQuestion] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // 本地文件 -> base64
  const toDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const uploadProps = {
    accept: "image/*",
    multiple: true,
    showUploadList: false, // 我们自己渲染缩略图
    listType: "picture-card",

    // —— 方案A：无后端（把本地文件转 base64）——
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      try {
        const url = await toDataUrl(file);
        setImages((prev) => [...prev, { id: file.uid, url }]); // 追加在末尾
        onSuccess && onSuccess({ url });
      } catch (e) {
        message.error("读取图片失败");
        onError && onError(e);
      }
    },

    // —— 方案B：有后端（改用你的上传接口），注释上面的 customRequest，并启用以下代码 ——
    // action: "/api/upload",
    // withCredentials: true,
    // onChange(info) {
    //   const { status, response, uid } = info.file || {};
    //   if (status === "done") {
    //     const url = response?.url; // 后端返回的可访问URL
    //     if (url) setImages((prev) => [...prev, { id: uid, url }]);
    //   } else if (status === "error") {
    //     message.error("上传失败");
    //   }
    // },
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
      onStudentSubmitted({
        class_id: classId,
        lesson_id: lessonId,
      });
      message.success("提交成功");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }

    navigate(`/dashboard`);
  };

  return (
    <div className="submission-page">
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Flex justify="space-between" align="center">
          <h2 style={{ margin: 0 }}>
            {classId} - {lessonId} 作业详情
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
          <Text
            editable={{
              tooltip: "click to edit text",
              onChange: setQuestion,
            }}
            className="question-text"
          >
            {question || "有问题的话可以在这里编辑哦～"}
          </Text>
        </div>
        <div>
          <Divider orientation="left" orientationMargin="0">
            <FileOutlined style={{ color: "#1890ff" }} />{" "}
            我的作业：（点击图片放大查看）
          </Divider>
          <div className="img-grid">
            <Image.PreviewGroup>
              {images.map((img) => (
                <div className="square" key={img.id}>
                  <Image src={img.url} alt="" />
                </div>
              ))}

              {/* 上传按钮作为最后一个“正方形卡片” */}
              <div className="square upload-box" key="uploader">
                <Upload
                  {...uploadProps}
                  style={{ width: "100%", height: "100%" }}
                >
                  <div style={{ color: "#444", fontSize: 16 }}>
                    <PlusOutlined />
                    <div style={{ marginTop: 14 }}>上传图片</div>
                  </div>
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
