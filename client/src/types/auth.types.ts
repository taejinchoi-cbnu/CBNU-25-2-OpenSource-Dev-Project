// SupabaseAuth가 반환하는 user 정보 type
export interface SupabaseUser {
  id: string;
  aud: string;
  role: string;
  email: string;
  email_confirmed_at: string;
  phone: string;
  confirmed_at: string;
  last_sign_in_at: string;
  created_at: string;
  updated_at: string;
}

// 로그인/회원가입/토큰 갱신 시 res 본문 type
export interface LoginResponse {
  access_token: string;
  user: SupabaseUser;
}

// 로그인 요청 시 필요한 자격 증명 type
export interface LoginCredentials {
  email: string;
  password: string;
}

// 회원가입 요청 시 필요한 자격 증명 type
export interface SignupCredentials {
  email: string;
  password: string;
  nickname: string;
}
