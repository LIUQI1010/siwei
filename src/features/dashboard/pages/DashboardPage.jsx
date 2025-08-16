import React, { useEffect } from "react";
import { useMessageStore } from "../../../app/store/messageStore";
import PendingHomeworkCard from "./PendingHomeworkCard";
import { List, Space, Badge, Typography } from "antd";

const { Text } = Typography;

export default function DashboardPage() {
  const { messages, loading, error } = useMessageStore();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  if (!messages) {
    return <div>暂无数据</div>;
  }

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Badge count={messages.homeworkAlerts.length} showZero>
          <Text strong style={{ fontSize: 16 }}>
            作业提醒
          </Text>
        </Badge>
      </Space>

      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
        dataSource={messages.homeworkAlerts}
        locale={{ emptyText: "暂无待做作业" }}
        renderItem={(item) => (
          <List.Item key={item.SK}>
            <PendingHomeworkCard data={item} />
          </List.Item>
        )}
      />
    </>
  );
}
