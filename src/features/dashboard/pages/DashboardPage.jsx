import React, { useMemo } from "react";
import { useMessageStore } from "../../../app/store/messageStore";
import PendingHomeworkCard from "./PendingHomeworkCard";
import { List, Space, Typography } from "antd";
import { useProfileStore } from "../../../app/store/profileStore";
import PendgingGradeCard from "./PendgingGradeCard";
import dayjs from "dayjs";

const { Text } = Typography;

export default function DashboardPage() {
  const { messages, loading, error } = useMessageStore();
  const { role } = useProfileStore();
  const alerts =
    role === "student" ? messages.homeworkAlerts : messages.gradingAlerts;

  const sortedAlerts = useMemo(() => {
    const ts = (v) => (v ? dayjs(v).valueOf() : Number.POSITIVE_INFINITY); // 缺失排最后
    return [...(alerts ?? [])].sort((a, b) => ts(a.due_at) - ts(b.due_at)); // 近到远（升序）
    // 若想远到近（降序）：.sort((a,b) => ts(b.due_at) - ts(a.due_at))
  }, [alerts]);

  if (error) {
    return <div>错误: {error}</div>;
  }

  if (!messages) {
    return <div>暂无数据</div>;
  }

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 16 }}>
          {role === "student" ? "作业提醒" : "待批作业"}: {sortedAlerts.length}
        </Text>
      </Space>

      <List
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 3,
          xxl: 4,
        }}
        dataSource={sortedAlerts}
        renderItem={(item, idx) => (
          <List.Item
            key={item.PK}
            style={{ "--i": idx }}
            className="fade-stagger"
          >
            {role === "student" ? (
              <PendingHomeworkCard data={item} />
            ) : (
              <PendgingGradeCard data={item} />
            )}
          </List.Item>
        )}
      />
    </>
  );
}
