import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPost,
  useCreatePost,
  useUpdatePost,
} from "../hooks/queries/useBoardQueries";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";
import { SsgoiTransition } from "@ssgoi/react";

const PostEditorPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!postId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // postId가 number 타입이어야 하므로 변환
  const numericPostId = postId ? Number(postId) : undefined;

  // 수정 모드일 때만 데이터 조회
  const {
    data: post,
    isLoading: isLoadingPost,
    isError: isErrorPost,
  } = useGetPost(numericPostId);

  const { mutate: createPost, isPending: isCreating } = useCreatePost();
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost();

  // 사용자가 URL 변경하는 경우 에러 핸들링 추가
  // 수정 모드 데이터 로딩이 완료되면 폼에 값을 채우고, 생성 모드로 전환될 경우 폼을 초기화
  useEffect(() => {
    if (isEditMode && post) {
      setTitle(post.title);
      setContent(post.content);
    } else if (!isEditMode) {
      setTitle("");
      setContent("");
    }
  }, [isEditMode, post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && numericPostId) {
      updatePost(
        { postId: numericPostId, data: { title, content } },
        {
          onSuccess: (updatedPost) => {
            toast.success("게시글이 성공적으로 수정되었습니다.");
            navigate(`/board/${updatedPost.id}`);
          },
          onError: () => {
            toast.error("게시글 수정에 실패했습니다.");
          },
        }
      );
    } else {
      createPost(
        { title, content },
        {
          onSuccess: (newPost) => {
            toast.success("게시글이 성공적으로 작성되었습니다.");
            navigate(`/board/${newPost.id}`);
          },
          onError: () => {
            toast.error("게시글 작성에 실패했습니다.");
          },
        }
      );
    }
  };

  if (isEditMode && isLoadingPost) return <LoadingSpinner />;
  if (isEditMode && isErrorPost)
    return <div>게시글을 불러오는 데 실패했습니다.</div>;

  return (
    <SsgoiTransition id="/board/editor">
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h2>{isEditMode ? "게시글 수정" : "새 게시글 작성"}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="title"
              style={{ display: "block", marginBottom: "5px" }}
            >
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label
              htmlFor="content"
              style={{ display: "block", marginBottom: "5px" }}
            >
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", minHeight: "300px" }}
            />
          </div>
          <button type="submit" disabled={isCreating || isUpdating}>
            {isCreating || isUpdating
              ? "저장 중..."
              : isEditMode
                ? "수정하기"
                : "작성하기"}
          </button>
        </form>
      </div>
    </SsgoiTransition>
  );
};

export default PostEditorPage;
