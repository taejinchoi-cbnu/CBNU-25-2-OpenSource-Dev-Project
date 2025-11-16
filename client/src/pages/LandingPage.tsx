import { SsgoiTransition } from "@ssgoi/react";

export default function LandingPage() {
  return (
    <SsgoiTransition id="/">
      <div className="text-center pt-20">
        <h1 className="text-4xl font-bold mb-4">What's Your GPA</h1>
        <p className="text-lg text-gray-700">
          성적 분석 결과를 한눈에 확인하고, 커뮤니티에서 다른 사용자들과
          소통하세요.
        </p>
      </div>
    </SsgoiTransition>
  );
}
