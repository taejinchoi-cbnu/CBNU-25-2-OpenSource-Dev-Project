import { apiClient } from "./client";
import {
  type LoginResponse,
  type LoginCredentials,
  type SignupCredentials,
} from "../types/auth.types";

export const authService = {
  /**
   * 이메일과 비밀번호를 사용하여 로그인을 요청
   * @param credentials 로그인 자격 증명 (email, password)
   * @returns {Promise<LoginResponse>} 로그인 응답 데이터 (access_token, user 정보)
   */

  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  /**
   * 이메일, 비밀번호, 닉네임을 사용하여 회원가입을 요청
   * @param credentials 회원가입 자격 증명 (email, password, nickname)
   * @returns {Promise<LoginResponse>} 회원가입 응답 데이터 (access_token, user 정보)
   */

  signup: async (credentials: SignupCredentials) => {
    const response = await apiClient.post<LoginResponse>(
      "/auth/signup",
      credentials
    );
    return response.data;
  },

  /**
   * 로그아웃을 요청
   * 백엔드는 이 요청을 받고 HttpOnly 쿠키(Refresh Token)를 삭제
   * @returns {Promise<void>}
   */

  logout: async () => {
    await apiClient.post("/auth/logout");
  },

  /**
   * Access Token 갱신(Silent Refresh)을 요청
   * @returns {Promise<LoginResponse>} 갱신된 토큰 정보
   */

  refresh: async () => {
    const response = await apiClient.post<LoginResponse>("/auth/refresh");
    return response.data;
  },
};
