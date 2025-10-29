import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/authService";
import { AxiosError } from "axios";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      alert("회원가입 성공!");
      navigate("/login");
    },
    onError: (error) => {
      console.error("회원가입 실패 :", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signupMutation.mutate({ email, password, nickname });
  };

  return (
    <div>
      <h1>회원가입</h1>
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
        <div>
          <label htmlFor="nickname">닉네임</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={signupMutation.isPending}>
          {signupMutation.isPending ? "회원가입 중..." : "회원가입"}
        </button>
      </form>
      {signupMutation.isError && (
        <p style={{ color: "red" }}>
          {signupMutation.error instanceof AxiosError
            ? signupMutation.error.response?.data?.message ||
              "회원가입에 실패했습니다. 다시 시도해주세요."
            : "회원가입에 실패했습니다. 다시 시도해주세요."}
        </p>
      )}
    </div>
  );
}

export default SignupPage;
