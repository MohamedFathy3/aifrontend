import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
  },
});

export async function ensureCsrfCookie(): Promise<void> {
  await axios.get("/api/sanctum/csrf-cookie", {
    withCredentials: true,
    withXSRFToken: true,
  });
}

export interface ApiErrorShape {
  message: string;
  errors?: Record<string, string[]>;
}

export function isApiError(
  error: unknown
): error is AxiosError<ApiErrorShape> {
  return axios.isAxiosError(error);
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorShape>) => {
    if (error.response?.status === 401) {
      // Handle unauthenticated state if needed.
    }

    return Promise.reject(error);
  }
);