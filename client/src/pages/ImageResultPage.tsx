import React, { useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { type AnalysisResult } from "../types/image.types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import { getRequirements } from "../data/graduationRules";

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

const ImageResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dashboardRef = useRef<HTMLDivElement>(null);

  // 이전 페이지에서 전달된 데이터 조회
  const data = location.state?.data as AnalysisResult | undefined;

  useEffect(() => {
    if (!data) {
      toast.error("분석 데이터가 없습니다. 다시 시도해주세요.");
      navigate("/grades/analyze");
    }
  }, [data, navigate]);

  if (!data) {
    return null;
  }

  const handleDownload = async () => {
    if (dashboardRef.current) {
      try {
        const canvas = await html2canvas(dashboardRef.current, {
          scale: 2,
          useCORS: true,
          logging: false, // eslint-disable-next-line
        } as any);
        const link = document.createElement("a");
        link.download = "grade-report.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        toast.success("리포트가 다운로드되었습니다.");
      } catch {
        toast.error("다운로드 중 오류가 발생했습니다.");
      }
    }
  };

  // 1. 학생 정보 추출
  const studentId = data.studentId || "2023000000";
  const admissionYear = parseInt(studentId.substring(0, 4));
  const major = "소프트웨어전공";

  const requirements = getRequirements(admissionYear, major);

  // 2. 영역별 이수 학점 계산
  let earnedGe = 0;
  let earnedMajorReq = 0;
  let earnedMajorSel = 0;
  let earnedTotal = data.totalCredits || 0; // 서버 데이터가 있으면 사용

  if (!data.totalCredits) {
    // totalCredits가 없으면 직접 계산
    earnedTotal = data.semesters.reduce((acc, sem) => {
      const semCredits =
        sem.credits ||
        sem.earnedCredits ||
        sem.earned_credits ||
        sem.subjects.reduce((sum, sub) => sum + sub.credits, 0);
      return acc + semCredits;
    }, 0);
  }

  data.semesters.forEach((sem) => {
    sem.subjects.forEach((sub) => {
      const type = sub.type || "";
      const credits = sub.credits || 0;

      if (type.includes("교양")) earnedGe += credits;
      if (type.includes("전공필수") || type.includes("전필"))
        earnedMajorReq += credits;
      if (type.includes("전공선택") || type.includes("전선"))
        earnedMajorSel += credits;
    });
  });

  const earnedMajorTotal = earnedMajorReq + earnedMajorSel;

  // 차트용 데이터 처리
  const semesterHistory = data.semesters
    .map((sem) => ({
      name: `${sem.year}-${sem.semester}`,
      gpa: sem.gpa,
    }))
    .reverse();

  const courseTypeData: ChartData[] = [];
  const gradeDistData: ChartData[] = [];

  const typeMap = new Map<string, number>();
  const gradeMap = new Map<string, number>();

  data.semesters.forEach((sem) => {
    sem.subjects.forEach((sub) => {
      const type = sub.type || "기타";
      typeMap.set(type, (typeMap.get(type) || 0) + sub.credits);

      const grade = sub.grade || "Unknown";
      gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);
    });
  });

  // 서버에서 제공된 값 직접 사용
  const finalTotalCredits = earnedTotal;
  const averageGpa = data.averageGpa?.toFixed(2) || "0.00";

  typeMap.forEach((value, key) => courseTypeData.push({ name: key, value }));
  gradeMap.forEach((value, key) => gradeDistData.push({ name: key, value }));

  const gradeOrder = [
    "A+",
    "A0",
    "B+",
    "B0",
    "C+",
    "C0",
    "D+",
    "D0",
    "F",
    "P",
    "NP",
  ];
  gradeDistData.sort(
    (a, b) => gradeOrder.indexOf(a.name) - gradeOrder.indexOf(b.name)
  );

  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/grades/analyze")}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            다시 분석하기
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 shadow-lg transition-transform transform hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M7.5 12 12 16.5m0 0 4.5-4.5M12 16.5v-9"
              />
            </svg>
            리포트 다운로드
          </button>
        </div>

        <div
          ref={dashboardRef}
          className="bg-gray-50 p-8 rounded-3xl shadow-inner space-y-8"
        >
          {/* 헤더 */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              학업 성취도 리포트
            </h1>
            <p className="text-gray-500 mt-2">
              {admissionYear}학번 {major} 졸업 요건 분석
            </p>
          </div>

          {/* KPI 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
              <p className="text-gray-500 font-medium mb-2">전체 평점 (GPA)</p>
              <div className="text-5xl font-black text-blue-600">
                {averageGpa}
              </div>
              <p className="text-sm text-gray-400 mt-2">/ 4.5</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
              <p className="text-gray-500 font-medium mb-2">총 이수 학점</p>
              <div className="text-5xl font-black text-emerald-500">
                {finalTotalCredits}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                / {requirements?.totalCredits || 140}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
              <p className="text-gray-500 font-medium mb-2">전공 이수율</p>
              <div className="text-5xl font-black text-purple-500">
                {requirements
                  ? Math.round(
                      (earnedMajorTotal / requirements.majorCredits.total) * 100
                    )
                  : 0}
                %
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {earnedMajorTotal} / {requirements?.majorCredits.total}
              </p>
            </div>
          </div>

          {/* 졸업 요건 분석 섹션 */}
          {requirements && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-2 h-8 bg-indigo-500 rounded-full mr-3"></span>
                졸업 요건 달성도
              </h3>

              <div className="space-y-6">
                {/* 총 이수 학점 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">
                      총 이수 학점
                    </span>
                    <span className="text-gray-500 text-sm">
                      {earnedTotal} / {requirements.totalCredits}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-indigo-500 h-4 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min((earnedTotal / requirements.totalCredits) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* 전공 학점 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">
                        전공 필수
                      </span>
                      <span className="text-gray-500 text-sm">
                        {earnedMajorReq} / {requirements.majorCredits.required}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min((earnedMajorReq / requirements.majorCredits.required) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700 font-medium">
                        전공 선택
                      </span>
                      <span className="text-gray-500 text-sm">
                        {earnedMajorSel} / {requirements.majorCredits.elective}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-400 h-3 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min((earnedMajorSel / requirements.majorCredits.elective) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 교양 학점 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">
                      교양 (전체)
                    </span>
                    <span className="text-gray-500 text-sm">
                      {earnedGe} / {requirements.ge.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min((earnedGe / requirements.ge.total) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    * 세부 영역(기초, 일반, 확대, 자연이공계)은 별도 확인이
                    필요합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 차트 행 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* GPA 추이 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                학기별 성적 추이
              </h3>
              <div className="h-80" style={{ width: "100%", height: "320px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={semesterHistory}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      domain={[0, 4.5]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                      cursor={{ stroke: "#3B82F6", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      stroke="#3B82F6"
                      strokeWidth={4}
                      isAnimationActive={false}
                      dot={{
                        r: 6,
                        fill: "#3B82F6",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 이수 구분 분포 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <span className="w-2 h-8 bg-emerald-500 rounded-full mr-3"></span>
                이수 구분별 비중
              </h3>
              <div
                className="h-80 flex items-center justify-center"
                style={{ width: "100%", height: "320px" }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {courseTypeData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 차트 행 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
              <span className="w-2 h-8 bg-purple-500 rounded-full mr-3"></span>
              성적 등급 분포
            </h3>
            <div className="h-80" style={{ width: "100%", height: "320px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    }}
                    cursor={{ fill: "#F3F4F6" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#8B5CF6"
                    radius={[8, 8, 0, 0]}
                    barSize={40}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm pt-8 pb-4">
            Generated by Image Visualization System
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageResultPage;
