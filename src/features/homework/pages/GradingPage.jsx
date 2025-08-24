import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Layout,
  List,
  Card,
  Form,
  Input,
  Button,
  Space,
  Segmented,
  Typography,
  Divider,
  message,
  Popconfirm,
  Badge,
  Skeleton,
  ColorPicker,
  Slider,
} from "antd";
import {
  LeftOutlined,
  RightOutlined,
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  ClearOutlined,
  HighlightOutlined,
  BorderOutlined,
  FontSizeOutlined,
  AimOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenExitOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  Stage,
  Layer,
  Line,
  Rect,
  Text as KonvaText,
  Image as KonvaImage,
} from "react-konva";
import useImage from "use-image";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../../../shared/services/apiClient";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

// Local storage helpers (draft persistence per page)
const DRAFT_PREFIX = "grading_draft_";
const draftKey = (submissionId, imageId) =>
  `grading_draft_${submissionId}_${imageId}`;
const loadDraft = (submissionId, imageId) => {
  try {
    const raw = localStorage.getItem(draftKey(submissionId, imageId));
    const parsed = raw ? JSON.parse(raw) : null;
    // 兼容历史数据：给 line 填充 x/y 默认 0
    if (parsed && Array.isArray(parsed.lines)) {
      parsed.lines = parsed.lines.map((l) => ({ x: 0, y: 0, ...l }));
    }
    return parsed;
  } catch {
    return null;
  }
};
const saveDraft = (submissionId, imageId, data) => {
  localStorage.setItem(draftKey(submissionId, imageId), JSON.stringify(data));
};
const clearDraft = (submissionId, imageId) => {
  localStorage.removeItem(draftKey(submissionId, imageId));
};
// 清空【当前提交】的全部页草稿
const clearAllDraftsForSubmission = (submissionId) => {
  const prefix = `${DRAFT_PREFIX}${submissionId}_`;
  const toRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
};

/**
 * AnnotationCanvas (JS)
 */
const AnnotationCanvasBase = forwardRef(function AnnotationCanvas(
  { imageUrl, value, onChange, tool, onDirtyChange, color, size },
  ref
) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  // const [img, imgStatus] = useImage(imageUrl || null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 500 });
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState(null);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [dirty, setDirty] = useState(false);

  // 就地文本编辑器
  const [textEditor, setTextEditor] = useState({
    open: false,
    value: "",
    pos: null, // 内容坐标
  });
  const textInputRef = useRef(null);
  const [isComposing, setIsComposing] = useState(false);

  // Zoom & Pan state (受控)
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  // Selection state（仅 move 下用于高亮/选中）
  const [selected, setSelected] = useState({ kind: null, index: -1 });
  const [img, imgStatus] = useImage(imageUrl ?? null, "anonymous");
  useEffect(() => {
    if (onDirtyChange) onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    if (textEditor.open) {
      requestAnimationFrame(() => textInputRef.current?.focus());
    }
  }, [textEditor.open]);

  // 切换到非 move 工具时，清理选中
  useEffect(() => {
    if (tool !== "move") setSelected({ kind: null, index: -1 });
  }, [tool]);

  // Resize to container & image aspect
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const maxW = el.clientWidth || 800;
      const w = Math.min(1000, maxW);
      const aspect = img ? img.height / img.width : 3 / 4;
      setStageSize({ width: w, height: Math.round(w * aspect) });
    };
    compute();

    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [img]);

  // Helpers
  const pushHistory = (snap) => {
    const snapshot = snap ?? JSON.parse(JSON.stringify(value));
    setHistory((h) => [...h, snapshot]);
    setFuture([]);
    setDirty(true);
    onDirtyChange?.(true);
  };

  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      setFuture((f) => [JSON.parse(JSON.stringify(value)), ...f]);
      onChange(last);
      setDirty(true);
      return h.slice(0, -1);
    });
  };
  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setHistory((h) => [...h, JSON.parse(JSON.stringify(value))]);
      onChange(next);
      setDirty(true);
      return f.slice(1);
    });
  };

  // Convert pointer to content coordinates (移除缩放和平移影响)
  const getContentPointer = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - stagePos.x) / stageScale,
      y: (pointer.y - stagePos.y) / stageScale,
    };
  };

  useImperativeHandle(ref, () => ({
    // exportPNGDataURL: () => {
    //   const node = stageRef.current;
    //   if (!node) return null;
    //   return node.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
    // },
    exportPNGDataURL: () => {
      const node = stageRef.current;
      if (!node) throw new Error("Stage 未就绪");
      if (imgStatus !== "loaded") {
        throw new Error("图片尚未加载完成，无法导出");
      }
      return node.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
    },
    isReady: () => imgStatus === "loaded",
    clearAll: () => {
      onChange({ lines: [], rects: [], texts: [] });
      setHistory([]);
      setFuture([]);
      setDirty(true);
    },
    undo,
    redo,
    zoomIn: () => handleZoom(1),
    zoomOut: () => handleZoom(-1),
    resetView: () => {
      setStageScale(1);
      setStagePos({ x: 0, y: 0 });
    },
    markClean: () => {
      setDirty(false);
      onDirtyChange?.(false);
    },
  }));

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stagePos.x) / stageScale,
      y: (pointer.y - stagePos.y) / stageScale,
    };
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale =
      direction > 0 ? stageScale * scaleBy : stageScale / scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleZoom = (dir) => {
    const stage = stageRef.current;
    const containerRect = stage.container().getBoundingClientRect();
    const center = { x: containerRect.width / 2, y: containerRect.height / 2 };
    const scaleBy = 1.15;
    theMousePointTo = {
      x: (center.x - stagePos.x) / stageScale,
      y: (center.y - stagePos.y) / stageScale,
    };
    const newScale = dir > 0 ? stageScale * scaleBy : stageScale / scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: center.x - theMousePointTo.x * newScale,
      y: center.y - theMousePointTo.y * newScale,
    });
  };

  const clearSelectionIfEmpty = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) setSelected({ kind: null, index: -1 });
  };

  const handlePointerDown = () => {
    if (tool === "pen") {
      pushHistory();
      setDrawing(true);
      const pos = getContentPointer();
      if (!pos) return;
      const newLine = {
        x: 0,
        y: 0,
        points: [pos.x, pos.y],
        strokeWidth: size,
        color,
      };
      onChange({ ...value, lines: [...value.lines, newLine] });
    } else if (tool === "rect") {
      pushHistory();
      const pos = getContentPointer();
      if (!pos) return;
      setCurrentRect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color,
        strokeWidth: size,
      });
    } else if (tool === "text") {
      const pos = getContentPointer();
      if (!pos) return;
      setTextEditor({ open: true, value: "", pos });
    }
  };

  const handlePointerMove = () => {
    const pos = getContentPointer();
    if (!pos) return;

    if (tool === "pen" && drawing) {
      const lines = value.lines.slice();
      const last = lines[lines.length - 1];
      if (!last) return;
      last.points = last.points.concat([pos.x, pos.y]);
      onChange({ ...value, lines });
    } else if (tool === "rect" && currentRect) {
      const w = pos.x - currentRect.x;
      const h = pos.y - currentRect.y;
      setCurrentRect({ ...currentRect, width: w, height: h });
    }
  };

  const handlePointerUp = () => {
    if (tool === "pen") setDrawing(false);
    else if (tool === "rect" && currentRect) {
      const rect = normalizeRect(currentRect);
      onChange({ ...value, rects: [...value.rects, rect] });
      setCurrentRect(null);
    }
  };

  function normalizeRect(r) {
    const x = r.width < 0 ? r.x + r.width : r.x;
    const y = r.height < 0 ? r.y + r.height : r.y;
    return {
      x,
      y,
      width: Math.abs(r.width),
      height: Math.abs(r.height),
      color: r.color,
      strokeWidth: r.strokeWidth,
    };
  }

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stagePos.x}
        y={stagePos.y}
        draggable={tool === "move"}
        onDragMove={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
        onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={clearSelectionIfEmpty}
        perfectDrawEnabled={false}
        style={{
          background: "#f6f7f9",
          border: "1px solid #f0f0f0",
          borderRadius: 8,
        }}
      >
        {/* 背景图层不接收事件 */}
        <Layer listening={false}>
          {img ? (
            <KonvaImage
              image={img}
              width={stageSize.width}
              height={stageSize.height}
            />
          ) : (
            <KonvaText
              x={12}
              y={12}
              text={imgStatus === "loading" ? "图片加载中…" : "未加载图片"}
              fontSize={16}
              fill="#999"
            />
          )}
        </Layer>

        {/* 旧标注层：仅在 move 工具下接收命中 */}
        <Layer listening={tool === "move"}>
          {value.rects.map((r, i) => (
            <Rect
              key={`rect-${i}`}
              x={r.x}
              y={r.y}
              width={r.width}
              height={r.height}
              stroke={r.color || "#ff4d4f"}
              strokeWidth={r.strokeWidth || 2}
              dash={[6, 4]}
              cornerRadius={2}
            />
          ))}

          {value.lines.map((l, i) => (
            <Line
              key={`line-${i}`}
              x={l.x || 0}
              y={l.y || 0}
              points={l.points}
              stroke={l.color || "#faad14"}
              strokeWidth={l.strokeWidth || size}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
            />
          ))}

          {value.texts.map((t, i) => (
            <KonvaText
              key={`text-${i}`}
              x={t.x}
              y={t.y}
              text={t.text}
              fontSize={t.fontSize ?? 28}
              fill={t.color || "#1677ff"}
            />
          ))}
        </Layer>

        {/* 正在绘制中的预览矩形 */}
        <Layer listening={false}>
          {currentRect && (
            <Rect
              x={currentRect.x}
              y={currentRect.y}
              width={currentRect.width}
              height={currentRect.height}
              stroke={currentRect.color || "#ff4d4f"}
              strokeWidth={currentRect.strokeWidth || 2}
              dash={[6, 4]}
              cornerRadius={2}
            />
          )}
        </Layer>
      </Stage>

      {imgStatus === "loading" && (
        <div style={{ marginTop: 8 }}>
          <Skeleton active paragraph={{ rows: 1 }} title={false} />
        </div>
      )}

      <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
        鼠标滚轮缩放，选择“移动”工具可拖动画布。
      </Text>
    </div>
  );
});

const AnnotationCanvas = React.memo(
  AnnotationCanvasBase,
  (prev, next) =>
    prev.imageUrl === next.imageUrl &&
    prev.tool === next.tool &&
    prev.color === next.color &&
    prev.size === next.size &&
    prev.value === next.value &&
    prev.onChange === next.onChange &&
    prev.onDirtyChange === next.onDirtyChange
);

const ScoreLabel = ({ form }) => {
  const score = Form.useWatch("score", form) ?? 0;
  return <>分数: {score} 分</>;
};

/**
 * Main page (JS)
 */
export default function GradingPage() {
  const { classId, lessonId, studentId, studentName } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const submissionId = `${classId}_${lessonId}_${studentId}`;
  const [submission, setSubmission] = useState({
    id: submissionId,
    studentName: studentName || "学生",
    status: "ungraded",
    images: [], // 初始为空，避免渲染任何本地图片
  });
  const [loading, setLoading] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [tool, setTool] = useState("pen");
  const [anno, setAnno] = useState({ lines: [], rects: [], texts: [] });
  const canvasRef = useRef(null);
  const [dirty, setDirty] = useState(false);
  const currentImage = submission.images[currentIndex] || null;
  const [question, setQuestion] = useState("");

  // 可保留这个调试状态，不影响渲染
  const [images, setImages] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const raw = await apiService.listImages(classId, lessonId, {
          studentId: studentId,
        });
        const res = await apiService.getHWGradedDetail(
          classId,
          lessonId,
          studentId
        );
        // console.log(res);
        const data = raw?.data ?? raw; // 兼容 axios/fetch
        const items = (data?.items || []).map((it) => ({
          id: it.key,
          key: it.key,
          url: it.url, // 预签名 URL
        }));
        setImages(items); // 可选：仅日志/调试
        setSubmission((prev) => ({ ...prev, images: items }));
        setQuestion(res.submission.question);
      } catch (e) {
        message.error("加载图片失败");
      } finally {
        setLoading(false);
      }
    })();
  }, [classId, lessonId, studentId]);

  const [penColor, setPenColor] = useState("#ff0000");
  const [penSize, setPenSize] = useState(3);

  // 当前页草稿加载（当前没有图片时不做任何事）
  useEffect(() => {
    if (!currentImage) return;
    const draft = loadDraft(submission.id, currentImage.id);
    setAnno(draft ?? { lines: [], rects: [], texts: [] });
    setDirty(false);
  }, [submission.id, currentImage?.id]);

  const onPrev = () => {
    if (currentIndex === 0) return;
    goToIndex(currentIndex - 1);
  };
  const onNext = () => {
    if (currentIndex === submission.images.length - 1) return;
    goToIndex(currentIndex + 1);
  };

  const saveCurrentAsDraft = async () => {
    if (!dirty || !currentImage) return;
    saveDraft(submission.id, currentImage.id, anno);
    setDirty(false);
    canvasRef.current?.markClean?.();
  };

  const goToIndex = async (idx) => {
    if (idx === currentIndex) return;
    if (idx < 0 || idx >= submission.images.length) return;
    await saveCurrentAsDraft({ silent: true });
    setCurrentIndex(idx);
  };

  const clearCurrentDraft = () => {
    if (!currentImage) return;
    clearDraft(submission.id, currentImage.id);
    setAnno({ lines: [], rects: [], texts: [] });
    setDirty(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 小工具
      const nextFrame = () =>
        new Promise((r) => requestAnimationFrame(() => r()));
      const hasAnno = (d) =>
        !!d &&
        ((Array.isArray(d.lines) && d.lines.length > 0) ||
          (Array.isArray(d.rects) && d.rects.length > 0) ||
          (Array.isArray(d.texts) && d.texts.length > 0));

      // 先把当前页（如果有改动）落草稿一份，避免漏内容
      await saveCurrentAsDraft();

      // === 收集“需要导出并上传”的页面 ===
      // 当前页：优先用内存里的 anno；没有就看草稿
      const toProcess = [];
      if (currentImage) {
        if (hasAnno(anno)) {
          toProcess.push({
            idx: currentIndex,
            key: currentImage.key,
            draft: anno,
          });
        } else {
          const d = loadDraft(submission.id, currentImage.id);
          if (hasAnno(d))
            toProcess.push({
              idx: currentIndex,
              key: currentImage.key,
              draft: d,
            });
        }
      }
      // 其它页：有草稿才导
      for (let i = 0; i < submission.images.length; i++) {
        if (i === currentIndex) continue;
        const img = submission.images[i];
        const d = loadDraft(submission.id, img.id);
        if (hasAnno(d)) toProcess.push({ idx: i, key: img.key, draft: d });
      }

      if (toProcess.length === 0) {
        message.warning("没有可上传的批注图片");
        return;
      }

      // === 逐页导出「背景+批注」合成图（PNG），收集成 [{key, blob}] ===
      const editedImages = [];
      for (const item of toProcess) {
        // 切到对应页并应用该页的标注
        // if (currentIndex !== item.idx) {
        //   setCurrentIndex(item.idx);
        //   await nextFrame();
        // }
        // setAnno(item.draft);
        // // 等两帧，让画布完成绘制后再导出
        // await nextFrame();
        // await nextFrame();

        // const dataURL = canvasRef.current?.exportPNGDataURL?.(); // 已包含背景+批注
        if (currentIndex !== item.idx) {
          setCurrentIndex(item.idx);
          await nextFrame();
        }
        setAnno(item.draft);
        // 等待图片真正 loaded（最多 ~1.5s，可按需调整）
        const waitReady = async (tries = 30) => {
          for (let i = 0; i < tries; i++) {
            if (canvasRef.current?.isReady?.()) return;
            await new Promise((r) => setTimeout(r, 50));
          }
          throw new Error(`第 ${item.idx + 1} 页图片未加载完成`);
        };
        await waitReady();

        const dataURL = canvasRef.current.exportPNGDataURL();
        if (!dataURL) {
          throw new Error(`第 ${item.idx + 1} 页画布未就绪`);
        }
        const blob = await (await fetch(dataURL)).blob();
        editedImages.push({ key: item.key, blob });
      }

      // === 预签名（只签需要覆盖的 key） ===
      const keys = editedImages.map((it) => it.key);
      const { uploads } = await apiService.presignGradedImages(
        classId,
        lessonId,
        studentId,
        keys
      );
      const byKey = new Map(uploads.map((u) => [u.key, u]));

      // === 覆盖上传到 S3（同名覆盖） ===
      await Promise.all(
        editedImages.map(async (it) => {
          const u = byKey.get(it.key);
          if (!u) throw new Error(`缺少预签名：${it.key}`);
          const res = await fetch(u.url, {
            method: "PUT",
            headers: u.headers || { "Content-Type": "image/png" },
            body: it.blob,
          });
          if (!res.ok) {
            const t = await res.text().catch(() => "");
            throw new Error(`上传失败 ${it.key}: ${res.status} ${t}`);
          }
        })
      );

      // === 批改（只写分数/评语，后端会把状态置 GRADED） ===
      const { score, comment } = await form.validateFields();
      await apiService.gradeHW(classId, lessonId, studentId, score, comment);

      // 成功后清掉本提交的草稿，避免下次残留
      clearAllDraftsForSubmission(submission.id);

      message.success("批改完成");
      navigate(`/dashboard`);
    } catch (e) {
      console.error(e);
      message.error(e.message || "批改失败");
    } finally {
      setLoading(false);
    }
  };

  const changeComment = (txt) => form.setFieldsValue({ comment: txt });

  return (
    <Layout style={{ background: "#fff", height: "100%" }}>
      <Sider
        width={120}
        theme="light"
        style={{
          borderRight: "1px solid #f0f0f0",
          padding: 10,
          overflowY: "auto",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Title level={5} style={{ margin: 0 }}>
            <EyeOutlined /> 预览
          </Title>
          <List
            loading={loading}
            grid={{ gutter: 8, column: 1 }}
            dataSource={submission.images}
            renderItem={(item, idx) => (
              <List.Item key={item.id}>
                <Card
                  size="small"
                  hoverable
                  onClick={() => goToIndex(idx)}
                  cover={
                    <div
                      style={{
                        height: 40,
                        overflow: "hidden",
                        background: "#fafafa",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        crossOrigin="anonymous"
                        src={item.url}
                        alt={item.id}
                        style={{ width: "100%" }}
                      />
                    </div>
                  }
                  styles={{ body: { padding: 4 } }}
                >
                  <div
                    style={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      textAlign: "center",
                    }}
                  >
                    第{idx + 1}张
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </Space>
      </Sider>

      <Content style={{ padding: 16, height: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 16,
            height: "100%",
          }}
        >
          {/* Canvas + Toolbar */}
          <div
            style={{ display: "flex", flexDirection: "column", minHeight: 400 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Space size={8} wrap>
                <Badge
                  status={
                    submission.status === "graded"
                      ? "success"
                      : submission.status === "ungraded"
                      ? "processing"
                      : "default"
                  }
                />
                <Title level={5} style={{ margin: 0 }}>
                  {submission.studentName || "学生"} - 第{" "}
                  {submission.images.length ? currentIndex + 1 : 0}/
                  {submission.images.length} 页
                </Title>
              </Space>
              <Space>
                <Button
                  onClick={onPrev}
                  icon={<LeftOutlined />}
                  disabled={currentIndex === 0}
                >
                  上一页
                </Button>
                <Button
                  onClick={onNext}
                  icon={<RightOutlined />}
                  disabled={currentIndex === submission.images.length - 1}
                >
                  下一页
                </Button>
              </Space>
            </div>

            {/* —— 工具栏（插入这段） —— */}
            <div style={{ marginBottom: 12 }}>
              <Space wrap>
                <Segmented
                  options={[
                    { label: "移动", value: "move", icon: <AimOutlined /> },
                    {
                      label: "画笔",
                      value: "pen",
                      icon: <HighlightOutlined />,
                    },
                    { label: "矩形", value: "rect", icon: <BorderOutlined /> },
                    {
                      label: "文本",
                      value: "text",
                      icon: <FontSizeOutlined />,
                    },
                  ]}
                  value={tool}
                  onChange={(v) => setTool(v)}
                />

                <Divider type="vertical" />

                <Space>
                  <ColorPicker
                    value={penColor}
                    onChange={(c) => setPenColor(c.toHexString())}
                  />
                  <div style={{ width: 160 }}>
                    <Slider
                      min={1}
                      max={20}
                      value={penSize}
                      onChange={(v) => setPenSize(v)}
                    />
                  </div>
                </Space>

                <Divider type="vertical" />

                <Space>
                  <Button
                    icon={<ZoomInOutlined />}
                    onClick={() => canvasRef.current?.zoomIn?.()}
                  />
                  <Button
                    icon={<ZoomOutOutlined />}
                    onClick={() => canvasRef.current?.zoomOut?.()}
                  />
                  <Button
                    icon={<FullscreenExitOutlined />}
                    onClick={() => canvasRef.current?.resetView?.()}
                  />
                </Space>

                <Divider type="vertical" />

                <Space>
                  <Button
                    icon={<UndoOutlined />}
                    onClick={() => canvasRef.current?.undo?.()}
                  />
                  <Button
                    icon={<RedoOutlined />}
                    onClick={() => canvasRef.current?.redo?.()}
                  />
                  <Popconfirm
                    title="清空当前页的所有批注？"
                    onConfirm={clearCurrentDraft}
                  >
                    <Button danger icon={<ClearOutlined />} />
                  </Popconfirm>
                </Space>
              </Space>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
              <AnnotationCanvas
                key={currentImage?.id || "empty"}
                ref={canvasRef}
                imageUrl={currentImage?.url || ""}
                value={anno}
                onChange={setAnno}
                tool={tool}
                onDirtyChange={setDirty}
                color={penColor}
                size={penSize}
              />
            </div>
          </div>

          {/* Grading form */}
          <Space direction="vertical" style={{ width: "100%" }}>
            <Title level={5}>
              <QuestionCircleOutlined /> 学生问题
            </Title>
            <Text type="secondary">{question}</Text>
            <Divider />
            <Title level={5}>
              <AimOutlined /> 评分与评语
            </Title>
            <Form
              form={form}
              layout="vertical"
              initialValues={{ score: 100, comment: "" }}
            >
              <Form.Item
                label={<ScoreLabel form={form} />}
                name="score"
                rules={[{ required: true, message: "请选择分数" }]}
              >
                <Slider
                  min={0}
                  max={100}
                  step={10}
                  tooltip={{
                    formatter: (v) => `${v} 分`,
                  }}
                />
              </Form.Item>
              <Form.Item label="评语" name="comment">
                <Input.TextArea
                  rows={6}
                  placeholder="请填写对本次作业的评价与建议"
                />
              </Form.Item>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Title level={5}>
                  <AimOutlined /> 快速选择评语
                </Title>
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() =>
                    changeComment("作业完成的很棒！请继续保持🌟🌟🌟")
                  }
                >
                  作业完成的很棒！请继续保持🌟🌟🌟
                </Button>
                <Button
                  color="primary"
                  variant="outlined"
                  onClick={() =>
                    changeComment("有错误的题目，不要忘记订正哦😣😣😣")
                  }
                >
                  有错误的题目，不要忘记订正哦😣😣😣
                </Button>
                <Button
                  color="danger"
                  variant="outlined"
                  onClick={() =>
                    changeComment("作业完成的不认真，请重新完成‼️")
                  }
                >
                  作业完成的不认真，请重新完成‼️
                </Button>
              </Space>

              <Divider />
              <Space direction="horizontal" style={{ width: "100%" }}>
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={handleSubmit}
                >
                  提交
                </Button>
                <Popconfirm title="取消批改？">
                  <Button
                    type="default"
                    icon={<ClearOutlined />}
                    onClick={() => {
                      clearAllDraftsForSubmission(submission.id);
                      navigate("/dashboard");
                    }}
                  >
                    取消批改
                  </Button>
                </Popconfirm>
              </Space>
            </Form>
          </Space>
        </div>
      </Content>
    </Layout>
  );
}
