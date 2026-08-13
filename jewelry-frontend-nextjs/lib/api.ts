const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  status: number;
  // Chi tiết lỗi theo từng field (từ Zod fieldErrors) — trước đây bị bỏ qua
  // hoàn toàn, khiến UI chỉ hiện được đúng thông báo chung "Validation failed",
  // mất hết thông tin field nào thực sự gây lỗi.
  details?: Record<string, string[] | undefined>;
  constructor(status: number, message: string, details?: Record<string, string[] | undefined>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: unknown;
}

/**
 * Gọi API backend thật (`NEXT_PUBLIC_API_URL`), KHÔNG dùng đường dẫn tương đối —
 * frontend và backend nằm trên 2 domain khác nhau ở production
 * (your-domain.com vs api.your-domain.com, xem nginx/nginx.conf), nên
 * `fetch('/api/...')` sẽ gọi nhầm vào chính domain frontend và luôn trả 404.
 */
export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, body, headers, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, data?.details);
  }

  return data as T;
}
