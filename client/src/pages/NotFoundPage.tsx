import { Link } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <ExclamationTriangleIcon className="w-24 h-24 mx-auto text-gray-400" />

        {/* 404 Title */}
        <h1 className="text-6xl font-bold text-gray-900">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-gray-700">
          페이지를 찾을 수 없습니다
        </h2>

        <p className="text-gray-600">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>

        {/* Back to Home Button */}
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
