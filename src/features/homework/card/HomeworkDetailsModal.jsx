import React from "react";
import {
  Modal,
  Button,
  Descriptions,
  Tabs,
  Table,
  List,
  Tag,
  Space,
  Typography,
  Divider,
  Empty,
  Skeleton,
} from "antd";
import dayjs from "dayjs";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useClassStore } from "../../../app/store/classStore";

const HomeworkDetailsModal = ({ isModalOpen, handleOk, loading, data }) => {
  const m = data?.metadata;
  const dueAt = m?.due_at ? dayjs(m.due_at) : null;
  const isOverdue = dueAt ? dayjs().isAfter(dueAt) : false;
  const getClassName = useClassStore((state) => state.getClassName);

  const submittedColumns = [
    {
      title: "学生",
      dataIndex: "student_name",
      key: "student_name",
      render: (_, r) => r.student_name || r.student_id,
      width: 80,
    },
    {
      title: "提交时间",
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
      width: 170,
    },
    {
      title: "问题",
      dataIndex: "question",
      key: "question",
      ellipsis: true,
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (s) => <Tag>{s || "-"}</Tag>,
    },
  ];

  return (
    <Modal
      style={{ minWidth: "390px" }}
      open={isModalOpen}
      onOk={handleOk}
      closable={false}
      title={<h3 style={{ margin: 0 }}>作业详情</h3>}
      footer={
        <Button type="primary" onClick={handleOk}>
          确定
        </Button>
      }
      width={920}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !data ? (
        <Empty description="暂无数据" />
      ) : (
        <>
          <Divider orientation="left" orientationMargin="0">
            <QuestionCircleOutlined style={{ color: "#1890ff" }} />{" "}
            {getClassName(m.class_id)} 第{m.lesson_id}课
          </Divider>

          <Descriptions
            column={2}
            size="middle"
            items={[
              {
                key: "due",
                label: "截止时间",
                children: dueAt ? dueAt.format("YYYY-MM-DD HH:mm") : "-",
              },
              {
                key: "created",
                label: "创建时间",
                children: m?.created_at
                  ? dayjs(m.created_at).format("YYYY-MM-DD HH:mm")
                  : "-",
              },
              {
                key: "desc",
                label: "作业说明",
                children: m?.description || "-",
              },
            ]}
          />

          <Divider style={{ margin: "12px 0" }} />

          <Tabs
            defaultActiveKey={
              data.submitted?.length ? "submitted" : "unsubmitted"
            }
            items={[
              {
                key: "submitted",
                label: `已提交 (${data.submitted?.length || 0})`,
                children:
                  !data.submitted || data.submitted.length === 0 ? (
                    <Empty description="暂无已提交" />
                  ) : (
                    <Table
                      rowKey="student_id"
                      size="middle"
                      columns={submittedColumns}
                      dataSource={data.submitted}
                      pagination={{ pageSize: 8, size: "small" }}
                    />
                  ),
              },
              {
                key: "unsubmitted",
                label: `未提交 (${data.unsubmitted?.length || 0})`,
                children:
                  !data.unsubmitted || data.unsubmitted.length === 0 ? (
                    <Empty description="暂无未提交" />
                  ) : (
                    <List
                      size="small"
                      dataSource={data.unsubmitted}
                      renderItem={(s) => (
                        <List.Item>
                          <Typography.Text>
                            {s.student_name || s.student_id}
                          </Typography.Text>
                        </List.Item>
                      )}
                    />
                  ),
              },
            ]}
          />
        </>
      )}
    </Modal>
  );
};

export default HomeworkDetailsModal;
