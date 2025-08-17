import React, { useState } from "react";
import { useClassStore } from "../../../app/store/classStore";
import { List } from "antd";
import ClassDetailDrawer from "../card/ClassDetailDrawer";
import ClassCard from "./ClassCard";

export default function ClassListPage() {
  const { classes, loading, error } = useClassStore();
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(null);
  const [className, setClassName] = useState(null);
  const showDrawer = (class_id, class_name) => {
    setClassId(class_id);
    setClassName(class_name);
    setOpen(true);
  };
  const onClose = () => {
    setClassId(null);
    setClassName(null);
    setOpen(false);
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!classes) return <div>No classes found</div>;

  return (
    <>
      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
        dataSource={classes}
        locale={{ emptyText: "暂无班级" }}
        renderItem={(cls, idx) => (
          <List.Item
            key={cls.class_id}
            style={{ "--i": idx }}
            className="fade-stagger"
          >
            <ClassCard data={cls} showDrawer={showDrawer} />
          </List.Item>
        )}
      />
      <ClassDetailDrawer
        open={open}
        onClose={onClose}
        class_id={classId}
        class_name={className}
      />
    </>
  );
}
