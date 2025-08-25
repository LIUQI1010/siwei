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
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_E164_RE = /^\+[1-9]\d{1,14}$/;

export default function EditProfileCard({ setIsEditing }) {
  const { profile, role, loading, error, updateProfile, saveProfile } =
    useProfileStore();
  const [profileForm, setProfileForm] = useState(profile);
  const { t } = useTranslation();

  const handleSave = () => {
    if (profileForm === profile) {
      message.error(t("editProfileCard_noChanges"));
      setIsEditing(false);
      return;
    }
    if (!EMAIL_RE.test(profileForm.email)) {
      message.error(t("editProfileCard_emailInvalid"));
      return;
    }
    if (!PHONE_E164_RE.test(profileForm.phone)) {
      message.error(t("editProfileCard_phoneInvalid"));
      return;
    }
    try {
      updateProfile(profileForm);
      saveProfile();
      setIsEditing(false);
      message.success(t("editProfileCard_saveSuccess"));
    } catch (error) {
      message.error(t("editProfileCard_saveError"));
    }
  };

  return (
    <Card
      className="card-enter"
      title={t("editProfileCard_title")}
      hoverable
      loading={loading}
      variant="borderless"
      extra={
        <Space size={21}>
          <a onClick={() => setIsEditing(false)}>
            {t("editProfileCard_cancel")}
          </a>
          <Button type="primary" onClick={handleSave}>
            {t("editProfileCard_save")}
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
        <Descriptions.Item label={t("editProfileCard_name")}>
          {profileForm.name || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("editProfileCard_email")}>
          <Input
            defaultValue={profileForm.email}
            onChange={(e) => {
              setProfileForm({ ...profileForm, email: e.target.value });
            }}
          />
        </Descriptions.Item>
        <Descriptions.Item label={t("editProfileCard_phone")}>
          <Input
            defaultValue={profileForm.phone}
            onChange={(e) => {
              setProfileForm({ ...profileForm, phone: e.target.value });
            }}
          />
        </Descriptions.Item>
        {role === "student" && (
          <Descriptions.Item label={t("editProfileCard_grade")}>
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
        <Descriptions.Item label={t("editProfileCard_bio")}>
          <Input.TextArea
            rows={4}
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
