// 게시글 목록의 각 아이템
export interface PostListItem {
  id: number;
  title: string;
  authorId: string;
  viewCount: number;
  createdAt: string;
}

// 게시글 상세 정보 응답
export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: string;
  authorNickname: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}

// 게시글 생성 요청
export interface PostCreateRequest {
  title: string;
  content: string;
}

// 게시글 수정 요청
export interface PostUpdateRequest {
  title: string;
  content: string;
}

// 댓글 응답
export interface Comment {
  id: number;
  content: string;
  authorId: string;
  authorNickname: string;
  postId: number;
  createdAt: string;
  updatedAt: string;
}

// 댓글 생성 요청
export interface CommentCreateRequest {
  content: string;
}

// 댓글 수정 요청
export interface CommentUpdateRequest {
  content: string;
}
