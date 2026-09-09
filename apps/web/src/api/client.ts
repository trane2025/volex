const DEFAULT_API_BASE_URL = '/api';

export type ApiHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestOptions = {
  method?: ApiHttpMethod;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const normalizeApiBaseUrl = (baseUrl: string) => {
  const trimmedBaseUrl = baseUrl.trim();

  if (trimmedBaseUrl === '/') {
    return '';
  }

  return trimmedBaseUrl.replace(/\/+$/, '');
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE_URL);

const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${API_BASE_URL}${normalizedPath}`;
};

const readResponsePayload = async (response: Response) => {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();

  if (text.length === 0) {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return text;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const getErrorMessage = (payload: unknown, fallbackMessage: string) => {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload;
  }

  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = payload.message;

    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return fallbackMessage;
};

export const apiClient = {
  request: async <TResponse>(path: string, options: ApiRequestOptions = {}) => {
    const { body, headers, method = 'GET', signal } = options;
    const hasBody = body !== undefined;
    const requestHeaders = new Headers(headers);

    if (hasBody && !requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    const response = await fetch(buildApiUrl(path), {
      method,
      headers: requestHeaders,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal,
    });

    const payload = await readResponsePayload(response);

    if (!response.ok) {
      throw new ApiError(
        response.status,
        getErrorMessage(payload, `Request failed with status ${response.status}`),
        payload,
      );
    }

    return payload as TResponse;
  },

  get: <TResponse>(path: string, options?: Omit<ApiRequestOptions, 'body' | 'method'>) => {
    return apiClient.request<TResponse>(path, { ...options, method: 'GET' });
  },

  post: <TResponse, TBody>(
    path: string,
    body: TBody,
    options?: Omit<ApiRequestOptions, 'body' | 'method'>,
  ) => {
    return apiClient.request<TResponse>(path, { ...options, method: 'POST', body });
  },

  put: <TResponse, TBody>(
    path: string,
    body: TBody,
    options?: Omit<ApiRequestOptions, 'body' | 'method'>,
  ) => {
    return apiClient.request<TResponse>(path, { ...options, method: 'PUT', body });
  },

  patch: <TResponse, TBody>(
    path: string,
    body: TBody,
    options?: Omit<ApiRequestOptions, 'body' | 'method'>,
  ) => {
    return apiClient.request<TResponse>(path, { ...options, method: 'PATCH', body });
  },

  delete: <TResponse>(path: string, options?: Omit<ApiRequestOptions, 'body' | 'method'>) => {
    return apiClient.request<TResponse>(path, { ...options, method: 'DELETE' });
  },
};
