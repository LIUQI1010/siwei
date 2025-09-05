// src/utils/imageCompression.js

/*** 可调默认参数 ***/
export const DEFAULTS = {
  // 分辨率控制
  maxWidth: 2560,
  maxHeight: 2560,
  minEdge: 800, // 尺寸缩小时的下限（任一边）
  downscaleStep: 0.85, // 每次尺寸再缩比例

  // 质量控制
  initialQuality: 0.92,
  minQuality: 0.6, // 画质兜底，不再往下压

  // 目标大小（软目标：按像素动态）
  bytesPerMP: 90 * 1024, // 每百万像素目标字节（JPEG 推荐 80~120KB/MP）
  minTargetBytes: 140 * 1024,
  maxTargetBytes: 800 * 1024,
  tolerance: 0.1, // 目标±10% 视为达标

  // 透明处理
  preserveTransparency: "auto", // 'auto' | true | false
  forceMime: undefined, // 'image/jpeg' | 'image/webp' | 'image/png'
};

/*** 工具函数 ***/
export const blobToDataURL = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export async function loadImageFromFile(fileOrBlob) {
  if (window.createImageBitmap) {
    try {
      return await createImageBitmap(
        fileOrBlob /*, { imageOrientation: 'from-image' }*/
      );
    } catch (_) {}
  }
  const dataUrl = await blobToDataURL(fileOrBlob);
  const img = new Image();
  img.decoding = "async";
  img.src = dataUrl;
  await new Promise((res, rej) => {
    img.onload = () => res();
    img.onerror = rej;
  });
  return img;
}

// 采样判断是否存在透明像素（快速/低开销）
async function hasAlpha(img) {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, s, s);
  const { data } = ctx.getImageData(0, 0, s, s);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function pickMime({ srcType, preserveTransparency, forceMime }) {
  if (forceMime) return forceMime;
  if (preserveTransparency === true) return "image/webp";
  if (preserveTransparency === false) return "image/jpeg";
  // auto：按源/真实透明度判断
  if (srcType && /png|webp/i.test(srcType)) {
    // 这里先返回 webp（稍后若检测到无透明也可以继续用 webp，体积更小）
    return "image/webp";
  }
  return "image/jpeg";
}

function computeSoftTargetBytes({
  width,
  height,
  bytesPerMP,
  minTargetBytes,
  maxTargetBytes,
}) {
  const mp = (width * height) / 1_000_000;
  const target = Math.max(
    minTargetBytes,
    Math.min(maxTargetBytes, Math.round(mp * bytesPerMP))
  );
  return target;
}

function toBlob(canvas, mime, quality) {
  return new Promise((res) => canvas.toBlob(res, mime, quality));
}

/**
 * 智能压缩：分辨率限制 + 软目标（按像素）+ 质量二分搜索 + 尺寸回退
 * 返回 { file, meta }
 */
export async function compressSmart(file, options = {}) {
  const cfg = { ...DEFAULTS, ...options };
  const srcType = file.type || "image/jpeg";
  const img = await loadImageFromFile(file);

  // 计算首轮目标尺寸（只缩不放）
  let w = img.width;
  let h = img.height;
  const s = Math.min(1, cfg.maxWidth / w, cfg.maxHeight / h);
  if (s < 1) {
    w = Math.max(1, Math.floor(w * s));
    h = Math.max(1, Math.floor(h * s));
  }

  // 透明判断（仅在 auto 时才读取）
  let preserve = cfg.preserveTransparency;
  if (preserve === "auto") {
    try {
      preserve = await hasAlpha(img);
    } catch {
      preserve = /png|webp/i.test(srcType);
    }
  }

  let outMime = pickMime({
    srcType,
    preserveTransparency: preserve,
    forceMime: cfg.forceMime,
  });

  // 画布
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: false });

  const draw = (W, H) => {
    canvas.width = W;
    canvas.height = H;
    if (outMime === "image/jpeg") {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, W, H);
    }
    ctx.drawImage(img, 0, 0, W, H);
  };

  draw(w, h);

  // 软目标大小
  const targetBytes = computeSoftTargetBytes({
    width: w,
    height: h,
    bytesPerMP: cfg.bytesPerMP,
    minTargetBytes: cfg.minTargetBytes,
    maxTargetBytes: cfg.maxTargetBytes,
  });

  const upper = targetBytes * (1 + cfg.tolerance);
  const lower = targetBytes * (1 - cfg.tolerance);

  // 二分搜索质量（在 initialQuality 与 [minQuality, initialQuality] 之间）
  async function searchQuality(minQ, maxQ) {
    let lo = Math.max(cfg.minQuality, minQ);
    let hi = Math.min(cfg.initialQuality, maxQ);
    let bestBlob = await toBlob(canvas, outMime, hi);
    if (!bestBlob) return null;

    // 如果一上来就落在容忍区间，直接用
    if (bestBlob.size <= upper && bestBlob.size >= lower) return bestBlob;

    let iterations = 0,
      best = bestBlob;
    // 如果太大，往下找质量；如果太小（远小于下界），可以微调往上（但不超过 initialQuality）
    while (iterations++ < 8) {
      const mid = (lo + hi) / 2;
      const blob = await toBlob(canvas, outMime, mid);
      if (!blob) break;

      best = blob;

      if (blob.size > upper) {
        // 仍然过大 -> 降质量
        hi = mid;
      } else if (blob.size < lower) {
        // 太小 -> 略升质量（保护画质）
        lo = mid;
      } else {
        // 命中软目标
        return blob;
      }
      // 收敛条件
      if (Math.abs(hi - lo) < 0.02) break;
    }
    return best;
  }

  // 主循环：先质量搜索，若仍明显超出上界且已到质量下限，则按比例再缩尺寸
  let qualityMin = cfg.minQuality;
  let qualityMax = cfg.initialQuality;
  let blob = await searchQuality(qualityMin, qualityMax);

  // 尺寸回退
  while (
    blob &&
    blob.size > upper &&
    (canvas.width > cfg.minEdge || canvas.height > cfg.minEdge)
  ) {
    const nw = Math.max(
      cfg.minEdge,
      Math.floor(canvas.width * cfg.downscaleStep)
    );
    const nh = Math.max(
      cfg.minEdge,
      Math.floor(canvas.height * cfg.downscaleStep)
    );
    draw(nw, nh);
    // 每次缩完可以把质量上界恢复到 initialQuality，再二分找一个更合适的质量
    blob = await searchQuality(qualityMin, qualityMax);
  }

  // 如果二分/缩放失败，兜底用一次 toBlob
  if (!blob) {
    blob = await toBlob(canvas, outMime, cfg.initialQuality);
  }

  const ext =
    outMime === "image/png" ? "png" : outMime === "image/webp" ? "webp" : "jpg";

  const outFile = new File(
    [blob],
    (file.name || "image").replace(/\.\w+$/, "") + `_compressed.${ext}`,
    { type: outMime, lastModified: Date.now() }
  );

  return {
    file: outFile,
    meta: {
      srcBytes: file.size,
      outBytes: outFile.size,
      width: canvas.width,
      height: canvas.height,
      mime: outMime,
      targetBytes,
      hitSoftTarget: outFile.size <= upper && outFile.size >= lower,
    },
  };
}

/**
 * 简化入口：智能压缩或按条件跳过
 * - 小图 & 小文件可直接跳过，避免无谓二次编码
 */
export async function compressSmartOrKeep(file, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  // 小于最小软目标且边长不大，就不必压
  const skipBelow = Math.min(cfg.minTargetBytes, 160 * 1024);
  if (file.size <= skipBelow) {
    try {
      // 仍然检查是否是超大分辨率的小体积（罕见），若很大仍建议压缩
      const img = await loadImageFromFile(file);
      if (Math.max(img.width, img.height) <= 1280)
        return { file, meta: { skipped: true } };
    } catch {
      return { file, meta: { skipped: true } };
    }
  }
  return await compressSmart(file, cfg);
}
