// ── API client ─────────────────────────────────────────────────────
// The single place that knows where the API lives and how a reader proves
// access to a PDF. The API starts in `backend/` (`npm run dev`).

const RAW_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '')

/** Bearer token issued by the API once its auth endpoints land (#10). */
const TOKEN_STORAGE_KEY = 'somalibrary.token'

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** Headers for API calls that need to act as the signed-in reader/admin. */
export function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = getAuthToken()
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra
}

/**
 * URL for a stored PDF. The reader embeds this in an `<iframe>`, which cannot
 * send headers, so the token travels as a query param — the API scopes it to
 * one file. Chrome's viewer honours the `#page=` fragment.
 */
export function readerFileUrl(pdfPath: string, page?: number): string {
  const safePath = pdfPath.split('/').map(encodeURIComponent).join('/')
  const token = getAuthToken()
  const query = token ? `?token=${encodeURIComponent(token)}` : ''
  const fragment = page && page > 1 ? `#page=${page}` : ''
  return `${apiUrl(`/api/reader/file/${safePath}`)}${query}${fragment}`
}

export type ReaderFileStatus = 'ready' | 'locked' | 'missing' | 'offline'

/**
 * Cheap HEAD probe so the reader can explain a failure instead of showing an
 * empty frame — the embedded viewer never reports why it failed.
 */
export async function checkReaderFile(pdfPath: string): Promise<ReaderFileStatus> {
  try {
    const response = await fetch(readerFileUrl(pdfPath), { method: 'HEAD' })
    if (response.ok) return 'ready'
    if (response.status === 401 || response.status === 403) return 'locked'
    return 'missing'
  } catch {
    return 'offline'
  }
}
