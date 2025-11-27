# Feature Specification: Image Analysis (Grade Report)

**Feature Branch**: `feature/image-analysis` (In Progress)
**Status**: Implemented (Stage 2 Completed - Data Transformation & Verification)

## User Scenarios & Testing

### User Story 1 - Upload Grade Report (Priority: P1)
As a student, I want to upload a screenshot of my grade report so that the system can analyze it.

**Acceptance Scenarios**:
1. **Given** a valid image file, **When** user uploads it, **Then** the system accepts it and starts processing.
2. **Given** an invalid file type, **When** user uploads, **Then** an error is shown.

### User Story 2 - View Analysis Results (Priority: P1)
As a user, I want to see the extracted grades and calculated GPA so that I can verify the accuracy.

**Acceptance Scenarios**:
1. **Given** a processed image, **When** analysis is complete, **Then** a structured result (JSON/Table) is displayed showing subjects, credits, and grades.

## Requirements

### Functional Requirements
- **FR-001**: System MUST accept image uploads (PNG, JPG).
- **FR-002**: System MUST use AI (PaddleOCR/Gemini) to extract text from images.
- **FR-003**: System MUST parse the extracted text into structured data (Subject, Credit, Grade).
- **FR-004**: System MUST NOT permanently store the raw images (Privacy).

### Key Entities
- **ImageAnalysisRequest**: The uploaded file.
- **AnalysisResult**: Structured data containing `List<GradeItem>`, `GPA`, etc.

## API Endpoints
- `POST /api/images/analyze` (Implemented & Verified)
