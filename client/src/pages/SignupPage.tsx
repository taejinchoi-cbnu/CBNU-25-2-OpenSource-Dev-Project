import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/authService";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");

  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: authService.signup,
    onSuccess: () => {
      toast.success("회원가입 성공! 로그인해주세요.");
      navigate("/login");
    },
    onError: (error) => {
      let errorMsg = "다시 시도해주세요";
      if (error instanceof AxiosError) {
        errorMsg = error.response?.data?.message || errorMsg;
      }
      toast.error(`회원가입 실패: ${errorMsg}`);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signupMutation.mutate({ email, password, nickname });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 glass p-12 rounded-2xl shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[var(--color-primary)] tracking-tight">
            회원가입
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            새로운 계정을 생성하고 서비스를 이용해보세요.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                required
                className="input-field"
                placeholder="example@cbnu.ac.kr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                className="input-field"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                required
                className="input-field"
                placeholder="닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full btn-primary flex justify-center items-center py-3"
            >
              {signupMutation.isPending ? <LoadingSpinner /> : "회원가입"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link
                to="/login"
                className="font-medium text-[var(--color-secondary)] hover:text-blue-500 transition-colors"
              >
                로그인하기
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;
