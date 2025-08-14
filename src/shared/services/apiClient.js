const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function api(path, { method='GET', headers={}, body } = {}) {
  const token = localStorage.getItem('id_token')
  const finalHeaders = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }
  const res = await fetch(`${API_BASE}${path}`, { method, headers: finalHeaders, body })
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('id_token')
    location.href = '/auth/login'
    return
  }
  if (!res.ok) {
    let payload = null
    try { payload = await res.json() } catch {}
    const message = (payload && payload.message) || 'Request failed'
    throw new Error(message)
  }
  if (res.status === 204) return null
  try { return await res.json() } catch { return null }
}
