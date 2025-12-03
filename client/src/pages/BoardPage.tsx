import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetPosts } from "../hooks/queries/useBoardQueries";
import type { Pageable } from "../types/common.types";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";
import {
  LockClosedIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

const BoardPage = () => {
  const [pageable, setPageable] = useState<Pageable>({
    page: 0,
    size: 10,
    sort: "createdAt,desc",
  });
  const { data: postsPage, isLoading, isError, error } = useGetPosts(pageable);
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  const isForbidden = isError && error?.message?.includes("403");

  useEffect(() => {
    if (isError && !isForbidden) {
      toast.error(`게시글 목록을 불러오는 데 실패했습니다: ${error.message}`);
    }
  }, [isError, isForbidden, error]);

  const handlePageChange = (newPage: number) => {
    if (!postsPage) return;
    if (newPage < 0) return;
    if (newPage >= postsPage.totalPages) return;
    setPageable((prev) => ({ ...prev, page: newPage }));
  };

  const handleJumpForward = () => {
    if (!postsPage) return;
    const newPage = Math.min(postsPage.totalPages - 1, pageable.page + 10);
    setPageable((prev) => ({ ...prev, page: newPage }));
  };

  const handleJumpBackward = () => {
    const newPage = Math.max(0, pageable.page - 10);
    setPageable((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading)
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );

  // 비로그인 사용자 접근 제한 UI
  if (isForbidden || (isError && !accessToken)) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="glass p-12 rounded-2xl text-center max-w-md w-full space-y-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <LockClosedIcon className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-2">
              로그인이 필요한 서비스입니다
            </h2>
            <p className="text-gray-600">
              게시판을 이용하시려면 로그인을 해주세요.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-4">
            <Link
              to="/login"
              className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary)]/90 transition-colors font-medium shadow-sm"
            >
              로그인
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 bg-white text-[var(--color-primary)] border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderPagination = () => {
    if (!postsPage || postsPage.totalPages === 0) return null;

    const totalPages = postsPage.totalPages;
    const currentPage = pageable.page;

    // 표시할 페이지 번호 범위 계산
    let startPage = Math.max(0, currentPage - 2);
    const endPage = Math.min(startPage + 4, totalPages - 1);

    // 끝 페이지가 부족하면 앞쪽을 더 채움
    if (endPage - startPage < 4) {
      startPage = Math.max(0, endPage - 4);
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* 10페이지 뒤로 점프 (첫 페이지가 아닐 때만 표시) */}
        {startPage > 0 && (
          <button
            onClick={handleJumpBackward}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            title="-10 pages"
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        )}

        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl font-medium transition-all ${
              currentPage === pageNum
                ? "bg-[var(--color-primary)] text-white shadow-md scale-105"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {pageNum + 1}
          </button>
        ))}

        {/* 10페이지 앞으로 점프 (마지막 페이지가 아닐 때만 표시) */}
        {endPage < totalPages - 1 && (
          <button
            onClick={handleJumpForward}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
            title="+10 pages"
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold text-[var(--color-primary)] tracking-tight">
            게시판
          </h1>
          <p className="mt-2 text-xl text-gray-600">
            자유롭게 이야기를 나누고 정보를 공유해보세요.
          </p>
        </div>
        {accessToken && (
          <button
            onClick={() => navigate("/board/new")}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary)]/90 transition-all shadow-sm hover:shadow-md text-lg"
          >
            <PencilSquareIcon className="w-5 h-5" />
            <span>글쓰기</span>
          </button>
        )}
      </div>

      <div className="glass rounded-2xl overflow-hidden shadow-sm min-h-[600px]">
        {postsPage?.content.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>등록된 게시글이 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {postsPage?.content.map((post) => (
              <li
                key={post.id}
                className="group hover:bg-blue-50/50 transition-colors duration-200"
              >
                <Link to={`/board/${post.id}`} className="block p-8">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                      {post.title}
                    </h3>
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-lg whitespace-nowrap ml-4">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-base text-gray-500 mt-4">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <span className="font-medium text-gray-700">
                          {post.authorNickname || "익명"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="bg-gray-100 px-2 py-1 rounded-md">
                        조회 {post.viewCount}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {renderPagination()}
    </div>
  );
};

export default BoardPage;
