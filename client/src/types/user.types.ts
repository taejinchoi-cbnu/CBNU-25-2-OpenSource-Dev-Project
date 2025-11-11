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
  createdAt: string;
}

// 사용자 정보 업데이트는 닉네임만 가능하게!
export interface ProfileUpdateRequest {
  nickname: string;
}
