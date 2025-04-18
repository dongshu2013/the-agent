import React, { useState, useEffect } from "react";
import { Storage } from "@plasmohq/storage";

interface SettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ apiKey, setApiKey, onClose }) => {
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const storage = new Storage();
    storage.get("apiKey").then((key) => {
      if (key) {
        setTempApiKey(key);
        setApiKey(key);
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      const storage = new Storage();
      await storage.set("apiKey", tempApiKey);
      setApiKey(tempApiKey);
      setSaveStatus("Saved successfully!");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      setSaveStatus("Failed to save");
      setTimeout(() => setSaveStatus(""), 2000);
    }
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
            onClick={onClose}
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
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#6b7280";
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
                marginBottom: "20px",
              }}
            >
              Use this API key to authenticate requests to the MIZU Agent API.
            </p>
            <input
              type="password"
              value={tempApiKey || ""}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Enter your API key"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                borderRadius: "8px",
                border: "1px solid #D1D5DB",
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
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "center",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#1d4ed8";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }}
              >
                Save
              </button>
              {saveStatus && (
                <span
                  style={{
                    fontSize: "14px",
                    color: saveStatus.includes("Failed")
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
