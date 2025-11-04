package com.example.server.board;

import com.example.server.board.dto.*;
import com.example.server.board.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
@Tag(name = "Board Controller", description = "게시글 및 댓글 관련 API 컨트롤러")
public class BoardController {

    private final BoardService boardService;

    @Operation(summary = "새 게시글 생성", description = "새로운 게시글을 생성합니다.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "게시글 생성 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
                    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
                    @ApiResponse(responseCode = "500", description = "서버 내부 오류")
            })
    @PostMapping("/posts")
    public ResponseEntity<PostResponse> createPost(
            @Parameter(description = "게시글 생성 요청 DTO", required = true) @Valid @RequestBody PostCreateRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal UUID userId
    ) {
        PostResponse response = boardService.createPost(request, userId);
        return ResponseEntity.created(URI.create("/api/board/posts/" + response.getId())).body(response);
    }

    @Operation(summary = "모든 게시글 조회", description = "페이지네이션을 적용하여 모든 게시글 목록을 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "게시글 목록 조회 성공"),
                    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
                    @ApiResponse(responseCode = "500", description = "서버 내부 오류")
            })
    @GetMapping("/posts")
    public ResponseEntity<Page<PostListResponse>> getPosts(
            @Parameter(description = "페이지네이션 및 정렬 정보") @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<PostListResponse> responses = boardService.getPosts(pageable);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "특정 게시글 조회", description = "ID를 통해 특정 게시글의 상세 정보를 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "게시글 조회 성공"),
                    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
                    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음"),
                    @ApiResponse(responseCode = "500", description = "서버 내부 오류")
            })
    @GetMapping("/posts/{postId}")
    public ResponseEntity<PostResponse> getPost(
            @Parameter(description = "조회할 게시글 ID", required = true) @PathVariable Long postId
    ) {
        PostResponse response = boardService.getPost(postId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "게시글 수정", description = "ID를 통해 특정 게시글의 제목과 내용을 수정합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "게시글 수정 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
                    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
                    @ApiResponse(responseCode = "403", description = "수정 권한 없음"),
                    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음"),
                    @ApiResponse(responseCode = "500", description = "서버 내부 오류")
            })
    @PutMapping("/posts/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            @Parameter(description = "수정할 게시글 ID", required = true) @PathVariable Long postId,
            @Parameter(description = "게시글 수정 요청 DTO", required = true) @Valid @RequestBody PostUpdateRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal UUID userId
    ) {
        PostResponse response = boardService.updatePost(postId, request, userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "게시글 삭제", description = "ID를 통해 특정 게시글을 삭제합니다.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "게시글 삭제 성공"),
                    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
                    @ApiResponse(responseCode = "403", description = "삭제 권한 없음"),
                    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음"),
                    @ApiResponse(responseCode = "500", description = "서버 내부 오류")
            })
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(
            @Parameter(description = "삭제할 게시글 ID", required = true) @PathVariable Long postId,
            @Parameter(hidden = true) @AuthenticationPrincipal UUID userId
    ) {
        boardService.deletePost(postId, userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "새 댓글 생성", description = "특정 게시글에 새로운 댓글을 생성합니다.",
            responses = {
                    @ApiResponse(responseCode = "201", description = "댓글 생성 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
                    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
                    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음"),
                    @ApiResponse(responseCode = "500", description = "서버 내부 오류")
            })
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @Parameter(description = "댓글을 생성할 게시글 ID", required = true) @PathVariable Long postId,
            @Parameter(description = "댓글 생성 요청 DTO", required = true) @Valid @RequestBody CommentCreateRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal UUID userId
    ) {
        CommentResponse response = boardService.createComment(postId, request, userId);
        return ResponseEntity.created(URI.create("/api/board/posts/" + postId + "/comments/" + response.getId())).body(response);
    }

    @Operation(summary = "특정 게시글의 댓글 조회", description = "특정 게시글에 달린 모든 댓글 목록을 페이지네이션하여 조회합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "댓글 목록 조회 성공"),
                    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
                    @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음"),
                    @ApiResponse(responseCode = "500", description = "서버 내부 오류")
            })
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<Page<CommentResponse>> getComments(
            @Parameter(description = "댓글을 조회할 게시글 ID", required = true) @PathVariable Long postId,
            @Parameter(description = "페이지네이션 및 정렬 정보") @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        Page<CommentResponse> responses = boardService.getCommentsByPostId(postId, pageable);
        return ResponseEntity.ok(responses);
    }

    @Operation(summary = "댓글 수정", description = "특정 댓글의 내용을 수정합니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "댓글 수정 성공"),
                    @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
                    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
                    @ApiResponse(responseCode = "403", description = "수정 권한 없음"),
                    @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음"),
                    @ApiResponse(responseCode = "500", description = "서버 내부 오류")
            })
    @PutMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @Parameter(description = "게시글 ID (경로 일관성을 위해 포함)", required = true) @PathVariable Long postId,
            @Parameter(description = "수정할 댓글 ID", required = true) @PathVariable Long commentId,
            @Parameter(description = "댓글 수정 요청 DTO", required = true) @Valid @RequestBody CommentUpdateRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal UUID userId
    ) {
        CommentResponse response = boardService.updateComment(commentId, request, userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "댓글 삭제", description = "특정 댓글을 삭제합니다.",
            responses = {
                    @ApiResponse(responseCode = "204", description = "댓글 삭제 성공"),
                    @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
                    @ApiResponse(responseCode = "403", description = "삭제 권한 없음"),
                    @ApiResponse(responseCode = "404", description = "댓글을 찾을 수 없음"),
                    @ApiResponse(responseCode = "500", description = "서버 내부 오류")
            })
    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @Parameter(description = "게시글 ID (경로 일관성을 위해 포함)", required = true) @PathVariable Long postId,
            @Parameter(description = "삭제할 댓글 ID", required = true) @PathVariable Long commentId,
            @Parameter(hidden = true) @AuthenticationPrincipal UUID userId
    ) {
        boardService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
