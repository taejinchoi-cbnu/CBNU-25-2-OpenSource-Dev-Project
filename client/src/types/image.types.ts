export interface GradeItem {
  subjectName: string;
  credits: number;
  grade: string;
  type: string;
}

export interface SemesterGrade {
  year: number;
  semester: string;
  gpa: number;
  credits?: number;
  earnedCredits?: number;
  earned_credits?: number;
  subjects: GradeItem[];
}

export interface AnalysisResult {
  studentName?: string;
  studentId?: string;
  averageGpa?: number;
  totalCredits?: number;
  semesters: SemesterGrade[];
}

// 서버 응답 타입
export interface ServerStudentInfo {
  student_id: string;
  name: string;
}

export interface ServerGradeSummary {
  applied_credits: number;
  earned_credits: number;
  total_gpa_sum: number;
  average_gpa: number;
  score_100_scale: number;
}

export interface ServerSemesterHistory {
  year: number;
  semester_type: string;
  semester_name: string;
  applied_credits: number;
  earned_credits: number;
  average_gpa: number;
}

export interface ServerCourseHistory {
  year: number;
  semester: string;
  course_code: string;
  course_name: string;
  credits: number;
  category: string;
  grade: string;
  gpa: number;
}

export interface ServerAnalysisItem {
  student_info: ServerStudentInfo;
  grade_summary: ServerGradeSummary;
  semester_history: ServerSemesterHistory[];
  course_history: ServerCourseHistory[];
}

export interface ServerAnalysisResponse {
  result: ServerAnalysisItem;
}

export interface AnalysisResponse {
  result: AnalysisResult;
}
