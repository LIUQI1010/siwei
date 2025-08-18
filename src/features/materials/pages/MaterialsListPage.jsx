import React, { useMemo, useState } from "react";
import { useMaterialStore } from "../../../app/store/materialStore";
import { List, Select, Input, Space, Typography, Row, Col } from "antd";
import MaterialsOfClassCard from "./MaterialsOfClassCard";

const { Text } = Typography;
const listGrid = { gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 };

export default function MaterialsListPage() {
  const loading = useMaterialStore((s) => s.loading);
  const error = useMaterialStore((s) => s.error);
  const materialsOfClass = useMaterialStore((s) => s.materialsOfClass);
  const filterByExpiredStatus = useMaterialStore(
    (s) => s.filterByExpiredStatus
  );

  // 默认显示“进行中”
  const [status, setStatus] = useState("active"); // 'active' | 'expired' | 'all'
  const [query, setQuery] = useState("");

  const baseList = useMemo(
    () => filterByExpiredStatus(status),
    [materialsOfClass, status, filterByExpiredStatus]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter((c) =>
      (c.class_name ?? "").toLowerCase().includes(q)
    );
  }, [baseList, query]);

  return (
    <>
      <Row
        gutter={[listGrid.gutter, listGrid.gutter]}
        style={{ marginBottom: 16 }}
      >
        {/* 这个 Col 的宽度 = 一张 Card 的宽度 */}
        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={8}>
          {/* 两个控件合起来正好占满这个 Col（也就是卡片宽度） */}
          <Space.Compact block>
            {/* 左边下拉：固定宽度（可改比例写法见下） */}
            <Select
              value={status}
              onChange={setStatus}
              options={[
                { label: "进行中", value: "active" },
                { label: "已结束", value: "expired" },
                { label: "全部", value: "all" },
              ]}
              style={{ width: 100 }}
            />
            {/* 右边搜索：吃掉剩余宽度 */}
            <Input.Search
              allowClear
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onSearch={setQuery}
              placeholder="按班级名搜索"
              style={{ flex: 1, minWidth: 160 }}
            />
          </Space.Compact>
        </Col>
      </Row>

      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
        dataSource={filtered}
        locale={{
          emptyText: query || status !== "all" ? "没有匹配的班级" : "暂无数据",
        }}
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
