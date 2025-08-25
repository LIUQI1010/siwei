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
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
import { useNavigate, generatePath } from "react-router-dom";
import { useProfileStore } from "../../../app/store/profileStore";

const HomeworkDetailsModal = ({
  isModalOpen,
  handleOk,
  loading,
  data,
  onGradeStudent,
}) => {
  const m = data?.metadata;
  const dueAt = m?.due_at ? dayjs(m.due_at) : null;
  const isOverdue = dueAt ? dayjs().isAfter(dueAt) : false;
  const getClassName = useClassStore((state) => state.getClassName);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useProfileStore();

  // 跳转到批改页面的函数
  const handleGradeStudent = (student) => {
    const gradingPath = generatePath(
      "/homework/grade/:classId/:lessonId/:studentId/:studentName",
      {
        classId: m.class_id,
        lessonId: m.lesson_id,
        studentId: student.student_id,
        studentName: student.student_name || student.student_id,
      }
    );
    navigate(gradingPath, {
      state: {
        from: "/thomework",
        preserveModal: true,
        modalData: {
          classId: m.class_id,
          lessonId: m.lesson_id,
          data: data,
        },
      },
    }); // 传递来源信息和modal数据

    // 如果父组件提供了回调，调用它
    if (onGradeStudent) {
      onGradeStudent(student);
    }
  };

  const submittedColumns = [
    {
      title: t("homeworkDetailsModal_studentColumn"),
      dataIndex: "student_name",
      key: "student_name",
      render: (_, record) => {
        const studentName = record.student_name || record.student_id;
        // 只有教师角色才能点击跳转到批改页面
        if (role === "teacher") {
          return (
            <Typography.Link
              onClick={() => handleGradeStudent(record)}
              style={{ cursor: "pointer" }}
            >
              {studentName}
            </Typography.Link>
          );
        }
        return studentName;
      },
      width: 80,
    },
    {
      title: t("homeworkDetailsModal_submitTimeColumn"),
      dataIndex: "submitted_at",
      key: "submitted_at",
      render: (t) => (t ? dayjs(t).format("YYYY-MM-DD HH:mm") : "-"),
      width: 170,
    },
    {
      title: t("homeworkDetailsModal_title_field"),
      dataIndex: "question",
      key: "question",
      ellipsis: true,
    },
    {
      title: t("homeworkDetailsModal_status"),
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
      title={<h3 style={{ margin: 0 }}>{t("homeworkDetailsModal_title")}</h3>}
      footer={
        <Button type="primary" onClick={handleOk}>
          {t("homeworkDetailsModal_close")}
        </Button>
      }
      width={920}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !data ? (
        <Empty description={t("homework_noData")} />
      ) : (
        <>
          <Divider orientation="left" orientationMargin="0">
            <QuestionCircleOutlined style={{ color: "#1890ff" }} />{" "}
            {getClassName(m.class_id)}{" "}
            {t("homeworkCard_lesson", { number: m.lesson_id })}
          </Divider>

          <Descriptions
            column={2}
            size="middle"
            items={[
              {
                key: "due",
                label: t("homeworkDetailsModal_dueDate"),
                children: dueAt ? dueAt.format("YYYY-MM-DD HH:mm") : "-",
              },
              {
                key: "created",
                label: t("homeworkDetailsModal_createTime"),
                children: m?.created_at
                  ? dayjs(m.created_at).format("YYYY-MM-DD HH:mm")
                  : "-",
              },
              {
                key: "desc",
                label: t("homeworkDetailsModal_description"),
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
                label: `${t("homeworkDetailsModal_submittedTab")} (${
                  data.submitted?.length || 0
                })`,
                children:
                  !data.submitted || data.submitted.length === 0 ? (
                    <Empty
                      description={t("homeworkDetailsModal_noSubmissions")}
                    />
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
                label: `${t("homeworkDetailsModal_notSubmittedTab")} (${
                  data.unsubmitted?.length || 0
                })`,
                children:
                  !data.unsubmitted || data.unsubmitted.length === 0 ? (
                    <Empty
                      description={t("homeworkDetailsModal_noUnsubmitted")}
                    />
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
