package com.example.server.board.service;

import com.example.server.auth.entity.AuthUser;
import com.example.server.auth.repository.AuthUserRepository;
import com.example.server.board.dto.CommentCreateRequest;
import com.example.server.board.dto.CommentResponse;
import com.example.server.board.dto.CommentUpdateRequest;
import com.example.server.board.dto.PostCreateRequest;
import com.example.server.board.dto.PostResponse;
import com.example.server.board.dto.PostUpdateRequest;
import com.example.server.board.entity.Comment;
import com.example.server.board.entity.Post;
import com.example.server.board.exception.CommentNotFoundException;
import com.example.server.board.exception.NoPermissionException;
import com.example.server.board.exception.PostNotFoundException;
import com.example.server.board.repository.CommentRepository;
import com.example.server.board.repository.PostRepository;
import com.example.server.global.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final AuthUserRepository authUserRepository;

    @Transactional
    public PostResponse getPostByPostId(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));
        // TODO: 동시성 문제를 해결하기 위해 추후 Redis나 Atomic Update 쿼리로 개선해야함
        post.increaseViewCount();

        List<CommentResponse> commentResponses = post.getComments().stream()
                .map(CommentResponse::new)
                .collect(Collectors.toList());

        PostResponse response = new PostResponse(post);
        response.setComments(commentResponses);

        return response;
    }

    public Page<PostResponse> getPosts(Pageable pageable) {
        return postRepository.findAllWithAuthor(pageable).map(PostResponse::new);
    }

    @Transactional
    public PostResponse createPost(PostCreateRequest request) {
        UUID authorId = SecurityUtil.getCurrentUserId();
        AuthUser author = authUserRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found"));

        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setAuthor(author);
        Post savedPost = postRepository.save(post);
        return new PostResponse(savedPost);
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostUpdateRequest request) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));

        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new NoPermissionException("이 게시글을 수정할 권한이 없습니다.");
        }

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        return new PostResponse(post);
    }

    @Transactional
    public void deletePost(Long postId) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));

        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new NoPermissionException("이 게시글을 삭제할 권한이 없습니다.");
        }

        postRepository.deleteById(postId);
    }

    // ================= Comment ===================

    @Transactional
    public CommentResponse createComment(Long postId, CommentCreateRequest request) {
        UUID authorId = SecurityUtil.getCurrentUserId();
        AuthUser author = authUserRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setContent(request.getContent());
        comment.setAuthor(author);
        Comment savedComment = commentRepository.save(comment);
        return new CommentResponse(savedComment);
    }

    @Transactional
    public CommentResponse updateComment(Long postId, Long commentId, CommentUpdateRequest request) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new NoPermissionException("이 댓글을 수정할 권한이 없습니다.");
        }

        comment.setContent(request.getContent());
        return new CommentResponse(comment);
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId) {
        UUID currentUserId = SecurityUtil.getCurrentUserId();

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new NoPermissionException("이 댓글을 삭제할 권한이 없습니다.");
        }

        commentRepository.deleteById(commentId);
    }
}
