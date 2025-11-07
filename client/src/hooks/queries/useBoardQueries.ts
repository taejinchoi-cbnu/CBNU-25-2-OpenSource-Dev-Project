import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardService } from "../../api/boardService";
import type { Pageable } from "../../types/common.types";
import type {
  PostCreateRequest,
  PostUpdateRequest,
  CommentCreateRequest,
  CommentUpdateRequest,
} from "../../types/board.types";

// Query Keys
const boardQueryKeys = {
  all: ["board"] as const,
  posts: (pageable: Pageable) => ["posts", pageable] as const,
  post: (postId: number) => ["post", postId] as const,
};

// 게시글 목록 조회
export const useGetPosts = (pageable: Pageable) => {
  return useQuery({
    queryKey: boardQueryKeys.posts(pageable),
    queryFn: () => boardService.getPosts(pageable),
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// 게시글 상세 정보 조회
export const useGetPost = (postId: number | undefined) => {
  return useQuery({
    queryKey: boardQueryKeys.post(postId!),
    queryFn: () => boardService.getPost(postId!),
    enabled: typeof postId === "number", // postId가 유효한 숫자인 경우에만 쿼리 실행
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// 게시글 생성
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PostCreateRequest) => boardService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// 게시글 수정
export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: number;
      data: PostUpdateRequest;
    }) => boardService.updatePost({ postId, data }),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: boardQueryKeys.post(postId) });
    },
  });
};

// 게시글 삭제
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: number) => boardService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// 댓글 생성
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: number;
      data: CommentCreateRequest;
    }) => boardService.createComment({ postId, data }),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: boardQueryKeys.post(postId) });
    },
  });
};

// 댓글 수정
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      commentId,
      data,
    }: {
      postId: number;
      commentId: number;
      data: CommentUpdateRequest;
    }) => boardService.updateComment({ postId, commentId, data }),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: boardQueryKeys.post(postId) });
    },
  });
};

// 댓글 삭제
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      postId,
      commentId,
    }: {
      postId: number;
      commentId: number;
    }) => boardService.deleteComment({ postId, commentId }),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: boardQueryKeys.post(postId) });
    },
  });
};
