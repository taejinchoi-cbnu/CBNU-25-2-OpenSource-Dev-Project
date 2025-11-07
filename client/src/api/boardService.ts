import { apiClient } from "./client";
import type { Page, Pageable } from "../types/common.types";
import type {
  Post,
  PostCreateRequest,
  PostUpdateRequest,
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
} from "../types/board.types";

const boardService = {
  // 게시글 목록 조회
  getPosts: async (pageable: Pageable): Promise<Page<Post>> => {
    const { page, size, sort } = pageable;
    const response = await apiClient.get("/board/posts", {
      params: { page, size, sort },
    });
    return response.data;
  },

  // 게시글 상세 정보 조회
  getPost: async (postId: number): Promise<Post> => {
    const response = await apiClient.get(`/board/posts/${postId}`);
    return response.data;
  },

  // 게시글 생성
  createPost: async (data: PostCreateRequest): Promise<Post> => {
    const response = await apiClient.post("/board/posts", data);
    return response.data;
  },

  // 게시글 수정
  updatePost: async ({
    postId,
    data,
  }: {
    postId: number;
    data: PostUpdateRequest;
  }): Promise<Post> => {
    const response = await apiClient.put(`/board/posts/${postId}`, data);
    return response.data;
  },

  // 게시글 삭제
  deletePost: async (postId: number): Promise<void> => {
    await apiClient.delete(`/board/posts/${postId}`);
  },

  // 댓글 생성
  createComment: async ({
    postId,
    data,
  }: {
    postId: number;
    data: CommentCreateRequest;
  }): Promise<Comment> => {
    const response = await apiClient.post(
      `/board/posts/${postId}/comments`,
      data
    );
    return response.data;
  },

  // 댓글 수정
  updateComment: async ({
    postId,
    commentId,
    data,
  }: {
    postId: number;
    commentId: number;
    data: CommentUpdateRequest;
  }): Promise<Comment> => {
    const response = await apiClient.put(
      `/board/posts/${postId}/comments/${commentId}`,
      data
    );
    return response.data;
  },

  // 댓글 삭제
  deleteComment: async ({
    postId,
    commentId,
  }: {
    postId: number;
    commentId: number;
  }): Promise<void> => {
    await apiClient.delete(`/board/posts/${postId}/comments/${commentId}`);
  },
};

export { boardService };
