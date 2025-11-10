import React, { useState, useEffect } from "react";
import {
  useUserProfile,
  useUpdateProfile,
} from "../hooks/queries/useUserQueries";
import LoadingSpinner from "../components/LoadingSpinner";

function ProfilePage() {
  const { data: profile, isLoading, isError, error } = useUserProfile();
  const { mutate: updateNickname } = useUpdateProfile();
  const [nickname, setNickname] = useState("");

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nickname.trim()) {
      updateNickname({ nickname });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return <p>오류가 발생했습니다: {(error as Error)?.message}</p>;
  }

  return (
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
          />
          <button type="submit">변경하기</button>
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
  );
}

export default ProfilePage;
