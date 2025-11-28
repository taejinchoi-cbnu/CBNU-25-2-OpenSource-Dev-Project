import { apiClient } from "./client";
import type {
  AnalysisResponse,
  ServerAnalysisResponse,
  SemesterGrade,
  GradeItem,
} from "../types/image.types";

export const imageService = {
  analyzeImage: async (imageFile: File): Promise<AnalysisResponse> => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await apiClient.post<ServerAnalysisResponse>(
      "/images/analyze",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return transformServerResponseToUiModel(response.data);
  },
};

// 서버 데이터를 UI 데이터로 변환하는 헬퍼 함수
function transformServerResponseToUiModel(
  serverResponse: ServerAnalysisResponse
): AnalysisResponse {
  if (!serverResponse.result) {
    throw new Error("분석 결과가 없습니다.");
  }

  const serverData = serverResponse.result;

  if (!serverData) {
    throw new Error("분석 결과 항목이 비어있습니다.");
  }

  // UI 구조에 맞춰 과목들을 학기별로 그룹화
  const semestersMap = new Map<string, GradeItem[]>();

  if (serverData.course_history) {
    serverData.course_history.forEach((course) => {
      const key = `${course.year}-${course.semester}`;
      if (!semestersMap.has(key)) {
        semestersMap.set(key, []);
      }
      semestersMap.get(key)?.push({
        subjectName: course.course_name,
        credits: course.credits,
        grade: course.grade,
        type: course.category,
      });
    });
  }

  const semesterHistory = serverData.semester_history || [];

  const semesters: SemesterGrade[] = semesterHistory.map((sem) => {
    const key = `${sem.year}-${sem.semester_name}`;
    return {
      year: sem.year,
      semester: sem.semester_name,
      gpa: sem.average_gpa,
      subjects: semestersMap.get(key) || [],
    };
  });

  return {
    result: {
      studentName: serverData.student_info?.name || "Unknown",
      studentId: serverData.student_info?.student_id || "Unknown",
      averageGpa: serverData.grade_summary?.average_gpa || 0,
      totalCredits: serverData.grade_summary?.earned_credits || 0,
      semesters,
    },
  };
}
