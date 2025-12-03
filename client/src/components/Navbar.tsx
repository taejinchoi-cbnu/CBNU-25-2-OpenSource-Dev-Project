import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authService } from "../api/authService";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import logo from "../assets/logo.png";

function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      toast.success("로그아웃되었습니다.");
      navigate("/");
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(
          `로그아웃 실패: ${error.response?.data?.message || "오류가 발생했습니다."}`
        );
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-21 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-9">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={logo} alt="Logo" className="w-15 h-15 object-contain" />
              <span className="text-2xl font-bold text-[var(--color-primary)] tracking-tight group-hover:text-[var(--color-secondary)] transition-colors">
                What&apos;s Your GPA
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              <Link
                to="/"
                className="text-xl text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-light transition-colors"
              >
                홈
              </Link>
              <Link
                to="/grades/analyze"
                className="text-xl text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-light transition-colors"
              >
                성적표 분석
              </Link>
              <Link
                to="/board"
                className="text-xl text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-light transition-colors"
              >
                게시판
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="text-xl text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-light transition-colors"
                >
                  프로필
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-xl text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-light transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-lg text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-medium transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/signup"
                  className="text-lg text-[var(--color-primary)] hover:text-[var(--color-secondary)] font-medium transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
