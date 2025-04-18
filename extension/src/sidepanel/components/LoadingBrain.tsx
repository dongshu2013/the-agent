import React from "react";

const LoadingBrain: React.FC = () => {
  return (
    <div className="flex items-center space-x-3 text-gray-500 py-1">
      <style>
        {`
          @keyframes thinking {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.2); opacity: 0.7; }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes dots {
            0%, 20% { opacity: 0; }
            50% { opacity: 1; }
            80%, 100% { opacity: 0; }
          }
          .thinking-dot {
            animation: thinking 1.5s infinite;
          }
          .rotate-glow {
            animation: rotate 3s linear infinite;
          }
          .loading-dot {
            animation: dots 1.5s infinite;
          }
        `}
      </style>
      <div className="relative w-6 h-6">
        {/* 思考动画 */}
        <div
          className="absolute inset-0 bg-blue-500 rounded-full thinking-dot"
          style={{ opacity: 0.3 }}
        ></div>

        {/* 旋转光环 */}
        <div
          className="absolute inset-0 border-2 border-blue-400 rounded-full rotate-glow"
          style={{ opacity: 0.5 }}
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
        thinking
        <span className="inline-flex ml-3">
          <span className="loading-dot" style={{ animationDelay: "0s" }}>
            .
          </span>
          <span className="loading-dot" style={{ animationDelay: "0.3s" }}>
            .
          </span>
          <span className="loading-dot" style={{ animationDelay: "0.6s" }}>
            .
          </span>
        </span>
      </div>
    </div>
  );
};

export default LoadingBrain;
