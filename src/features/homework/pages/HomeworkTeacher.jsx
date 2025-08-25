import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Segmented,
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
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
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

function pickStatus(dueISO, t) {
  const now = dayjs().tz(TZ);
  const due = dayjs(dueISO).tz(TZ);
  if (!due.isValid())
    return { color: "default", text: t("homeworkTeacher_statusUnknown") };
  if (due.isBefore(now))
    return { color: "error", text: t("homeworkTeacher_statusOverdue") };
  if (due.diff(now, "hour") <= 48)
    return { color: "warning", text: t("homeworkTeacher_statusDueSoon") };
  return { color: "processing", text: t("homeworkTeacher_statusOngoing") };
}

function normalizeClasses(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.classes)) return input.classes;
  return [];
}

// ---- UI: Card for a single class ----
function ClassCard({ data, location }) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  const assignments = useMemo(() => {
    const arr = Array.isArray(data.assignments) ? data.assignments.slice() : [];
    return arr.sort(
      (a, b) => dayjs(a.due_at).valueOf() - dayjs(b.due_at).valueOf()
    );
  }, [data.assignments]);

  const ribbonColor = data.category === "ongoing" ? "blue" : "gray";
  const ribbonText =
    data.category === "ongoing"
      ? t("homeworkTeacher_statusOngoing")
      : t("homeworkTeacher_statusEnded");

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

  // 检查是否需要恢复modal状态
  useEffect(() => {
    const shouldOpenModal = location?.state?.openModal;
    const modalData = location?.state?.modalData;

    if (shouldOpenModal && modalData) {
      // 检查这个modal是否是当前ClassCard对应的modal
      const matchesClass = data.class_id === modalData.classId;
      if (matchesClass) {
        setDetails(modalData.data);
        setIsModalOpen(true);
        // 清理state，避免重复触发
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [location?.state, data.class_id]);

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
                {t("homeworkTeacher_startDate")}:{" "}
                {dayjs(data.start_date).format("YYYY-MM-DD")}
                <br />
                {t("homeworkTeacher_endDate")}:{" "}
                {dayjs(data.end_date).format("YYYY-MM-DD")}
              </Text>
            </Space>
          }
          style={{ height: "100%" }}
        >
          {assignments.length === 0 ? (
            <Empty description={t("homeworkTeacher_noHomework")} />
          ) : (
            <List
              itemLayout="vertical"
              dataSource={assignments}
              renderItem={(it) => {
                const status = pickStatus(it.due_at, t);
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
                              {t("homeworkCard_lesson", {
                                number: it.lesson_id,
                              })}
                            </Text>
                            <Tag color={status.color}>{status.text}</Tag>
                          </Space>
                          <Button
                            type="link"
                            key="view"
                            style={{ padding: 0 }}
                            onClick={() => showModal(it.class_id, it.lesson_id)}
                          >
                            {t("homeworkTeacher_viewDetails")}
                          </Button>
                        </Flex>
                      }
                      description={
                        <Space direction="vertical">
                          <Space size={10} wrap>
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              {t("homeworkTeacher_dueDate")}:{" "}
                              {fmtDate(it.due_at)}
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
          onGradeStudent={() => {
            // 当进入批改页面时，不关闭modal
            // modal的关闭会在取消返回时重新打开
          }}
        />
      )}
    </>
  );
}

// ---- Main Page ----
export default function HomeworkTeacher() {
  const store = useHomeworkStore();
  const location = useLocation();
  const { ongoing, ended } = store;
  const [kw, setKw] = useState("");
  const [activeTab, setActiveTab] = useState("ongoing");
  const { t } = useTranslation();

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
      label: `${t("homeworkTeacher_tabOngoing")} (${ongoingClasses.length})`,
      data: filterByKeyword(ongoingClasses),
    },
    {
      key: "ended",
      label: `${t("homeworkTeacher_tabEnded")} (${endedClasses.length})`,
      data: filterByKeyword(endedClasses),
    },
    {
      key: "all",
      label: `${t("homeworkTeacher_tabAll")} (${allClasses.length})`,
      data: filterByKeyword(allClasses),
    },
  ];

  // 获取当前活跃tab的数据
  const getCurrentTabData = () => {
    const currentTab = tabs.find((tab) => tab.key === activeTab);
    return currentTab ? currentTab.data : [];
  };

  const currentData = getCurrentTabData();

  return (
    <div>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Flex justify="space-between" align="center" gap={12} wrap>
          <Segmented
            value={activeTab}
            onChange={setActiveTab}
            options={tabs.map((tab) => ({
              label: tab.label,
              value: tab.key,
            }))}
          />
          <Input.Search
            allowClear
            placeholder={t("homeworkTeacher_searchPlaceholder")}
            onSearch={setKw}
            onChange={(e) => setKw(e.target.value)}
            style={{ width: 320 }}
          />
        </Flex>

        {currentData.length === 0 ? (
          <Empty description="没有数据" />
        ) : (
          <Row gutter={[16, 16]}>
            {currentData.map((cls) => (
              <Col key={cls.class_id} xs={24} sm={12} lg={12} xl={12} xxl={8}>
                <ClassCard data={cls} location={location} />
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </div>
  );
}
