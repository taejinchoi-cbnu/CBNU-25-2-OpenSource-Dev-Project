import { useParams, useNavigate } from "react-router-dom";
import {
  useGetPost,
  useDeletePost,
  useCreateComment,
} from "../hooks/queries/useBoardQueries";
import { useState } from "react";
import { toast } from "react-toastify";
import { SsgoiTransition } from "@ssgoi/react";

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
        onError: (error) => {
          console.error("게시글 삭제 실패:", error);
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
        onError: (error) => {
          console.error("댓글 작성 실패:", error);
          toast.error("댓글 작성에 실패했습니다.");
        },
      }
    );
  };

  if (postQuery.isLoading) return <div>로딩 중...</div>;
  if (postQuery.isError) return <div>오류가 발생했습니다.</div>;

  const post = postQuery.data;
  if (!post) return <div>게시글을 찾을 수 없습니다.</div>;

  return (
    <SsgoiTransition id="/board/:postId">
      <div className="post-detail-container">
        <div className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span>작성자: {post.authorNickname}</span>
            <span>작성일: {new Date(post.createdAt).toLocaleString()}</span>
            <span>조회수: {post.viewCount}</span>
          </div>
        </div>

        <div className="post-content">
          <p>{post.content}</p>
        </div>

        <div className="post-actions">
          <button onClick={() => navigate("/board")} className="btn-list">
            목록
          </button>
          <button
            onClick={() => navigate(`/board/edit/${post.id}`)}
            className="btn-edit"
          >
            수정
          </button>
          <button onClick={handleDelete} className="btn-delete">
            삭제
          </button>
        </div>

        <div className="comments-section">
          <h2>댓글</h2>
          <div className="comment-list">
            {post.comments?.map((comment) => (
              <div key={comment.id} className="comment-item">
                <p className="comment-author">{comment.authorNickname}</p>
                <p className="comment-content">{comment.content}</p>
                <p className="comment-date">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="댓글을 입력하세요"
              rows={3}
            />
            <button type="submit" disabled={createCommentMutation.isPending}>
              {createCommentMutation.isPending ? "등록 중..." : "댓글 등록"}
            </button>
          </form>
        </div>
      </div>
    </SsgoiTransition>
  );
};

export default PostDetailPage;
