export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const asset = (src) => { if (!src) return ''; if (src.startsWith('http')) return src; if (src.startsWith('/assets')) return src; if (src.startsWith('/uploads')) return `${API.replace('/api', '')}${src}`; return src };
export async function api(path, options = {}) { const token = localStorage.getItem('onbook_token'); const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }; const res = await fetch(`${API}${path}`, { ...options, headers }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.message || 'Request failed'); return data; }

export async function apiBlob(path, options = {}) {
  const token = localStorage.getItem('onbook_token');
  const headers = { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Request failed');
  }
  return res.blob();
}
