// 사용자 정보
export interface UserProfile {
  email: string;
  nickname: string;
  posts: UserPostSummary[];
  comments: UserCommentSummary[];
}

// 게시글 요약
export interface UserPostSummary {
  id: number;
  title: string;
  createdAt: string;
}

// 댓글 요약
export interface UserCommentSummary {
  postId: number;
  content: string;
  postTitle: string;
  createdAt: string;
}

// 사용자 정보 업데이트 (닉네임만 가능)
export interface ProfileUpdateRequest {
  nickname: string;
}
