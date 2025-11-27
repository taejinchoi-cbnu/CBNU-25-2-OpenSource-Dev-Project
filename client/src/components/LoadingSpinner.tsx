function LoadingSpinner() {
  return (
    <div className="flex flex-col justify-center items-center p-8 rounded-2xl glass">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
      </div>
      <span className="text-gray-500 font-medium text-sm animate-pulse">
        로딩중...
      </span>
    </div>
  );
}

export default LoadingSpinner;
