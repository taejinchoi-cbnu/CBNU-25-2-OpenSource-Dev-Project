import axios from "axios";
import { useAuthStore } from "../store/authStore";

// API 요청을 위한 기본 Axios 인스턴스
export const apiClient = axios.create({
  baseURL: import.meta.env.PROD ? "/api" : import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Axios Request Interceptor, Store에 저장된 Access Token을 HTTP header에 추가
apiClient.interceptors.request.use(
  (config) => {
    // Zustand 스토어에서 Access Token을 가져옴
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
