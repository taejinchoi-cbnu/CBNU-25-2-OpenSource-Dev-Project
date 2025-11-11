import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetPosts } from "../hooks/queries/useBoardQueries";
import type { Pageable } from "../types/common.types";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";

const BoardPage = () => {
  const [pageable, setPageable] = useState<Pageable>({
    page: 0,
    size: 10,
    sort: "createdAt,desc",
  });
  const { data: postsPage, isLoading, isError, error } = useGetPosts(pageable);
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isError) {
      // TODO: 403 이면 비로그인 상태라 이거 처리해야함
      toast.error(`게시글 목록을 불러오는 데 실패했습니다: ${error.message}`);
    }
  }, [isError, error]);

  const handlePageChange = (newPage: number) => {
    setPageable((prev) => ({ ...prev, page: newPage }));
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>게시판</h1>
        {accessToken && (
          <button onClick={() => navigate("/board/new")}>글쓰기</button>
        )}
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {postsPage?.content.map((post) => (
          <li
            key={post.id}
            style={{ padding: "10px", borderBottom: "1px solid #ccc" }}
          >
            <Link
              to={`/board/${post.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <h3 style={{ margin: 0 }}>{post.title}</h3>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9em",
                  color: "#666",
                }}
              >
                <span>조회수: {post.viewCount}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {postsPage && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <button
            onClick={() => handlePageChange(pageable.page - 1)}
            disabled={postsPage.number <= 0}
          >
            이전
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {postsPage.number + 1} of {postsPage.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pageable.page + 1)}
            disabled={postsPage.number >= postsPage.totalPages - 1}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
