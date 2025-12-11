import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

export const apiClient = axios.create({
  baseURL: import.meta.env.PROD ? "/api" : import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// 토큰 갱신 상태 관리 (동시 요청 처리용)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: Error) => void;
}> = [];

// 대기 중인 요청들 처리
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    // 로그인/회원가입 요청에는 Authorization 헤더를 추가하지 않음
    const isAuthEndpoint =
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/signup");

    if (!isAuthEndpoint) {
      const { accessToken } = useAuthStore.getState();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 401 에러 발생 시 토큰 갱신 및 요청 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401이 아니거나 config가 없으면 에러 그대로 반환
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // refresh 요청 자체가 401이면 로그아웃
    if (originalRequest.url?.includes("/auth/refresh")) {
      useAuthStore.getState().clearAuth();
      // 강제 리다이렉트 제거: 비로그인 상태로 남김
      return Promise.reject(error);
    }

    // 이미 retry한 요청이면 에러 반환
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // 토큰 갱신 중이면 대기열에 추가
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject: (err) => reject(err),
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // 토큰 갱신 요청
      const response = await apiClient.post("/auth/refresh");
      const { accessToken } = response.data;

      // 새 토큰 저장
      useAuthStore.getState().setUserToken(response.data);

      // 대기 중인 요청들 처리
      processQueue(null, accessToken);

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      // 토큰 갱신 실패 시 로그아웃
      processQueue(refreshError as Error, null);
      useAuthStore.getState().clearAuth();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
