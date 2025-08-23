import React, { useEffect, useMemo, useState } from "react";
import {
  Tabs,
  Card,
  List,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Empty,
  Input,
  Badge,
  Modal,
  Button,
  Flex,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  BookOutlined,
  InfoCircleOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import { useHomeworkStore } from "../../../app/store/homeworkStore";
import { apiService } from "../../../shared/services/apiClient";
import HomeworkDetailsModal from "../card/HomeworkDetailsModal";

// dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

const { Text, Title } = Typography;
const TZ = "Asia/Shanghai";

// ---- Helpers ----
function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return dayjs(iso).tz(TZ).format("YYYY-MM-DD HH:mm");
  } catch {
    return String(iso);
  }
}

function pickStatus(dueISO) {
  const now = dayjs().tz(TZ);
  const due = dayjs(dueISO).tz(TZ);
  if (!due.isValid()) return { color: "default", text: "未知" };
  if (due.isBefore(now)) return { color: "error", text: "已截止" };
  if (due.diff(now, "hour") <= 48)
    return { color: "warning", text: "即将截止" };
  return { color: "processing", text: "未截止" };
}

function normalizeClasses(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.classes)) return input.classes;
  return [];
}

// ---- UI: Card for a single class ----
function ClassCard({ data }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  const assignments = useMemo(() => {
    const arr = Array.isArray(data.assignments) ? data.assignments.slice() : [];
    return arr.sort(
      (a, b) => dayjs(a.due_at).valueOf() - dayjs(b.due_at).valueOf()
    );
  }, [data.assignments]);

  const ribbonColor = data.category === "ongoing" ? "blue" : "default";
  const ribbonText = data.category === "ongoing" ? "进行中" : "已结束";

  const showModal = (class_id, lesson_id) => {
    setLoading(true);
    apiService
      .getHWDetails(class_id, lesson_id)
      .then((res) => {
        setDetails(res);
      })
      .finally(() => {
        setLoading(false);
      });
    setIsModalOpen(true);
  };

  return (
    <>
      <Badge.Ribbon text={ribbonText} color={ribbonColor}>
        <Card
          title={
            <Text strong style={{ fontSize: 16 }}>
              {data.class_name}
            </Text>
          }
          extra={
            <Space size={10}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                开始：{dayjs(data.start_date).format("YYYY-MM-DD")}
                <br />
                结束：{dayjs(data.end_date).format("YYYY-MM-DD")}
              </Text>
            </Space>
          }
          style={{ height: "100%" }}
        >
          {assignments.length === 0 ? (
            <Empty description="暂无作业" />
          ) : (
            <List
              itemLayout="vertical"
              dataSource={assignments}
              renderItem={(it) => {
                const status = pickStatus(it.due_at);
                return (
                  <List.Item key={it.pk}>
                    <List.Item.Meta
                      title={
                        <Flex justify="space-between" wrap>
                          <Space wrap size={12}>
                            <Text
                              style={{
                                fontSize: 16,
                                color: "rgba(9, 21, 186, 0.88)",
                              }}
                            >
                              第 {it.lesson_id} 课
                            </Text>
                            <Tag color={status.color}>{status.text}</Tag>
                          </Space>
                          <Button
                            type="link"
                            key="view"
                            style={{ padding: 0 }}
                            onClick={() => showModal(it.class_id, it.lesson_id)}
                          >
                            查看
                          </Button>
                        </Flex>
                      }
                      description={
                        <Space direction="vertical">
                          <Space size={10} wrap>
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              截止：{fmtDate(it.due_at)}
                            </Text>
                          </Space>
                          <Space size={10} wrap>
                            <ReadOutlined />
                            <Text type="secondary">{it.description}</Text>
                          </Space>
                        </Space>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      </Badge.Ribbon>
      {isModalOpen && (
        <HomeworkDetailsModal
          isModalOpen={isModalOpen}
          handleOk={() => {
            setIsModalOpen(false);
            setDetails(null);
          }}
          loading={loading}
          data={details}
        />
      )}
    </>
  );
}

// ---- Main Page ----
export default function HomeworkTeacher() {
  const store = useHomeworkStore();
  const { ongoing, ended } = store;
  const [kw, setKw] = useState("");

  useEffect(() => {
    // 调你的获取函数（存在就调用，不存在就跳过）
    if (typeof store.fetchOngoingHW === "function") store.fetchOngoingHW();
    if (typeof store.fetchEndedHW === "function") store.fetchEndedHW();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ongoingClasses = useMemo(() => normalizeClasses(ongoing), [ongoing]);
  const endedClasses = useMemo(() => normalizeClasses(ended), [ended]);
  const allClasses = useMemo(() => {
    const map = new Map();
    [...ongoingClasses, ...endedClasses].forEach((c) => map.set(c.class_id, c));
    return Array.from(map.values());
  }, [ongoingClasses, endedClasses]);

  function filterByKeyword(list) {
    if (!kw.trim()) return list;
    const k = kw.trim().toLowerCase();
    return list.filter((c) =>
      String(c.class_name || "")
        .toLowerCase()
        .includes(k)
    );
  }

  const tabs = [
    {
      key: "ongoing",
      label: `进行中 (${ongoingClasses.length})`,
      data: filterByKeyword(ongoingClasses),
    },
    {
      key: "ended",
      label: `已结束 (${endedClasses.length})`,
      data: filterByKeyword(endedClasses),
    },
    {
      key: "all",
      label: `全部 (${allClasses.length})`,
      data: filterByKeyword(allClasses),
    },
  ];

  return (
    <div>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Tabs
          defaultActiveKey="ongoing"
          tabBarExtraContent={{
            right: (
              <Input.Search
                allowClear
                placeholder="搜索班级，例如：五年级"
                onSearch={setKw}
                onChange={(e) => setKw(e.target.value)}
                style={{ width: 320 }}
              />
            ),
          }}
          items={tabs.map((t) => ({
            key: t.key,
            label: t.label,
            children:
              t.data.length === 0 ? (
                <Empty description="没有数据" />
              ) : (
                <Row gutter={[16, 16]}>
                  {t.data.map((cls) => (
                    <Col
                      key={cls.class_id}
                      xs={24}
                      sm={12}
                      lg={12}
                      xl={12}
                      xxl={8}
                    >
                      <ClassCard data={cls} />
                    </Col>
                  ))}
                </Row>
              ),
          }))}
        />
      </Space>
    </div>
  );
}
