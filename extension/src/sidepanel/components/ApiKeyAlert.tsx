import React from "react";

interface ApiKeyAlertProps {
  onGetApiKey: () => void;
  onClose: () => void;
}

const ApiKeyAlert: React.FC<ApiKeyAlertProps> = ({ onGetApiKey, onClose }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff9db",
        padding: "16px",
        textAlign: "center",
        zIndex: 50,
        borderBottom: "1px solid #ffd43b",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          fontSize: "15px",
          color: "#664d03",
          marginBottom: "8px",
          fontWeight: 600,
          lineHeight: "1.5",
        }}
      >
        You need to login to get API Key to use the full functionality
      </div>
      <button
        onClick={onGetApiKey}
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: 500,
        }}
      >
        Go to get API Key
      </button>
      <button
        onClick={onClose}
        style={{
          backgroundColor: "transparent",
          border: "none",
          padding: "8px 12px",
          marginLeft: "8px",
          cursor: "pointer",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        Not now
      </button>
    </div>
  );
};

export default ApiKeyAlert;
