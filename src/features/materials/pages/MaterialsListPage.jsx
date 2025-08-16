import React, { useState, useEffect } from "react";
import { useMaterialStore } from "../../../app/store/materialStore";

export default function MaterialsListPage() {
  const { materials, loading, error } = useMaterialStore();

  if (loading) {
    return <div>加载中...</div>;
  }

  if (error) {
    return <div>错误: {error}</div>;
  }

  if (!materials) {
    return <div>暂无数据</div>;
  }

  return <div>{JSON.stringify(materials)}</div>;
}
