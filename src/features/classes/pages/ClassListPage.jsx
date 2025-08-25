import React, { useState, useMemo } from "react";
import { useClassStore } from "../../../app/store/classStore";
import { List, Input, Segmented, Space, Typography, Row, Col } from "antd";
import ClassDetailDrawer from "../card/ClassDetailDrawer";
import CreateHWDrawer from "../card/CreateHWDrawer";
import ClassCard from "../card/ClassCard";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

const { Text } = Typography;

export default function ClassListPage() {
  const loading = useClassStore((s) => s.loading);
  const error = useClassStore((s) => s.error);
  const getByStatus = useClassStore((s) => s.getByStatus);
  const classes = useClassStore((s) => s.classes);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ongoing"); // 默认进行中
  const { t } = useTranslation();
  const baseList = useMemo(
    () => getByStatus(status),
    [getByStatus, status, classes]
  );

  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(null);
  const [className, setClassName] = useState(null);
  const [openHW, setOpenHW] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseList;
    return baseList.filter((cls) => {
      const haystack = [
        cls.class_name,
        cls.subject,
        cls.teacher_name,
        cls.classroom,
        String(cls.grade),
        cls.class_id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [baseList, query]);

  const showClassDetailDrawer = (class_id, class_name) => {
    setClassId(class_id);
    setClassName(class_name);
    setOpen(true);
  };
  const onClose = () => {
    setClassId(null);
    setClassName(null);
    setOpen(false);
  };

  const showHWDrawer = (class_id, class_name) => {
    setClassName(class_name);
    setClassId(class_id);
    setOpenHW(true);
  };
  const closeHW = () => {
    setClassId(null);
    setClassName(null);
    setOpenHW(false);
  };

  return (
    <>
      {/* 顶部工具栏：segment 左 / 搜索右 */}
      <Row gutter={[16, 16]} align="middle" wrap style={{ marginBottom: 16 }}>
        {/* 左侧：Segmented + 统计，自适应剩余空间 */}
        <Col flex="auto">
          <Space wrap>
            <Segmented
              value={status}
              onChange={setStatus}
              size="middle"
              options={[
                { label: t("classListPage_statusOngoing"), value: "ongoing" },
                { label: t("classListPage_statusUpcoming"), value: "upcoming" },
                { label: t("classListPage_statusEnded"), value: "finished" },
                { label: t("classListPage_statusAll"), value: "all" },
              ]}
            />
            <Text type="secondary">
              {t("classListPage_totalResults", { count: filtered.length })}
            </Text>
          </Space>
        </Col>

        {/* 右侧：搜索框（固定响应式宽度） */}
        <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={6}>
          <Input.Search
            allowClear
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onSearch={setQuery}
            placeholder={t("classListPage_searchPlaceholder")}
            style={{ width: "100%" }}
          />
        </Col>
      </Row>

      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
        dataSource={filtered}
        locale={{
          emptyText: query
            ? t("classListPage_noMatchingClasses")
            : t("classListPage_noClasses"),
        }}
        renderItem={(cls, idx) => (
          <List.Item
            key={cls.class_id}
            style={{ "--i": idx }}
            className="fade-stagger"
          >
            <ClassCard
              data={cls}
              showCDDrawer={showClassDetailDrawer}
              showHWDrawer={showHWDrawer}
            />
          </List.Item>
        )}
      />
      <ClassDetailDrawer
        open={open}
        onClose={onClose}
        class_id={classId}
        class_name={className}
      />
      <CreateHWDrawer
        open={openHW}
        onClose={closeHW}
        class_id={classId}
        class_name={className}
      />
    </>
  );
}
