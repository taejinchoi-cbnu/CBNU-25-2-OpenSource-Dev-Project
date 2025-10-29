import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/authService";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const setUserToken = useAuthStore((state) => state.setUserToken);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setUserToken(data); // Zustand store 토큰 update
      navigate("/"); // 성공하면 홈으로 리다이렉트
    },
    onError: (error) => {
      console.error("로그인 실패:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div>
      <h1>로그인</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "로그인 중..." : "로그인"}
        </button>
      </form>
      {loginMutation.isError && (
        <p style={{ color: "red" }}>
          {loginMutation.error instanceof AxiosError
            ? loginMutation.error.response?.data?.message ||
              "로그인에 실패했습니다. 다시 시도해주세요."
            : "로그인에 실패했습니다. 다시 시도해주세요."}
        </p>
      )}
    </div>
  );
}

export default LoginPage;
