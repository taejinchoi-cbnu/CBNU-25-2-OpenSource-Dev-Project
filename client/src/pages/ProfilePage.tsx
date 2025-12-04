import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  useUserProfile,
  useUpdateProfile,
} from "../hooks/queries/useUserQueries";
import LoadingSpinner from "../components/LoadingSpinner";
import { AxiosError } from "axios";
import {
  UserIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";

function ProfilePage() {
  const { data: profile, isLoading, isError, error } = useUserProfile();
  const { mutate: updateNickname, isPending: isUpdating } = useUpdateProfile();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      toast.error("닉네임은 비워둘 수 없습니다.");
      return;
    }

    if (trimmedNickname === profile?.nickname) {
      toast.info("현재 닉네임과 동일합니다.");
      return;
    }

    updateNickname(
      { nickname: trimmedNickname },
      {
        onSuccess: () => {
          toast.success("닉네임이 성공적으로 변경되었습니다.");
          window.location.reload();
        },
        onError: (error: Error) => {
          let message = "닉네임 변경에 실패했습니다.";
          if (error instanceof AxiosError) {
            message = error.response?.data?.message || message;
          }
          toast.error(message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>오류가 발생했습니다: {(error as Error)?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
      {/* 헤더 섹션 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight flex items-center gap-3">
          <UserIcon className="w-8 h-8" />내 프로필
        </h1>
        <p className="mt-2 text-gray-600">
          개인 정보를 관리하고 활동 내역을 확인할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 프로필 정보 및 수정 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold text-[var(--color-primary)] border-b border-gray-100 pb-4">
              기본 정보
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <EnvelopeIcon className="w-4 h-4" />
                  이메일
                </label>
                <p className="text-gray-900 font-medium">{profile?.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <UserIcon className="w-4 h-4" />
                  닉네임
                </label>
                <form onSubmit={handleSubmit} className="mt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="새 닉네임"
                      disabled={isUpdating}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/20 focus:border-[var(--color-secondary)] transition-all text-sm"
                    />
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-3 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary)]/90 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
                    >
                      {isUpdating ? "..." : "변경"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* 활동 요약 카드 */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-[var(--color-primary)] border-b border-gray-100 pb-4 mb-4">
              활동 요약
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <DocumentTextIcon className="w-6 h-6 text-[var(--color-secondary)] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[var(--color-primary)]">
                  {profile?.posts?.length || 0}
                </div>
                <div className="text-xs text-gray-500">작성한 글</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-xl text-center">
                <ChatBubbleLeftEllipsisIcon className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-[var(--color-primary)]">
                  {profile?.comments?.length || 0}
                </div>
                <div className="text-xs text-gray-500">작성한 댓글</div>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽: 활동 내역 탭 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 작성한 게시글 */}
          <section>
            <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
              <PencilSquareIcon className="w-6 h-6" />
              최근 작성한 게시글
            </h2>
            <div className="glass rounded-2xl overflow-hidden shadow-sm">
              {profile?.posts && profile.posts.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {profile.posts.map((post) => (
                    <li
                      key={post.id}
                      className="group hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/board/posts/${post.id}`)
                      }
                    >
                      <div className="p-5 flex justify-between items-center">
                        <span className="text-gray-900 font-medium group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                          {post.title}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  작성한 게시글이 없습니다.
                </div>
              )}
            </div>
          </section>

          {/* 작성한 댓글 */}
          <section>
            <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
              <ChatBubbleLeftEllipsisIcon className="w-6 h-6" />
              최근 작성한 댓글
            </h2>
            <div className="glass rounded-2xl overflow-hidden shadow-sm">
              {profile?.comments && profile.comments.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {profile.comments.map((comment, index) => (
                    <li
                      key={index}
                      className="group hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/board/posts/${comment.postId}`)
                      }
                    >
                      <div className="p-5 space-y-2">
                        <div className="text-gray-900 font-medium group-hover:text-[var(--color-primary)] transition-colors">
                          {comment.content}
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <DocumentTextIcon className="w-3 h-3" />
                            원글: {comment.postTitle || "삭제된 게시글"}
                          </span>
                          <span>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  작성한 댓글이 없습니다.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
