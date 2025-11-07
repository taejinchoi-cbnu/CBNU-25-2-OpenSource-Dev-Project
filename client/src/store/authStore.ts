import { create } from "zustand";
import { type SupabaseUser, type LoginResponse } from "../types/auth.types";

// store의 state와 action을 위한 type
interface AuthState {
  user: SupabaseUser | null;
  accessToken: string | null;
  isLoading: boolean; // 페이지 첫 로드 시 인증 상태 확인 중인지

  setUserToken: (response: LoginResponse) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

// 전역 인증 상태를 관리하는 Zustand 스토어
export const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태
  user: null,
  accessToken: null,
  isLoading: true,

  // 로그인/회원가입/토큰 갱신 성공 시 유저 정보와 토큰을 상태에 저장
  setUserToken: (response) => {
    set({
      user: response.user,
      accessToken: response.access_token,
    });
  },

  // 로그아웃 또는 세션 만료 시 유저 정보와 토큰을 상태에서 제거
  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
    });
  },

  // 로딩 상태 설정
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
