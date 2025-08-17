import { Drawer, Tabs, Table } from "antd";
import { apiService } from "../../../shared/services/apiClient";
import { useEffect, useState } from "react";

export default function ClassDetailDrawer({
  open,
  onClose,
  class_id,
  class_name,
}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    { title: "姓名", dataIndex: "name" },
    { title: "手机号", dataIndex: "phone" },
    { title: "邮箱", dataIndex: "email", render: (t) => (t ? t : "—") },
  ];

  const items = [
    {
      key: "active",
      label: `在读 (${active.length})`,
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
      label: `退费 (${inactive.length})`,
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
      width={600}
      placement="right"
      title={class_name}
      closable={{ "aria-label": "Close Button" }}
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
