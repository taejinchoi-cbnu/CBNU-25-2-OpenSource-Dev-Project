# Project Principles & Technology Stack

## Project Overview
**Project Name**: Image Visualization System (이미지 시각화 시스템)
**Goal**: Analyze grade report screenshots using AI OCR, visualize academic performance, and provide community features.

## Technology Stack

### Client
- **Framework**: React v19, Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **State Management**: 
  - **Global Auth**: Zustand
  - **Server State**: TanStack Query (React Query)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios (with interceptors for Auth)

### Server
- **Framework**: Spring Boot (Java)
- **Build Tool**: Gradle
- **Database**: Supabase (PostgreSQL)
- **ORM**: JPA (Hibernate)
- **API Documentation**: Swagger (SpringDoc)

### AI / ML
- **Engine**: PaddleOCR (Python)
- **Integration**: REST API or internal service (TBD)

### Infrastructure
- **Containerization**: Docker, Docker Compose

## Core Principles
1.  **Component-Based Architecture**: Modularize by features (pages, components, hooks).
2.  **Layered Architecture (Server)**: Controller -> Service -> Repository -> DB.
3.  **Secure Authentication**: JWT (Access Token) + HttpOnly Cookie (Refresh Token).
4.  **Spec-Driven Development**: All features must be specified in `specs/` before implementation.
