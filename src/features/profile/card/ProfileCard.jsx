import { Card, Descriptions } from "antd";
import { useProfileStore } from "../../../app/store/profileStore";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export default function ProfileCard({ setIsEditing }) {
  const { profile, role, loading, error } = useProfileStore();
  const { t } = useTranslation();

  return (
    <Card
      className="card-enter"
      title={t("profileCard_personalInfo")}
      hoverable
      loading={loading}
      variant="borderless"
      extra={<a onClick={() => setIsEditing(true)}>{t("profileCard_edit")}</a>}
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
        <Descriptions.Item label={t("profileCard_name")}>
          {profile.name || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("profileCard_email")}>
          {profile.email || "-"}
        </Descriptions.Item>
        <Descriptions.Item label={t("profileCard_phone")}>
          {profile.phone || "-"}
        </Descriptions.Item>
        {role === "student" && (
          <Descriptions.Item label={t("profileCard_grade")}>
            {profile.grade
              ? `${profile.grade}${t("profileCard_gradeUnit")}`
              : "-"}
          </Descriptions.Item>
        )}
        <Descriptions.Item label={t("profileCard_bio")}>
          {profile.personalIntro || t("profileCard_noBio")}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
