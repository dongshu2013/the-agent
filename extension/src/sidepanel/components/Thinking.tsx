import React from 'react';

const Thinking: React.FC = () => {
  return (
    <div className="flex items-center text-gray-500 py-1">
      <style>
        {`
          @keyframes dots {
            0%, 20% { opacity: 0; }
            50% { opacity: 1; }
            80%, 100% { opacity: 0; }
          }
          .loading-dot {
            animation: dots 1.5s infinite;
          }
        `}
      </style>

      {/* 加载文字 */}
      <div className="text-sm font-medium text-gray-600">
        thinking
        <span className="inline-flex ml-3">
          <span className="loading-dot" style={{ animationDelay: '0s' }}>
            .
          </span>
          <span className="loading-dot" style={{ animationDelay: '0.3s' }}>
            .
          </span>
          <span className="loading-dot" style={{ animationDelay: '0.6s' }}>
            .
          </span>
        </span>
      </div>
    </div>
  );
};

export default Thinking;
