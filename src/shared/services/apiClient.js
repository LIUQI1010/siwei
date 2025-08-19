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
  downloadMaterial: (s3Key) => api(`/materials/download?s3_key=${s3Key}`),
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
