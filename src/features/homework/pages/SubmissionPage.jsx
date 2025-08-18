import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Space, Divider, Upload, Button, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";

export default function SubmissionPage({ initial = [] }) {
  const { classId, lessonId } = useParams();
  const [images, setImages] = useState(
    initial.map((u, i) => ({ id: `${i}-${u}`, url: u }))
  );

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

  return (
    <div className="submission-page">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <h2>
          {classId} - {lessonId} 作业详情（点击图片放大查看）
        </h2>
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
      </Space>
    </div>
  );
}
