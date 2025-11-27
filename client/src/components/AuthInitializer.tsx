import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authService } from "../api/authService";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "./LoadingSpinner";
import { AxiosError } from "axios";

interface AuthInitializerProps {
  children: React.ReactNode;
}

function AuthInitializer({ children }: AuthInitializerProps) {
  const { setUserToken, clearAuth, setLoading } = useAuthStore();

  const { isPending, isError, data, error } = useQuery({
    queryKey: ["silentRefresh"],
    queryFn: authService.refresh,
    staleTime: Infinity,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          return false;
        }
      }
      return failureCount < 2;
    },
    enabled: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isPending) {
      // 쿼리가 더 이상 pending 상태가 아닐 때
      if (isError) {
        clearAuth();
      } else if (data) {
        setUserToken(data);
      }
      setLoading(false); // 전역 로딩 상태를 false로 설정
    }
  }, [isPending, isError, data, error, setUserToken, clearAuth, setLoading]);

  // Zustand의 전역 isLoading 상태를 사용하여 앱이 준비되었는지 확인
  const globalIsLoading = useAuthStore((state) => state.isLoading);

  if (globalIsLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthInitializer;
