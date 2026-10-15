import axios from "axios";

export const AUTH_TOKEN_KEY = "cofre.accessToken";
export const AUTH_SESSION_CHANGED_EVENT = "cofre:session-changed";
export const SESSION_EXPIRED_EVENT = "cofre:session-expired";

export type ApiErrorResponse = {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
  fields?: Array<{ field: string; message: string }>;
};

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  timeout: 10_000,
});

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      typeof window !== "undefined" &&
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.startsWith("/auth/")
    ) {
      const hadSession = sessionStorage.getItem(AUTH_TOKEN_KEY);

      if (hadSession) {
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(
  error: unknown,
  fallback = "Não foi possível concluir a operação.",
) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback;

  const message = error.response?.data?.message;

  if (Array.isArray(message)) return message.join(" ");
  return message || fallback;
}
