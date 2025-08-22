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
  Tooltip,
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
  SendOutlined,
  ClearOutlined,
  HighlightOutlined,
  BorderOutlined,
  FontSizeOutlined,
  AimOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenExitOutlined,
  EyeOutlined,
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
import { useNavigate } from "react-router-dom";
import { apiService } from "../../../shared/services/apiClient";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

// --- Mock data – replace with real submission props/query
const MOCK_SUBMISSION = {
  id: "sub_001",
  studentName: "张三",
  status: "ungraded",
  images: [
    { id: "img_1", url: "/images/sample1.jpg", filename: "page1.jpg" },
    { id: "img_2", url: "/images/sample2.jpg", filename: "page2.jpg" },
    { id: "img_3", url: "/images/sample3.jpg", filename: "page3.jpg" },
  ],
};

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
 * - Tools: move | pen | rect | text
 * - Undo/Redo, Clear, Export PNG (dataURL)
 * - Zoom/Color/Size、就地文本输入
 * - 优化：防止绘制时事件被旧标注拦截；指针事件；性能优化
 */
const AnnotationCanvasBase = forwardRef(function AnnotationCanvas(
  { imageUrl, value, onChange, tool, onDirtyChange, color, size },
  ref
) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [img, imgStatus] = useImage(imageUrl);
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
    exportPNGDataURL: () => {
      const node = stageRef.current;
      if (!node) return null;
      return node.toDataURL({ mimeType: "image/png", pixelRatio: 2 });
    },
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
    const mousePointTo = {
      x: (center.x - stagePos.x) / stageScale,
      y: (center.y - stagePos.y) / stageScale,
    };
    const newScale = dir > 0 ? stageScale * scaleBy : stageScale / scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
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
        // 拖动画布过程中也实时更新位置，让就地输入框跟随
        onDragMove={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
        onDragEnd={(e) => setStagePos({ x: e.target.x(), y: e.target.y() })}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={clearSelectionIfEmpty}
        perfectDrawEnabled={false} // 提升渲染性能
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

        {/* 旧标注层：仅在 move 工具下接收命中（修复叠画卡住） */}
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
              onMouseDown={
                tool === "move"
                  ? (e) => {
                      e.cancelBubble = true;
                      setSelected({ kind: "rect", index: i });
                    }
                  : undefined
              }
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
              onMouseDown={
                tool === "move"
                  ? (e) => {
                      e.cancelBubble = true;
                      setSelected({ kind: "line", index: i });
                    }
                  : undefined
              }
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
              onMouseDown={
                tool === "move"
                  ? (e) => {
                      e.cancelBubble = true;
                      setSelected({ kind: "text", index: i });
                    }
                  : undefined
              }
            />
          ))}
        </Layer>

        {/* 正在绘制中的预览矩形：永远不监听事件，避免把 pointerup 吃掉 */}
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

      {/* 就地文本输入框（跟随缩放/平移） */}
      {textEditor.open && textEditor.pos && (
        <textarea
          ref={textInputRef}
          value={textEditor.value}
          onChange={(e) =>
            setTextEditor((s) => ({ ...s, value: e.target.value }))
          }
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              // 取消
              setTextEditor({ open: false, value: "", pos: null });
            } else if (e.key === "Enter" && !e.shiftKey && !isComposing) {
              // 回车提交（Shift+Enter 换行）
              e.preventDefault();
              const t = (textEditor.value || "").trim();
              if (t) {
                pushHistory();
                const newText = {
                  x: textEditor.pos.x,
                  y: textEditor.pos.y,
                  text: t,
                  color,
                };
                onChange({ ...value, texts: [...value.texts, newText] });
              }
              setTextEditor({ open: false, value: "", pos: null });
            }
          }}
          onBlur={() => {
            // 失焦时也提交（留空则取消）
            const t = (textEditor.value || "").trim();
            if (t) {
              pushHistory();
              const newText = {
                x: textEditor.pos.x,
                y: textEditor.pos.y,
                text: t,
                color,
              };
              onChange({ ...value, texts: [...value.texts, newText] });
            }
            setTextEditor({ open: false, value: "", pos: null });
          }}
          style={{
            position: "absolute",
            left: stagePos.x + textEditor.pos.x * stageScale,
            top: stagePos.y + textEditor.pos.y * stageScale,
            fontSize: 28 * stageScale, // 与 KonvaText 大致一致
            lineHeight: 1.4,
            padding: 4,
            minWidth: 180,
            maxWidth: 360,
            border: "1px solid #1677ff",
            borderRadius: 6,
            outline: "none",
            boxShadow: "0 0 0 2px rgba(22,119,255,0.15)",
            background: "#fff",
            zIndex: 10,
            transformOrigin: "top left",
          }}
          placeholder="Enter 提交，Shift+Enter 换行，Esc 取消"
        />
      )}

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

// 画布：memo 隔离，避免滑块拖动触发重渲染
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

// 单独的 label 组件，避免顶层跟着频繁重渲
const ScoreLabel = ({ form }) => {
  const score = Form.useWatch("score", form) ?? 0;
  return <>分数: {score} 分</>;
};

/**
 * Main page (JS)
 */
export default function GradingPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submission] = useState(MOCK_SUBMISSION);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tool, setTool] = useState("pen");
  const [anno, setAnno] = useState({ lines: [], rects: [], texts: [] });
  const canvasRef = useRef(null);
  const [dirty, setDirty] = useState(false);
  const currentImage = submission.images[currentIndex];

  // NEW: color & size for annotations
  const [penColor, setPenColor] = useState("#ff0000");
  const [penSize, setPenSize] = useState(3);

  // Load draft for current image when index changes
  useEffect(() => {
    const draft = loadDraft(submission.id, currentImage.id);
    setAnno(draft ?? { lines: [], rects: [], texts: [] });
    setDirty(false);
  }, [submission.id, currentImage.id]);

  const onPrev = () => {
    if (currentIndex === 0) return;
    goToIndex(currentIndex - 1);
  };
  const onNext = () => {
    if (currentIndex === submission.images.length - 1) return;
    goToIndex(currentIndex + 1);
  };

  const saveCurrentAsDraft = async () => {
    if (!dirty) return;
    saveDraft(submission.id, currentImage.id, anno);
    // message.success("已保存草稿");
    setDirty(false);
    canvasRef.current?.markClean?.();
  };

  const goToIndex = async (idx) => {
    if (idx === currentIndex) return;
    if (idx < 0 || idx >= submission.images.length) return;
    await saveCurrentAsDraft({ silent: true }); // 静默保存，避免频繁弹 Toast
    setCurrentIndex(idx);
  };

  const clearCurrentDraft = () => {
    clearDraft(submission.id, currentImage.id);
    setAnno({ lines: [], rects: [], texts: [] });
    setDirty(true);
  };

  const handleSubmit = async (goNext = false) => {
    try {
      const { score, comment } = await form.validateFields();

      // 1) 导出批注后的图片
      const dataURL = canvasRef.current?.exportPNGDataURL?.();
      let blob;
      if (dataURL) {
        const res = await fetch(dataURL);
        blob = await res.blob();
      }

      // 2) 上传到 S3（占位：替换为你的后端 API）
      // const { url, headers, key } = await getUploadUrl({ filename: currentImage.filename || `${currentImage.id}.png`, contentType: "image/png" });
      // await putToS3(url, blob, headers);

      // 3) 提交评分与评语（占位：替换为你的后端 API）
      // await submitCorrection({ submission_id: submission.id, image_id: currentImage.id, score, comment, corrected_at: new Date().toISOString(), corrected_image_key: key });

      message.success(
        `已提交评分：${score} 分，评语：${
          comment ? comment.slice(0, 20) : "(无)"
        }`
      );

      clearDraft(submission.id, currentImage.id);
      setDirty(false);

      if (goNext) onNext();
    } catch (e) {
      if (e && e.errorFields) return; // 表单校验错误
      console.error(e);
      message.error((e && e.message) || "提交失败");
    }
  };

  const changeComment = (c) => {
    form.setFieldsValue({ comment: c });
  };

  return (
    <Layout style={{ minHeight: 640, background: "#fff" }}>
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
                        src={`${item.url}`}
                        alt={item.filename || item.id}
                        style={{ width: "100%" }}
                      />
                    </div>
                  }
                  styles={{ body: { padding: 4 } }}
                >
                  <div style={{ textOverflow: "ellipsis", overflow: "hidden" }}>
                    {item.filename || item.id}
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
                  {submission.studentName} - 第 {currentIndex + 1}/
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
                  <Tooltip title="线条颜色">
                    <ColorPicker
                      value={penColor}
                      onChange={(c) => setPenColor(c.toHexString())}
                    />
                  </Tooltip>
                  <Tooltip title="线条粗细">
                    <div style={{ width: 160 }}>
                      <Slider
                        min={1}
                        max={20}
                        value={penSize}
                        onChange={(v) => setPenSize(v)}
                      />
                    </div>
                  </Tooltip>
                </Space>
                <Divider type="vertical" />
                <Space>
                  <Tooltip title="放大">
                    <Button
                      icon={<ZoomInOutlined />}
                      onClick={() => canvasRef.current?.zoomIn?.()}
                    />
                  </Tooltip>
                  <Tooltip title="缩小">
                    <Button
                      icon={<ZoomOutOutlined />}
                      onClick={() => canvasRef.current?.zoomOut?.()}
                    />
                  </Tooltip>
                  <Tooltip title="重置视图">
                    <Button
                      icon={<FullscreenExitOutlined />}
                      onClick={() => canvasRef.current?.resetView?.()}
                    />
                  </Tooltip>
                </Space>
                <Divider type="vertical" />
                <Space style={{ width: "100%" }}>
                  <Tooltip title="撤销">
                    <Button
                      icon={<UndoOutlined />}
                      onClick={() => canvasRef.current?.undo?.()}
                    />
                  </Tooltip>
                  <Tooltip title="重做">
                    <Button
                      icon={<RedoOutlined />}
                      onClick={() => canvasRef.current?.redo?.()}
                    />
                  </Tooltip>
                  <Tooltip title="清空批注">
                    <Popconfirm
                      title="清空当前页的所有批注？"
                      onConfirm={clearCurrentDraft}
                    >
                      <Button danger icon={<ClearOutlined />} />
                    </Popconfirm>
                  </Tooltip>
                </Space>
              </Space>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
              <AnnotationCanvas
                key={currentImage.id}
                ref={canvasRef}
                imageUrl={currentImage.url}
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
          <div style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: 16 }}>
            <Title level={5}>评分与评语</Title>
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
                  step={1}
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
                  onClick={() => {
                    handleSubmit();
                    navigate("/homework");
                  }}
                >
                  提交
                </Button>
                <Popconfirm title="取消批改？">
                  <Button
                    type="default"
                    icon={<ClearOutlined />}
                    onClick={() => {
                      clearAllDraftsForSubmission(submission.id);
                      navigate("/homework");
                    }}
                  >
                    取消批改
                  </Button>
                </Popconfirm>
              </Space>
              <Divider />
              <Text type="secondary">
                切换页面时会自动保存本页草稿到本地（localStorage）。真正的上传与入库请接入你的后端
                API。
              </Text>
            </Form>
          </div>
        </div>
      </Content>
    </Layout>
  );
}
