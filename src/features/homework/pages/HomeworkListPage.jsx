import React, { useEffect, useMemo, useState } from "react";
import { Flex, Segmented, Input, List, Empty, Spin } from "antd";
import { useHomeworkStore } from "../../../app/store/homeworkStore";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";
import HomeworkCard from "../card/HomeworkCard";

export default function HomeworkListPage() {
  const {
    pending,
    submitted,
    graded,
    fetchPendingHW,
    fetchSubmittedHW,
    fetchGradedHW,
    loading,
    error,
  } = useHomeworkStore();
  const { t } = useTranslation();

  const [tab, setTab] = useState("pending");
  const [q, setQ] = useState("");

  useEffect(() => {
    // 确保所有数据都被加载，修复条件检查
    const submittedItems = submitted?.items || submitted || [];
    const gradedItems = graded?.items || graded || [];
    const pendingItems = pending?.items || pending || [];
    
    // 如果任何数据为空，则重新加载
    if (pendingItems.length === 0) {
      fetchPendingHW?.();
    }
    if (submittedItems.length === 0) {
      fetchSubmittedHW?.();
    }
    if (gradedItems.length === 0) {
      fetchGradedHW?.();
    }
  }, []);

  // 你的接口是 { count, items }，这里统一取 items
  const pendingItems = pending?.items ?? [];
  const submittedItems = submitted?.items ?? [];
  const gradedItems = graded?.items ?? [];

  const data = useMemo(() => {
    const normalize = (x, fallbackStatus = "PENDING") => {
      // 根据数据来源和字段确定正确的状态
      let actualStatus = fallbackStatus;
      
      // 如果有评分信息，则为GRADED
      if (x.score !== undefined && x.score !== null && x.corrected_at) {
        actualStatus = "GRADED";
      }
      // 如果有提交时间但没有评分，则为SUBMITTED  
      else if (x.submitted_at && !x.corrected_at) {
        actualStatus = "SUBMITTED";
      }
      // 否则使用传入的fallbackStatus或后端的status
      else if (x.status) {
        actualStatus = x.status;
      }
      
      return {
        key: `${x.pk || x.PK}-${x.lesson_id}-${actualStatus}`,
        pk: x.pk || x.PK,
        class_id: x.class_id,
        lesson_id: Number(x.lesson_id),
        description: x.description || "",
        due_at: x.due_at,
        created_at: x.created_at,
        status: actualStatus, // PENDING | SUBMITTED | GRADED
        submitted_at: x.submitted_at,
        corrected_at: x.corrected_at,
        score: x.score,
        comment: x.comment,
        student_id: x.student_id,
      };
    };

    let arr = [];
    if (tab === "pending") {
      arr = pendingItems.map((x) => normalize(x, "PENDING"));
    } else if (tab === "submitted") {
      // 只显示真正已提交但未评分的作业
      arr = submittedItems.map((x) => normalize(x, "SUBMITTED"))
        .filter(item => item.status === "SUBMITTED");
    } else if (tab === "graded") {
      // 显示已评分的作业，包括可能从submitted中误分类的
      const gradedFromGraded = gradedItems.map((x) => normalize(x, "GRADED"));
      const gradedFromSubmitted = submittedItems.map((x) => normalize(x, "SUBMITTED"))
        .filter(item => item.status === "GRADED");
      
      // 合并并去重
      const allGraded = [...gradedFromGraded, ...gradedFromSubmitted];
      const uniqueGraded = allGraded.filter((item, index, self) => 
        index === self.findIndex(t => t.key === item.key)
      );
      arr = uniqueGraded;
    } else {
      // 全部标签：正确分类所有作业
      const allItems = [
        ...pendingItems.map((x) => normalize(x, "PENDING")),
        ...submittedItems.map((x) => normalize(x, "SUBMITTED")),
        ...gradedItems.map((x) => normalize(x, "GRADED")),
      ];
      
      // 去重（以防同一作业出现在多个列表中）
      arr = allItems.filter((item, index, self) => 
        index === self.findIndex(t => 
          t.class_id === item.class_id && 
          t.lesson_id === item.lesson_id
        )
      );
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

  return (
    <Flex vertical gap={16}>
      <Flex justify="space-between" align="center" gap={12} wrap>
        <Segmented
          value={tab}
          onChange={(v) => setTab(v)}
          options={[
            {
              label: `${t("homeworkListPage_tabPending")} (${
                pending?.count ?? pendingItems.length
              })`,
              value: "pending",
            },
            {
              label: `${t("homeworkListPage_tabSubmitted")} (${
                submitted?.count ?? submittedItems.length
              })`,
              value: "submitted",
            },
            {
              label: `${t("homeworkListPage_tabGraded")} (${
                graded?.count ?? gradedItems.length
              })`,
              value: "graded",
            },
            { label: t("homeworkListPage_filterAll"), value: "all" },
          ]}
        />
        <Input.Search
          allowClear
          placeholder={t("homeworkListPage_searchPlaceholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onSearch={setQ}
          style={{ maxWidth: 360 }}
        />
      </Flex>

      <Spin spinning={loading} tip="正在加载作业数据...">
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 4 }}
          dataSource={data}
          locale={{
            emptyText: <Empty description={t("homeworkListPage_noHomework")} />,
          }}
          renderItem={(it) => (
            <List.Item key={it.key}>
              <HomeworkCard data={it} />
            </List.Item>
          )}
        />
      </Spin>
    </Flex>
  );
}
