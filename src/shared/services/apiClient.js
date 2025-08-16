import { AmplifyAuthService } from "./amplifyAuth";
const API_BASE = import.meta.env.VITE_REST_ENDPOINT || "";

// API配置
export const apiService = {
  //dashboard通知
  getDashboardStats: () => api("/user/getStatsAlert"),
  getProfile: () => api("/user/getUserInfo"),
  listMaterials: () => api("/materials/list"),
  listClasses: () => api("/user/listClasses"),
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
