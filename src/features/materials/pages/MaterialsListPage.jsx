import React, { useMemo, useState } from "react";
import { useMaterialStore } from "../../../app/store/materialStore";
import {
  List,
  Segmented,
  Input,
  Space,
  Typography,
  Row,
  Col,
  Flex,
} from "antd";
import MaterialsOfClassCard from "./MaterialsOfClassCard";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

const { Text } = Typography;
const listGrid = { gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 };

export default function MaterialsListPage() {
  const loading = useMaterialStore((s) => s.loading);
  const error = useMaterialStore((s) => s.error);
  const materialsOfClass = useMaterialStore((s) => s.materialsOfClass);
  const filterByExpiredStatus = useMaterialStore(
    (s) => s.filterByExpiredStatus
  );
  const { t } = useTranslation();

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
          <Flex justify="space-between" align="center" gap={12} wrap>
            {/* 左边 segment：自适应内容，不再固定宽度 */}
            <Segmented
              value={status}
              onChange={setStatus}
              size="middle"
              options={[
                {
                  label: t("materialsListPage_statusOngoing"),
                  value: "active",
                },
                {
                  label: t("materialsListPage_statusEnded"),
                  value: "expired",
                },
                { label: t("materialsListPage_statusAll"), value: "all" },
              ]}
            />
            {/* 右边搜索：吃掉剩余宽度 */}
            <Input.Search
              allowClear
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onSearch={setQuery}
              placeholder={t("materialsListPage_searchPlaceholder")}
              style={{ flex: 1, minWidth: 160 }}
            />
          </Flex>
        </Col>
      </Row>

      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 3 }}
        dataSource={filtered}
        locale={{
          emptyText:
            query || status !== "all"
              ? t("materialsListPage_noMatchingClasses")
              : t("materialsListPage_noData"),
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
