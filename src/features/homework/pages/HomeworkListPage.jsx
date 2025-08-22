import React, { useEffect, useMemo, useState } from "react";
import { Flex, Segmented, Input, List, Empty, Spin } from "antd";
import { useHomeworkStore } from "../../../app/store/homeworkStore";
import HomeworkCard from "../card/HomeworkCard";

export default function HomeworkListPage() {
  const {
    pending,
    submitted,
    graded,
    fetchSubmittedHW,
    fetchGradedHW,
    loading,
    error,
  } = useHomeworkStore();

  const [tab, setTab] = useState("pending");
  const [q, setQ] = useState("");

  useEffect(() => {
    if (submitted.length === 0 && graded.length === 0) {
      fetchSubmittedHW?.();
      fetchGradedHW?.();
    }
  }, [submitted, graded]);

  // 你的接口是 { count, items }，这里统一取 items
  const pendingItems = pending?.items ?? [];
  const submittedItems = submitted?.items ?? [];
  const gradedItems = graded?.items ?? [];

  const data = useMemo(() => {
    const normalize = (x, fallbackStatus = "PENDING") => ({
      key: `${x.pk || x.PK}-${x.lesson_id}-${x.status || fallbackStatus}`,
      pk: x.pk || x.PK,
      class_id: x.class_id,
      lesson_id: Number(x.lesson_id),
      description: x.description || "",
      due_at: x.due_at,
      created_at: x.created_at,
      status: x.status || fallbackStatus, // PENDING | SUBMITTED | GRADED
      submitted_at: x.submitted_at,
      corrected_at: x.corrected_at,
      score: x.score,
      comment: x.comment,
      student_id: x.student_id,
    });

    let arr = [];
    if (tab === "pending") {
      arr = pendingItems.map((x) => normalize(x, "PENDING"));
    } else if (tab === "submitted") {
      arr = submittedItems.map((x) => normalize(x));
    } else if (tab === "graded") {
      arr = gradedItems.map((x) => normalize(x));
    } else {
      arr = [
        ...pendingItems.map((x) => normalize(x, "PENDING")),
        ...submittedItems.map((x) => normalize(x)),
        ...gradedItems.map((x) => normalize(x)),
      ];
    }

    const kw = q.trim().toLowerCase();
    if (kw) {
      arr = arr.filter((it) => {
        const hay = `${it.description} ${it.class_id} ${String(
          it.lesson_id
        )}`.toLowerCase();
        return hay.includes(kw);
      });
    }

    const dueTs = (it) =>
      it.due_at ? new Date(it.due_at).getTime() : Number.MAX_SAFE_INTEGER;
    const subTs = (it) =>
      it.submitted_at ? new Date(it.submitted_at).getTime() : 0;
    const grdTs = (it) =>
      it.corrected_at ? new Date(it.corrected_at).getTime() : 0;

    if (tab === "pending") {
      arr.sort((a, b) => dueTs(a) - dueTs(b));
    } else if (tab === "submitted") {
      arr.sort((a, b) => subTs(b) - subTs(a));
    } else if (tab === "graded") {
      arr.sort((a, b) => grdTs(b) - grdTs(a));
    } else {
      const order = { PENDING: 0, SUBMITTED: 1, GRADED: 2 };
      arr.sort((a, b) => {
        if (order[a.status] !== order[b.status])
          return order[a.status] - order[b.status];
        if (a.status === "PENDING") return dueTs(a) - dueTs(b);
        if (a.status === "SUBMITTED") return subTs(b) - subTs(a);
        return grdTs(b) - grdTs(a);
      });
    }

    const now = Date.now();
    return arr.map((it) => {
      const due = it.due_at ? new Date(it.due_at).getTime() : null;
      const overdue = it.status === "PENDING" && due && due < now;
      return { ...it, overdue };
    });
  }, [pendingItems, submittedItems, gradedItems, tab, q]);

  if (loading) {
    return (
      <Flex justify="center" align="center" style={{ height: "100%" }}>
        <Spin />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" gap={12} wrap>
        <Segmented
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            {
              label: `未完成 (${pending?.count ?? pendingItems.length})`,
              value: "pending",
            },
            {
              label: `已提交 (${submitted?.count ?? submittedItems.length})`,
              value: "submitted",
            },
            {
              label: `已批改 (${graded?.count ?? gradedItems.length})`,
              value: "graded",
            },
            { label: "全部", value: "all" },
          ]}
        />
        <Input.Search
          allowClear
          placeholder="搜索作业（描述/班级/课次）"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onSearch={setQ}
          style={{ maxWidth: 360 }}
        />
      </Flex>

      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
        dataSource={data}
        locale={{ emptyText: <Empty description="没有作业" /> }}
        renderItem={(it) => (
          <List.Item key={it.key}>
            <HomeworkCard data={it} />
          </List.Item>
        )}
      />
    </Flex>
  );
}
