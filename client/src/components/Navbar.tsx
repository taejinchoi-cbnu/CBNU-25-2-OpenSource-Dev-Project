import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { authService } from "../api/authService";
import { AxiosError } from "axios";
import { toast } from "react-toastify";

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
      console.error("로그아웃 실패:", error);
      let errorMsg = "다시 시도해주세요";
      if (error instanceof AxiosError) {
        errorMsg = error.response?.data?.message || errorMsg;
      }
      toast.error(`로그아웃 실패: ${errorMsg}`);
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

  const handleHome = () => {
    navigate("/");
  };

  const handleBoard = () => {
    navigate("/board");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: "1px solid #ccc",
      }}
    >
      <div>
        <button
          onClick={handleHome}
          style={{
            padding: "8px 15px",
            marginRight: "10px",
            cursor: "pointer",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          홈
        </button>
        <button
          onClick={handleBoard}
          style={{
            padding: "8px 15px",
            marginRight: "10px",
            cursor: "pointer",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          게시판
        </button>
      </div>
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
