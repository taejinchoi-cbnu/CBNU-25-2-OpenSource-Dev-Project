# Feature Specification: Community Board

**Feature Branch**: `feature/board` (Completed)
**Status**: Implemented

## User Scenarios & Testing

### User Story 1 - View Posts (Priority: P1)
As a user, I want to view a list of posts so that I can see what others are discussing.

**Acceptance Scenarios**:
1. **Given** the board page, **When** it loads, **Then** a list of posts is displayed with pagination.
2. **Given** a specific post, **When** clicked, **Then** the post details are shown.

### User Story 2 - Create Post (Priority: P1)
As a logged-in user, I want to write a post so that I can share my thoughts.

**Acceptance Scenarios**:
1. **Given** a logged-in user, **When** they submit a post title and content, **Then** the post is saved and appears in the list.
2. **Given** an anonymous user, **When** they try to write, **Then** they are redirected to login.

### User Story 3 - Commenting (Priority: P2)
As a user, I want to comment on posts to interact with others.

**Acceptance Scenarios**:
1. **Given** a post, **When** a user submits a comment, **Then** it is appended to the post's comment list.

## Requirements

### Functional Requirements
- **FR-001**: Users MUST be able to Create, Read, Update, and Delete (CRUD) their own posts.
- **FR-002**: Users MUST be able to CRUD their own comments on posts.
- **FR-003**: Pagination MUST be supported for post lists.
- **FR-004**: Authentication is REQUIRED for Create, Update, and Delete actions.

### Key Entities
- **Post**: `id`, `title`, `content`, `author_id`, `view_count`, `created_at`, `updated_at`.
- **Comment**: `id`, `content`, `author_id`, `post_id`, `created_at`, `updated_at`.

## API Endpoints
- `GET /api/board/posts` (List)
- `POST /api/board/posts` (Create)
- `GET /api/board/posts/{postId}` (Detail)
- `PUT /api/board/posts/{postId}` (Update)
- `DELETE /api/board/posts/{postId}` (Delete)
- `POST /api/board/posts/{postId}/comments` (Create Comment)
- `GET /api/board/posts/{postId}/comments` (List Comments)
