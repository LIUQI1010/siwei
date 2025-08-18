import React, { useState, useMemo } from "react";
import { useClassStore } from "../../../app/store/classStore";
import { List, Input, Select, Space, Typography, Row, Col } from "antd";
import ClassDetailDrawer from "../card/ClassDetailDrawer";
import CreateHWDrawer from "../card/CreateHWDrawer";
import ClassCard from "../card/ClassCard";

const { Text } = Typography;

export default function ClassListPage() {
  const loading = useClassStore((s) => s.loading);
  const error = useClassStore((s) => s.error);
  const getByStatus = useClassStore((s) => s.getByStatus);
  const classes = useClassStore((s) => s.classes);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ongoing"); // 默认进行中
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
      {/* 顶部工具栏：搜索 + 状态筛选（默认进行中） */}
      <Row gutter={[16, 16]} align="middle" wrap style={{ marginBottom: 16 }}>
        {/* 搜索框所在列：宽度与卡片一致 */}
        <Col xs={24} sm={12} md={12} lg={12} xl={8} xxl={6}>
          <Input.Search
            allowClear
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onSearch={setQuery}
            placeholder="搜索：班级名 / 学科 / 老师 / 地点 / 年级"
            style={{ width: "100%" }} // 让输入框填满该列
          />
        </Col>

        {/* 右侧筛选与统计，自适应剩余空间 */}
        <Col flex="auto">
          <Space wrap>
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 120 }}
              options={[
                { label: "进行中", value: "ongoing" },
                { label: "未开始", value: "upcoming" },
                { label: "已结束", value: "finished" },
                { label: "全部", value: "all" },
              ]}
            />
            <Text type="secondary">共 {filtered.length} 个结果</Text>
          </Space>
        </Col>
      </Row>
      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
        dataSource={filtered}
        locale={{ emptyText: query ? "没有匹配的班级" : "暂无班级" }}
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
