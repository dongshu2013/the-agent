import React from "react";

const LoadingBrain: React.FC = () => {
  return (
    <div className="flex items-center space-x-3 text-gray-500 py-1">
      <div className="relative w-6 h-6">
        {/* 闪烁的圆圈动画 */}
        <div
          className="absolute inset-0 bg-blue-500 opacity-20 rounded-full animate-ping"
          style={{ animationDuration: "2s" }}
        ></div>

        {/* 旋转的光晕 */}
        <div
          className="absolute inset-0 border-2 border-blue-400 opacity-30 rounded-full animate-spin"
          style={{ animationDuration: "3s" }}
        ></div>

        {/* 主图标 */}
        <svg
          className="relative z-10 w-6 h-6 text-blue-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Z" />
          <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
          <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        </svg>
      </div>

      {/* 加载文字 */}
      <div className="text-sm font-medium text-gray-600">
        思考中
        <span className="inline-flex ml-1">
          <span
            className="animate-pulse delay-0"
            style={{ animationDuration: "1.5s" }}
          >
            .
          </span>
          <span
            className="animate-pulse"
            style={{ animationDuration: "1.5s", animationDelay: "0.3s" }}
          >
            .
          </span>
          <span
            className="animate-pulse"
            style={{ animationDuration: "1.5s", animationDelay: "0.6s" }}
          >
            .
          </span>
        </span>
      </div>
    </div>
  );
};

export default LoadingBrain;
