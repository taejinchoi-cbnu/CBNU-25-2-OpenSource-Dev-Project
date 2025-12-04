import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = featuresRef.current?.querySelectorAll(".feature-card");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -z-10 mix-blend-multiply animate-pulse"></div>

        <div className="relative max-w-7xl mx-auto text-center space-y-10">
          <h1 className="text-5xl md:text-7xl font-bold text-[var(--color-primary)] tracking-tight leading-tight animate-fade-in-up">
            성적표를
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-secondary)] to-cyan-400">
              {" "}
              그래프로 시각화
            </span>
            하고 <br />
            분석해보세요.
          </h1>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up delay-100">
            복잡한 성적표는 이제 그만. <br />
            한눈에 들어오는 그래프와 졸업 요건 분석으로 학업 계획을 세워보세요.
          </p>
          <div className="flex justify-center gap-4 animate-fade-in-up delay-200">
            <Link
              to="/grades/analyze"
              className="px-10 py-5 text-xl font-semibold text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              시작하기
            </Link>
            <Link
              to="/board"
              className="px-10 py-5 text-xl font-semibold text-[var(--color-primary)] bg-white border border-gray-200 hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)] rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              커뮤니티 둘러보기
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-white" ref={featuresRef}>
        <div className="max-w-[90rem] mx-auto">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="feature-card opacity-0 translate-y-10 transition-all duration-700 ease-out card p-12 min-h-[480px] hover:border-[var(--color-secondary)] group relative overflow-hidden flex flex-col justify-center">
              <div className="w-22 h-22 bg-blue-50 rounded-3xl flex items-end justify-center mb-10 group-hover:bg-blue-100 transition-colors pb-4 gap-1.5 mx-auto md:mx-0">
                <div className="w-2.5 bg-blue-300 rounded-t-sm h-6 group-hover:h-12 transition-all duration-300 ease-out"></div>
                <div className="w-2.5 bg-blue-400 rounded-t-sm h-10 group-hover:h-16 transition-all duration-300 ease-out delay-75"></div>
                <div className="w-2.5 bg-blue-500 rounded-t-sm h-5 group-hover:h-14 transition-all duration-300 ease-out delay-150"></div>
                <div className="w-2.5 bg-blue-600 rounded-t-sm h-8 group-hover:h-10 transition-all duration-300 ease-out delay-100"></div>
              </div>
              <h3 className="text-4xl font-bold text-[var(--color-primary)] mb-5">
                성적 시각화
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                학기별 평점, 이수 현황을 <br /> 직관적인 그래프로 확인하세요.{" "}
                <br />
                성장 곡선을 한눈에 파악할 수 있습니다.
              </p>
            </div>

            <div className="feature-card opacity-0 translate-y-10 transition-all duration-700 ease-out [transition-delay:200ms] card p-12 min-h-[480px] hover:border-[var(--color-secondary)] group flex flex-col justify-center">
              <div className="w-22 h-22 bg-indigo-50 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-indigo-100 transition-colors mx-auto md:mx-0">
                <svg
                  className="w-13 h-13 text-indigo-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-[var(--color-primary)] mb-5">
                졸업 요건 분석
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                입학 연도와 학과에 따른 졸업 요건을 자동으로 분석해드립니다.
                <br />
                남은 학점과 필수 과목을 놓치지 마세요.
              </p>
            </div>

            <div className="feature-card opacity-0 translate-y-10 transition-all duration-700 ease-out [transition-delay:400ms] card p-12 min-h-[480px] hover:border-[var(--color-secondary)] group relative flex flex-col justify-center">
              <div className="w-22 h-22 bg-purple-50 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-purple-100 transition-colors relative mx-auto md:mx-0 pb-3">
                {/* Main Icon */}
                <UserGroupIcon className="w-13 h-13 text-purple-500 relative z-10" />

                {/* Floating Icons */}
                <ChatBubbleLeftRightIcon className="w-9 h-9 text-purple-400 absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 group-hover:-translate-y-3 group-hover:translate-x-3 transition-all duration-500 ease-out" />
                <HandRaisedIcon className="w-9 h-9 text-purple-300 absolute -bottom-2 -left-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-3 group-hover:-translate-x-3 transition-all duration-500 ease-out delay-100" />
              </div>
              <h3 className="text-4xl font-bold text-[var(--color-primary)] mb-5">
                커뮤니티
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                자유 게시판을 통해 학우들과 소통하고 <br />
                함께 성장하는 즐거움을 느껴보세요.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
