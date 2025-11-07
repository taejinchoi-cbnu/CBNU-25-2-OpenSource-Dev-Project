// 환경변수 접근을 위한 유틸리티 객체
export const env = {
  // 개발 환경 여부 확인
  isDevelopment: import.meta.env.MODE === "development",
  // 프로덕션 환경 여부 확인
  isProduction: import.meta.env.MODE === "production",
  // 테스트 환경 여부 확인
  isTest: import.meta.env.MODE === "test",

  // API 관련
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  apiTimeout: import.meta.env.VITE_API_TIMEOUT || 10000,

  // 외부 서비스
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,

  // 기능 플래그
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    enableDebugMode: import.meta.env.VITE_DEBUG_MODE === "true",
  },

  // 앱 정보
  appName: import.meta.env.VITE_APP_NAME || "My App",
  appVersion: import.meta.env.VITE_APP_VERSION || "1.0.0",
};

// 환경변수 검증 함수
export const validateEnv = () => {
  // 필수 환경변수 목록
  const required = ["VITE_API_BASE_URL"];

  // 환경별 필수 변수
  if (env.isProduction) {
    required.push("VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY");
  }

  // 누락된 변수 확인
  const missing = required.filter((key) => !import.meta.env[key]);

  // 누락된 변수가 있으면 에러 발생
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // 환경변수 타입 검증
  if (env.apiTimeout && isNaN(Number(env.apiTimeout))) {
    throw new Error("VITE_API_TIMEOUT must be a number");
  }
};

// 환경별 로그 함수
export const log = {
  debug: (...args) => {
    if (env.isDevelopment || env.features.enableDebugMode) {
      console.log("[DEBUG]", ...args);
    }
  },
  info: (...args) => {
    if (!env.isTest) {
      console.info("[INFO]", ...args);
    }
  },
  warn: (...args) => {
    if (!env.isTest) {
      console.warn("[WARN]", ...args);
    }
  },
  error: (...args) => {
    console.error("[ERROR]", ...args);
  },
};
