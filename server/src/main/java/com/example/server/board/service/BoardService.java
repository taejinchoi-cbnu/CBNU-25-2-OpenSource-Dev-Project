package com.example.server.board.service;

import com.example.server.board.dto.*;
import com.example.server.board.entity.Comment;
import com.example.server.board.entity.Post;
import com.example.server.board.exception.CommentNotFoundException;
import com.example.server.board.exception.NoPermissionException;
import com.example.server.board.exception.PostNotFoundException;
import com.example.server.board.repository.CommentRepository;
import com.example.server.board.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class BoardService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Transactional
    public PostResponse createPost(PostCreateRequest request, UUID authorId) {
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setAuthorId(authorId);

        Post savedPost = postRepository.save(post);
        return new PostResponse(savedPost);
    }

    public Page<PostListResponse> getPosts(Pageable pageable) {
        return postRepository.findAll(pageable)
                .map(PostListResponse::new);
    }

    @Transactional
    public PostResponse getPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("해당 ID의 게시글을 찾을 수 없습니다: " + postId));

        post.setViewCount(post.getViewCount() + 1);
        return new PostResponse(post);
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostUpdateRequest request, UUID currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("해당 ID의 게시글을 찾을 수 없습니다: " + postId));

        if (!post.getAuthorId().equals(currentUserId)) {
            throw new NoPermissionException("이 게시글을 수정할 권한이 없습니다.");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        return new PostResponse(post);
    }

    @Transactional
    public void deletePost(Long postId, UUID currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("해당 ID의 게시글을 찾을 수 없습니다: " + postId));

        if (!post.getAuthorId().equals(currentUserId)) {
            throw new NoPermissionException("이 게시글을 삭제할 권한이 없습니다.");
        }

        postRepository.delete(post);
    }

    @Transactional
    public CommentResponse createComment(Long postId, CommentCreateRequest request, UUID authorId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("댓글을 작성할 게시글을 찾을 수 없습니다: " + postId));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setAuthorId(authorId);
        comment.setPost(post);

        Comment savedComment = commentRepository.save(comment);
        return new CommentResponse(savedComment);
    }

    public Page<CommentResponse> getCommentsByPostId(Long postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new PostNotFoundException("댓글을 조회할 게시글을 찾을 수 없습니다: " + postId);
        }
        return commentRepository.findByPostId(postId, pageable)
                .map(CommentResponse::new);
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, CommentUpdateRequest request, UUID currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("해당 ID의 댓글을 찾을 수 없습니다: " + commentId));

        if (!comment.getAuthorId().equals(currentUserId)) {
            throw new NoPermissionException("이 댓글을 수정할 권한이 없습니다.");
        }

        comment.setContent(request.getContent());
        return new CommentResponse(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, UUID currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("해당 ID의 댓글을 찾을 수 없습니다: " + commentId));

        if (!comment.getAuthorId().equals(currentUserId)) {
            throw new NoPermissionException("이 댓글을 삭제할 권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }
}
