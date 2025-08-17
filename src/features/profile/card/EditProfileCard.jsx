import {
  Card,
  Descriptions,
  Button,
  Space,
  Input,
  InputNumber,
  message,
} from "antd";
import { useProfileStore } from "../../../app/store/profileStore";
import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_E164_RE = /^\+[1-9]\d{1,14}$/;

export default function EditProfileCard({ setIsEditing }) {
  const { profile, role, loading, error, updateProfile, saveProfile } =
    useProfileStore();
  const [profileForm, setProfileForm] = useState(profile);

  const handleSave = () => {
    if (profileForm === profile) {
      message.error("未修改");
      setIsEditing(false);
      return;
    }
    if (!EMAIL_RE.test(profileForm.email)) {
      message.error("邮箱格式不正确");
      return;
    }
    if (!PHONE_E164_RE.test(profileForm.phone)) {
      message.error("电话格式不正确");
      return;
    }
    try {
      updateProfile(profileForm);
      saveProfile();
      setIsEditing(false);
      message.success("保存成功");
    } catch (error) {
      message.error("保存失败");
    }
  };

  return (
    <Card
      className="card-enter"
      title="个人信息"
      hoverable
      loading={loading}
      variant="borderless"
      extra={
        <Space size={21}>
          <a onClick={() => setIsEditing(false)}>取消</a>
          <Button type="primary" onClick={handleSave}>
            保存
          </Button>
        </Space>
      }
    >
      <Descriptions
        column={1} // ← 一行一个
        styles={{
          label: {
            width: 80,
            color: "rgba(0, 0, 0, 0.51)",
            fontWeight: 500,
          },
          content: {
            color: "rgba(0, 0, 0, 0.88)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          },
        }}
      >
        <Descriptions.Item label="姓名">
          {profileForm.name || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="邮箱">
          <Input
            defaultValue={profileForm.email}
            onChange={(e) => {
              setProfileForm({ ...profileForm, email: e.target.value });
            }}
          />
        </Descriptions.Item>
        <Descriptions.Item label="电话">
          <Input
            defaultValue={profileForm.phone}
            onChange={(e) => {
              setProfileForm({ ...profileForm, phone: e.target.value });
            }}
          />
        </Descriptions.Item>
        {role === "student" && (
          <Descriptions.Item label="年级">
            <InputNumber
              min={1}
              max={12}
              defaultValue={profileForm.grade}
              onChange={(value) => {
                setProfileForm({ ...profileForm, grade: value });
              }}
            />
          </Descriptions.Item>
        )}
        <Descriptions.Item label="个人简介">
          <Input.TextArea
            defaultValue={profileForm.personalIntro}
            onChange={(e) => {
              setProfileForm({ ...profileForm, personalIntro: e.target.value });
            }}
          />
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
