# Feature Specification: Authentication (Auth)

**Feature Branch**: `feature/auth` (Completed)
**Status**: Implemented

## User Scenarios & Testing

### User Story 1 - Sign Up (Priority: P1)
As a new user, I want to create an account so that I can access the system.

**Acceptance Scenarios**:
1. **Given** a user provides valid email, password, and nickname, **When** they submit the signup form, **Then** the account is created and they are logged in (or redirected to login).
2. **Given** a user provides an invalid email, **When** they submit, **Then** an error message is displayed.

### User Story 2 - Login (Priority: P1)
As a registered user, I want to log in so that I can view my private data.

**Acceptance Scenarios**:
1. **Given** valid credentials, **When** user logs in, **Then** an Access Token is issued and Refresh Token is set in HttpOnly cookie.
2. **Given** invalid credentials, **When** user logs in, **Then** an error message is displayed.

### User Story 3 - Silent Refresh (Priority: P1)
As a logged-in user, I want my session to persist so that I don't have to log in every time I refresh the page.

**Acceptance Scenarios**:
1. **Given** a valid Refresh Token in cookie, **When** the app loads, **Then** a new Access Token is silently requested and the user remains authenticated.

## Requirements

### Functional Requirements
- **FR-001**: System MUST allow users to sign up with Email, Password, and Nickname.
- **FR-002**: System MUST authenticate users using JWT (Access Token) and HttpOnly Cookie (Refresh Token).
- **FR-003**: System MUST allow users to log out, invalidating the session.
- **FR-004**: System MUST protect private routes (e.g., Profile, Board write) from unauthenticated access.

### Key Entities
- **User**: Managed by Supabase Auth (`auth.users`).
- **SupabaseUser**: Client-side representation of the user.

## API Endpoints
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
