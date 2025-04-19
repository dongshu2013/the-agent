import React, { useState, useEffect } from "react";
import { Storage } from "@plasmohq/storage";
import { env } from "../../utils/env";
import { indexedDB } from "../../utils/db";

interface SettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onClose: () => void;
  initialValidationError?: string;
}

const Settings: React.FC<SettingsProps> = ({
  apiKey,
  setApiKey,
  onClose,
  initialValidationError,
}) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [saveStatus, setSaveStatus] = useState(initialValidationError || "");
  const [showWarning, setShowWarning] = useState(!!initialValidationError);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const storage = new Storage();
    storage.get("apiKey").then((key) => {
      if (key) {
        setTempApiKey(key);
      }
    });
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

      await indexedDB.saveUser(data.user);

      const storage = new Storage();
      await storage.set("apiKey", formattedKey);
      setApiKey(formattedKey);
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
            <input
              type="password"
              value={tempApiKey || ""}
              onChange={(e) => {
                setTempApiKey(e.target.value);
                setShowWarning(false);
              }}
              placeholder="Enter your API key"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                borderRadius: "8px",
                border: `1px solid ${showWarning ? "#DC2626" : "#D1D5DB"}`,
                marginBottom: "20px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
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
