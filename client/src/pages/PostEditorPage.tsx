import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPost,
  useCreatePost,
  useUpdatePost,
} from "../hooks/queries/useBoardQueries";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-toastify";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

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

  if (isEditMode && isLoadingPost)
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  if (isEditMode && isErrorPost)
    return (
      <div className="text-center py-20 text-gray-500">
        게시글을 불러오는 데 실패했습니다.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-1" />
          뒤로 가기
        </button>
        <h1 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">
          {isEditMode ? "게시글 수정" : "새 게시글 작성"}
        </h1>
        <p className="mt-2 text-gray-600">
          {isEditMode
            ? "작성한 게시글의 내용을 수정합니다."
            : "자유롭게 이야기를 나누고 정보를 공유해보세요."}
        </p>
      </div>

      <div className="glass rounded-2xl p-8 sm:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              제목
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input-field text-lg py-3"
              placeholder="제목을 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="input-field min-h-[400px] resize-none py-4 leading-relaxed"
              placeholder="내용을 입력하세요"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary)]/90 transition-all shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>저장 중...</span>
                </div>
              ) : isEditMode ? (
                "수정하기"
              ) : (
                "작성하기"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostEditorPage;
