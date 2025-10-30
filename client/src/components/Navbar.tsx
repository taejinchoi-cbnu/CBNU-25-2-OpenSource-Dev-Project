import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { authService } from "../api/authService";
import { AxiosError } from "axios";

function Navbar() {
  const { accessToken, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth(); // Zustand 스토어에서 인증 상태 초기화
      navigate("/login"); // 로그아웃 후 로그인 페이지로 이동
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      let errorMessage = "다시 시도해주세요.";
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      alert("로그아웃 실패: " + errorMessage);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
      }}
    >
      <div>
        {accessToken ? (
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            style={{
              padding: "8px 15px",
              marginRight: "10px",
              cursor: "pointer",
              backgroundColor: logoutMutation.isPending ? "#ccc" : "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
          </button>
        ) : (
          <>
            <button
              onClick={handleLogin}
              style={{
                padding: "8px 15px",
                marginRight: "10px",
                cursor: "pointer",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              로그인
            </button>
            <button
              onClick={handleSignup}
              style={{
                padding: "8px 15px",
                cursor: "pointer",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
              }}
            >
              회원가입
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
