import { Drawer, Tabs, Table } from "antd";
import { apiService } from "../../../shared/services/apiClient";
import { useEffect, useState } from "react";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export default function ClassDetailDrawer({
  open,
  onClose,
  class_id,
  class_name,
}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        if (class_id) {
          const res = await apiService.listStudents(class_id);
          setStudents(res.students || []);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [class_id]);

  const active = students.filter((s) => s.status === "active");
  const inactive = students.filter((s) => s.status === "inactive");

  const columns = [
    { title: t("classDetailDrawer_studentName"), dataIndex: "name" },
    { title: t("classDetailDrawer_studentPhone"), dataIndex: "phone" },
    {
      title: t("classDetailDrawer_studentEmail"),
      dataIndex: "email",
      render: (text) => (text ? text : "—"),
    },
  ];

  const items = [
    {
      key: "active",
      label: `${t("classDetailDrawer_activeStudents")} (${active.length})`,
      children: (
        <Table
          rowKey={(r) => `${r.phone}-${r.name}`}
          columns={columns}
          dataSource={active}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: "inactive",
      label: `${t("classDetailDrawer_inactiveStudents")} (${inactive.length})`,
      children: (
        <Table
          rowKey={(r) => `${r.phone}-${r.name}`}
          columns={columns}
          dataSource={inactive}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <Drawer
      width={480}
      placement="left"
      title={class_name}
      // closable={{ "aria-label": "Close Button" }}
      onClose={onClose}
      open={open}
      loading={loading}
    >
      {error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <Tabs items={items} destroyOnHidden />
      )}
    </Drawer>
  );
}
