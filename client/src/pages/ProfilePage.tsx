import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  useUserProfile,
  useUpdateProfile,
} from "../hooks/queries/useUserQueries";
import LoadingSpinner from "../components/LoadingSpinner";
import { AxiosError } from "axios";
import { SsgoiTransition } from "@ssgoi/react";

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

    // 공백 입력 방지 추가
    if (!trimmedNickname) {
      toast.error("닉네임은 비워둘 수 없습니다.");
      return;
    }

    // 같은 닉네임 변경 방지 추가
    if (trimmedNickname === profile?.nickname) {
      toast.info("현재 닉네임과 동일합니다.");
      return;
    }

    updateNickname(
      { nickname: trimmedNickname },
      {
        onSuccess: () => {
          toast.success("닉네임이 성공적으로 변경되었습니다.");
          // 성공 시 브라우저 새로고침으로 상태 반영
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
    return <LoadingSpinner />;
  }

  if (isError) {
    return <p>오류가 발생했습니다: {(error as Error)?.message}</p>;
  }

  return (
    <SsgoiTransition id="/profile">
      <div>
        <h1>프로필</h1>

        <section>
          <h2>기본 정보</h2>
          <p>
            <strong>이메일:</strong> {profile?.email}
          </p>
          <p>
            <strong>현재 닉네임:</strong> {profile?.nickname}
          </p>
        </section>

        <section>
          <h2>닉네임 변경</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="새 닉네임"
              disabled={isUpdating}
            />
            <button type="submit" disabled={isUpdating}>
              {isUpdating ? "변경 중..." : "변경하기"}
            </button>
          </form>
        </section>
        {/* JSON raw로 보여주는거 정제하기 ex) postId로 게시글 이름 가져와서 댓글과 매핑해서 보여주기 */}
        <section>
          <h2>작성한 게시글 ({profile?.posts?.length || 0}개)</h2>
          <pre>{JSON.stringify(profile?.posts, null, 2)}</pre>
        </section>

        <section>
          <h2>작성한 댓글 ({profile?.comments?.length || 0}개)</h2>
          <pre>{JSON.stringify(profile?.comments, null, 2)}</pre>
        </section>
      </div>
    </SsgoiTransition>
  );
}

export default ProfilePage;
