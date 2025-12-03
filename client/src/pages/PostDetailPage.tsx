import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPost,
  useDeletePost,
  useCreateComment,
} from "../hooks/queries/useBoardQueries";
import { useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  UserIcon,
  CalendarDaysIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const PostDetailPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const numericPostId = Number(postId);

  const [comment, setComment] = useState("");

  const postQuery = useGetPost(numericPostId);
  const deletePostMutation = useDeletePost();
  const createCommentMutation = useCreateComment();

  const handleDelete = () => {
    if (window.confirm("정말 이 게시글을 삭제하시겠습니까?")) {
      deletePostMutation.mutate(numericPostId, {
        onSuccess: () => {
          toast.info("게시글이 삭제되었습니다.");
          navigate("/board");
        },
        onError: () => {
          toast.error("게시글 삭제에 실패했습니다.");
        },
      });
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warn("댓글 내용을 입력해주세요.");
      return;
    }
    createCommentMutation.mutate(
      { postId: numericPostId, data: { content: comment } },
      {
        onSuccess: () => {
          setComment("");
          toast.success("댓글이 성공적으로 등록되었습니다.");
        },
        onError: () => {
          toast.error("댓글 작성에 실패했습니다.");
        },
      }
    );
  };

  if (postQuery.isLoading)
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  if (postQuery.isError)
    return (
      <div className="text-center py-20 text-gray-500">
        오류가 발생했습니다.
      </div>
    );

  const post = postQuery.data;
  if (!post)
    return (
      <div className="text-center py-20 text-gray-500">
        게시글을 찾을 수 없습니다.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
      <div className="mb-8">
        <button
          onClick={() => navigate("/board")}
          className="flex items-center text-gray-500 hover:text-[var(--color-primary)] mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          목록으로 돌아가기
        </button>
        <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-b border-gray-200 pb-6">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            <span className="font-medium text-gray-700">
              {post.authorNickname}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeIcon className="w-4 h-4" />
            <span>조회 {post.viewCount}</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-8 sm:p-10 mb-10 min-h-[300px] shadow-sm">
        <div className="prose max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </div>

      <div className="flex justify-end gap-3 mb-12">
        <button
          onClick={() => navigate(`/board/edit/${post.id}`)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] rounded-xl transition-all shadow-sm"
        >
          <PencilSquareIcon className="w-4 h-4" />
          수정
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-red-600 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm"
        >
          <TrashIcon className="w-4 h-4" />
          삭제
        </button>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-[var(--color-primary)]" />
          <h2 className="text-xl font-bold text-gray-900">
            댓글{" "}
            <span className="text-[var(--color-primary)]">
              {post.comments?.length || 0}
            </span>
          </h2>
        </div>

        <div className="space-y-6 mb-8">
          {post.comments?.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              첫 번째 댓글을 남겨보세요!
            </p>
          ) : (
            post.comments?.map((comment) => (
              <div
                key={comment.id}
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-800">
                    {comment.authorNickname}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleCommentSubmit} className="relative">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows={3}
            className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all resize-none bg-white"
          />
          <div className="absolute bottom-3 right-3">
            <button
              type="submit"
              disabled={createCommentMutation.isPending}
              className="px-4 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50"
            >
              {createCommentMutation.isPending ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostDetailPage;
