import React, { useState, useEffect } from "react";
import { env } from "../../utils/env";
import { indexedDB } from "../../utils/db";
import { getApiKey } from "~/services/utils";

interface SettingsProps {
  setApiKey: (key: string) => void;
  onClose: () => void;
  initialValidationError?: string;
}

const Settings: React.FC<SettingsProps> = ({
  setApiKey,
  onClose,
  initialValidationError,
}) => {
  const [tempApiKey, setTempApiKey] = useState("");
  const [saveStatus, setSaveStatus] = useState(initialValidationError || "");
  const [showWarning, setShowWarning] = useState(!!initialValidationError);
  const [isValidating, setIsValidating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const initApiKey = async () => {
      const key = await getApiKey();
      if (key) {
        setTempApiKey(key);
      }
    };
    initApiKey();
  }, []);

  useEffect(() => {
    if (initialValidationError) {
      setSaveStatus(initialValidationError);
      setShowWarning(true);
    }
  }, [initialValidationError]);

  const handleSave = async () => {
    try {
      if (!tempApiKey?.trim()) {
        setSaveStatus("API key cannot be empty");
        setTimeout(() => setSaveStatus(""), 2000);
        return;
      }

      setIsValidating(true);
      setSaveStatus("Validating API key...");
      const formattedKey = tempApiKey.trim();
      console.log("formattedKey", formattedKey);

      const response = await fetch(`${env.BACKEND_URL}/v1/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${formattedKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Invalid or disabled API key");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Invalid or disabled API key");
      }
      setApiKey(formattedKey);
      await indexedDB.saveUser(data.user);
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus(""), 2000);

      onClose();
    } catch (error) {
      setSaveStatus("Invalid or disabled API key");
      setShowWarning(true);
      setTimeout(() => setSaveStatus(""), 3000);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    if (!tempApiKey?.trim()) {
      setShowWarning(true);
      setSaveStatus("Please enter an API key before closing");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }
    onClose();
  };

  const handleGetApiKey = () => {
    window.open(`${env.SERVER_URL}/profile`, "_blank");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      {/* 设置弹窗容器 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#ffffff",
          boxShadow: "0 0 15px 0 rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
          zIndex: 10,
        }}
      >
        {/* 头部区域 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            height: "56px",
            boxSizing: "border-box",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>
            Settings
          </h2>
          <button
            onClick={handleClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: "transparent",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <svg
              style={{ width: "20px", height: "20px" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 设置内容区域 */}
        <div
          style={{
            padding: "16px",
            height: "calc(100vh - 56px)",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 500,
                color: "#111827",
                marginBottom: "12px",
              }}
            >
              Your API Key
            </h3>
            <p
              style={{
                fontSize: "14px",
                color: "#4B5563",
                marginBottom: "8px",
              }}
            >
              Use this API key to authenticate requests to the MIZU Agent API.
            </p>
            <p
              style={{
                fontSize: "14px",
                color: "#4B5563",
                marginBottom: "20px",
              }}
            >
              Don't have an API key?{" "}
              <button
                onClick={handleGetApiKey}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "#2563eb",
                  cursor: "pointer",
                  textDecoration: "underline",
                  display: "inline",
                  fontSize: "inherit",
                }}
              >
                Get one here
              </button>
            </p>
            <div style={{ position: "relative" }}>
              <input
                type={showApiKey ? "text" : "password"}
                value={tempApiKey || ""}
                onChange={(e) => {
                  setTempApiKey(e.target.value);
                  setShowWarning(false);
                }}
                placeholder="Enter your API key"
                style={{
                  width: "100%",
                  padding: "12px",
                  paddingRight: "40px", // 为按钮留出空间
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: `1px solid ${showWarning ? "#DC2626" : "#D1D5DB"}`,
                  marginBottom: "20px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "12px", // 固定顶部距离
                  background: "none",
                  border: "none",
                  padding: "0",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  color: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                type="button"
                title={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <button
                onClick={handleSave}
                disabled={isValidating}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: isValidating ? "#93C5FD" : "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: isValidating ? "default" : "pointer",
                  transition: "all 0.2s",
                  textAlign: "center",
                  opacity: isValidating ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!isValidating) {
                    e.currentTarget.style.backgroundColor = "#1d4ed8";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isValidating) {
                    e.currentTarget.style.backgroundColor = "#2563eb";
                  }
                }}
              >
                {isValidating ? "Validating..." : "Save"}
              </button>
              {saveStatus && (
                <span
                  style={{
                    fontSize: "14px",
                    color:
                      saveStatus.includes("Failed") ||
                      saveStatus.includes("Please enter") ||
                      saveStatus.includes("Invalid") ||
                      saveStatus.includes("disabled")
                        ? "#DC2626"
                        : "#059669",
                    textAlign: "center",
                  }}
                >
                  {saveStatus}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
