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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 기본은 읽기 전용 트랜잭션, 쓰기 메서드만 @Transactional으로 덮어씀
public class BoardService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final AuthUserRepository authUserRepository;

    @Transactional // 조회수 증가 때문에 쓰기 트랜잭션 필요
    public PostResponse getPostByPostId(Long postId) {
        // 게시글 조회, 없으면 PostNotFoundException 발생
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));

        // 조회수 증가 (TODO: 나중에 별도 로직으로 분리 예정)
        post.increaseViewCount();

        // 게시글에 달린 댓글들을 CommentResponse DTO로 변환
        List<CommentResponse> commentResponses = post.getComments().stream()
                .map(CommentResponse::new)
                .collect(Collectors.toList());

        // 게시글 정보를 PostResponse로 변환 후, 댓글 리스트를 세팅
        PostResponse response = new PostResponse(post);
        response.setComments(commentResponses);

        return response;
    }

    public Page<PostResponse> getPosts(Pageable pageable) { // 게시글 목록 조회
        return postRepository.findAllWithAuthor(pageable)
                .map(PostResponse::new);
    }

    // 게시글 생성
    @Transactional
    public PostResponse createPost(PostCreateRequest request) {
        // 현재 인증된 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID authorId = UUID.fromString(authentication.getName()); // getName()에 UUID 문자열이 들어있다고 가정

        // 작성자 유저 조회 (없으면 RuntimeException - 추후 커스텀 예외로 변경 고려)
        AuthUser author = authUserRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found"));

        // 새 게시글 엔티티 생성
        Post post = new Post();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setAuthor(author);

        // DB에 저장
        Post savedPost = postRepository.save(post);

        return new PostResponse(savedPost);
    }

    // 게시글 수정
    @Transactional
    public PostResponse updatePost(Long postId, PostUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID currentUserId = UUID.fromString(authentication.getName());

        // 수정할 게시글 조회
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));

        // 작성자와 현재 유저가 다르면 권한 없음
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new NoPermissionException("이 게시글을 수정할 권한이 없습니다.");
        }

        // 게시글 내용 수정
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());

        // 변경감지(dirty checking)에 의해 트랜잭션 커밋 시 자동 UPDATE
        return new PostResponse(post);
    }

    // 게시글 삭제
    @Transactional
    public void deletePost(Long postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID currentUserId = UUID.fromString(authentication.getName());

        // 삭제할 게시글 조회
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));

        // 작성자와 현재 유저가 다르면 권한 없음
        if (!post.getAuthor().getId().equals(currentUserId)) {
            throw new NoPermissionException("이 게시글을 삭제할 권한이 없습니다.");
        }

        // 게시글 삭제
        postRepository.deleteById(postId);
    }

    // 댓글 생성
    @Transactional
    public CommentResponse createComment(Long postId, CommentCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID authorId = UUID.fromString(authentication.getName());
        AuthUser author = authUserRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("Author not found"));

        // 댓글을 달 게시글 조회
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found with id: " + postId));

        // 새 댓글 엔티티 생성
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setContent(request.getContent());
        comment.setAuthor(author);

        Comment savedComment = commentRepository.save(comment);
        return new CommentResponse(savedComment);
    }

    // 댓글 수정
    @Transactional
    public CommentResponse updateComment(Long postId, Long commentId, CommentUpdateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID currentUserId = UUID.fromString(authentication.getName());

        // 수정할 댓글 조회
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found with id: " + commentId));

        // 작성자와 현재 유저가 다르면 권한 없음
        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new NoPermissionException("이 댓글을 수정할 권한이 없습니다.");
        }

        // 댓글 내용 수정
        comment.setContent(request.getContent());

        return new CommentResponse(comment);
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(Long postId, Long commentId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UUID currentUserId = UUID.fromString(authentication.getName());

        // 삭제할 댓글 조회
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException("Comment not found with id: " + commentId));

        // 작성자와 현재 유저가 다르면 권한 없음
        if (!comment.getAuthor().getId().equals(currentUserId)) {
            throw new NoPermissionException("이 댓글을 삭제할 권한이 없습니다.");
        }

        // 댓글 삭제
        commentRepository.deleteById(commentId);
    }
}
