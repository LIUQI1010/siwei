import { Card, Descriptions } from "antd";
import { useProfileStore } from "../../../app/store/profileStore";

export default function ProfileCard({ setIsEditing }) {
  const { profile, role, loading, error } = useProfileStore();

  return (
    <Card
      className="card-enter"
      title="个人信息"
      hoverable
      loading={loading}
      variant="borderless"
      extra={<a onClick={() => setIsEditing(true)}>编辑</a>}
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
          {profile.name || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="邮箱">
          {profile.email || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="电话">
          {profile.phone || "-"}
        </Descriptions.Item>
        {role === "student" && (
          <Descriptions.Item label="年级">
            {profile.grade || "-"}年级
          </Descriptions.Item>
        )}
        <Descriptions.Item label="个人简介">
          {profile.personalIntro || "暂无简介"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}
