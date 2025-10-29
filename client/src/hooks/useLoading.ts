import { useState, useCallback } from "react";

/**
 * Promise의 로딩 상태를 쉽게 관리할 수 있게 해주는 훅
 * @returns {[boolean, <T>(promise: Promise<T>) => Promise<T>]} [isLoading, startLoading]
 */
export const useLoading = <T>() => {
  // 로딩 상태 관리 state
  const [isLoading, setIsLoading] = useState(false);

  // 로딩 상태를 처리하는 콜백함수
  const startLoading = useCallback(async (promise: Promise<T>): Promise<T> => {
    try {
      setIsLoading(true);
      const result = await promise;
      return result;
    } finally {
      // 성공/실패 관계없이 로딩 상태 해제
      setIsLoading(false);
    }
  }, []);

  return [isLoading, startLoading];
};

export default useLoading;
