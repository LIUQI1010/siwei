import { ScrollRestoration } from "react-router-dom";
import { AmplifyAuthService } from "./amplifyAuth";
const API_BASE = import.meta.env.VITE_REST_ENDPOINT || "";

// API配置
export const apiService = {
  //dashboard通知
  getDashboardStats: () => api("/user/getStatsAlert"),
  getProfile: () => api("/user/getUserInfo"),
  listMaterials: () => api("/materials/list"),
  listClasses: () => api("/user/listClasses"),
  listStudents: (class_id) =>
    api(`/teacher/getClassDetails?class_id=${class_id}`),
  updateProfile: (payload) =>
    api("/user/updateUserInfo", {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  downloadMaterial: (s3Key) => api(`/materials/download?s3_key=${encodeURIComponent(s3Key)}`),
  // 上传文件
  uploadMaterial: (classId, description, filename, file_type, file_size) =>
    api(`/materials/upload`, {
      method: "POST",
      body: JSON.stringify({
        class_id: classId,
        description: description,
        filename: filename,
        file_type: file_type,
        file_size: file_size,
      }),
    }),
  //删除文件
  deleteMaterial: (classId, file_id) =>
    api(`/materials/delete`, {
      method: "DELETE",
      body: JSON.stringify({
        class_id: classId,
        file_id: file_id,
      }),
    }),
  //创建作业
  createHW: (data) =>
    api(`/homework/create`, {
      method: "POST",
      body: JSON.stringify({
        class_id: data.class_id,
        description: data.description,
        lesson_id: data.lesson_id,
        due_at: data.due_at,
      }),
    }),

  //学生提交作业
  submitHW: (data) =>
    api(`/student/submitHomework`, {
      method: "POST",
      body: JSON.stringify({
        class_id: data.class_id,
        lesson_id: data.lesson_id,
        question: data.question,
        student_name: data.student_name,
      }),
    }),

  // 获取S3预签名URL用于上传图片
  getS3PresignedUrl: (classId, lessonId, ext) =>
    api(
      `/user/uploadImage?class_id=${classId}&lesson_id=${lessonId}&ext=${ext}`,
      {
        method: "GET",
      }
    ),
  //获取图片列表
  listImages: (classId, lessonId, opts = {}) => {
    const params = new URLSearchParams({
      class_id: String(classId),
      lesson_id: String(lessonId),
    });

    // 老师可指定学生
    if (opts.studentId) params.set("student_id", opts.studentId);

    // 分页（如果上一页返回了 nextToken）
    if (opts.nextToken) params.set("nextToken", opts.nextToken);

    // 是否返回预签名 URL（默认为 true），传 false 则只要 Key
    if (opts.signed === false) params.set("signed", "false");

    // 预签名有效期（秒），默认后端是 600
    if (opts.expiresIn) params.set("expiresIn", String(opts.expiresIn));

    return api(`/user/getImages?${params.toString()}`, { method: "GET" });
  },

  //学生获取未提交作业列表
  getPendingHW: () =>
    api(`/student/getHWpending`, {
      method: "GET",
    }),

  //学生获取已提交作业列表
  getSubmittedHW: () =>
    api(`/student/getHWsubmitted`, {
      method: "GET",
    }),

  //学生获取已批改作业列表
  getGradedHW: () =>
    api(`/student/getHWgraded`, {
      method: "GET",
    }),

  //获取作业批改详情
  getHWGradedDetail: (class_id, lesson_id, student_id) => {
    const qs = new URLSearchParams();
    qs.set("class_id", String(class_id));
    qs.set("lesson_id", String(lesson_id));
    if (student_id) qs.set("student_id", String(student_id)); // 只有教师场景需要

    return api(`/homework/getHWGradedDetail?${qs.toString()}`, {
      method: "GET",
    });
  },

  //老师获取作业
  listHW: (category) =>
    api(`/teacher/listHW?category=${category}`, {
      method: "GET",
    }),

  //老师获取作业详情,包含已提交学生和未提交学生
  getHWDetails: (class_id, lesson_id) =>
    api(`/teacher/getHWDetail?class_id=${class_id}&lesson_id=${lesson_id}`, {
      method: "GET",
    }),

  //老师批改作业
  gradeHW: (classId, lessonId, studentId, score, comment) =>
    api(`/teacher/gradeHomework`, {
      method: "PATCH",
      body: JSON.stringify({
        class_id: classId,
        lesson_id: lessonId,
        student_id: studentId,
        score: score,
        comment: comment,
      }),
    }),

  // 批改图片：获取覆盖上传用的预签名（PUT）
  // items 可选，用于把 content_type 也传给后端（如果你的后端支持）。
  presignGradedImages: (classId, lessonId, studentId, keys) =>
    api(`/homework/grade/presign`, {
      method: "POST",
      body: JSON.stringify({
        class_id: classId,
        lesson_id: lessonId,
        student_id: studentId,
        keys: keys,
      }),
    }),
};

export async function api(path, { method = "GET", headers = {}, body } = {}) {
  // 使用 AmplifyAuthService 获取有效的 token
  const idToken = await AmplifyAuthService.getValidIdToken();
  const finalHeaders = {
    "Content-Type": "application/json",
    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    ...headers,
  };
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: finalHeaders,
    body,
  });
  if (res.status === 401 || res.status === 403) {
    // 清除所有本地存储，让 AmplifyAuthService 重新处理认证
    localStorage.clear();
    sessionStorage.clear();
    location.href = "/auth/login";
    return;
  }
  if (!res.ok) {
    let payload = null;
    try {
      payload = await res.json();
    } catch {}
    const message = (payload && payload.message) || "Request failed";
    throw new Error(message);
  }
  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}
