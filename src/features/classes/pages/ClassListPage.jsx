import React from "react";
import { useClassStore } from "../../../app/store/classStore";
import { List } from "antd";

import ClassCard from "./ClassCard";

export default function ClassListPage() {
  const { classes, loading, error } = useClassStore();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!classes) return <div>No classes found</div>;

  return (
    <List
      loading={loading}
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4 }}
      dataSource={classes}
      locale={{ emptyText: "暂无班级" }}
      renderItem={(cls) => (
        <List.Item key={cls.class_id}>
          <ClassCard data={cls} />
        </List.Item>
      )}
    />
  );
}
