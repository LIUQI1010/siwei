import React, { useState, useEffect } from "react";
import { useMaterialStore } from "../../../app/store/materialStore";
import { List } from "antd";
import MaterialsOfClassCard from "./MaterialsOfClassCard";

export default function MaterialsListPage() {
  const { materialsOfClass, loading, error } = useMaterialStore();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  if (!materialsOfClass) {
    return <div>暂无数据</div>;
  }

  return (
    <>
      <List
        loading={loading}
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 2,
          xxl: 3,
        }}
        dataSource={materialsOfClass}
        renderItem={(item, idx) => (
          <List.Item
            key={item.class_id}
            style={{ "--i": idx }}
            className="fade-stagger"
          >
            <MaterialsOfClassCard data={item} />
          </List.Item>
        )}
      />
    </>
  );
}
