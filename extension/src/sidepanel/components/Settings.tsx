import React, { useState, useEffect } from "react";
import { env } from "../../utils/env";
import { db } from "~/utils/db";
import { PROVIDER_MODELS } from "~/utils/openaiModels";

interface SettingsProps {
  setApiKey: (key: string) => void;
  onClose: () => void;
  initialValidationError?: string;
  autoCloseOnSuccess?: boolean;
  onSuccess?: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  setApiKey,
  onClose,
  initialValidationError,
  autoCloseOnSuccess = false,
  onSuccess,
}) => {
  const [apiKey, setApiKeyState] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSettingsValid, setIsSettingsValid] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    const init = async () => {
      const user = await db.getCurrentUser();
      if (user && user.api_key) {
        setApiKeyState(user.api_key);
        setSelectedModelId(user.selectedModelId || "");
      } else {
        setApiKeyState("");
        setIsSettingsValid(false);
      }
    };
    init();
  }, []);

  const handleVerifyAndSet = async (key: string) => {
    setIsValidating(true);
    setSaveStatus("");
    try {
      const formattedKey = key.trim();
      const verifyResponse = await fetch(`${env.BACKEND_URL}/v1/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${formattedKey}`,
          "Content-Type": "application/json",
        },
      });
      const verifyData = await verifyResponse.json();

      if (!verifyResponse || !verifyResponse?.ok) {
        setIsSettingsValid(false);
        throw new Error(verifyData.message || "API verification failed");
      }

      if (verifyData.success && verifyData.user) {
        try {
          await db.saveOrUpdateUser({
            ...verifyData.user,
            api_key: formattedKey,
            selectedModelId,
          });

          const userId = verifyData.user.id;
          const allModels = PROVIDER_MODELS.flatMap((provider) =>
            provider.models.map((model) => ({
              ...model,
              userId,
              apiKey: model.id === "system" ? env.LLM_API_KEY || "" : "",
              apiUrl:
                model.id === "system" ? env.LLM_API_URL || "" : model.apiUrl,
              name: model.id === "system" ? env.OPENAI_MODEL || "" : model.name,
              type: model.id === "system" ? "Default" : provider.type,
            }))
          );
          await db.models.bulkPut(allModels);

          setApiKeyState(formattedKey);
          setSaveStatus("");
          setApiKey(formattedKey);
          setIsSettingsValid(true);
          if (autoCloseOnSuccess) {
            onClose();
            if (onSuccess) onSuccess();
          }
        } catch (dbError) {
          console.error("Database error:", dbError);
          setSaveStatus(
            `Failed to save user data: ${dbError instanceof Error ? dbError?.message : "Unknown error"}`
          );
          setIsSettingsValid(false);
        }
      } else {
        setIsSettingsValid(false);
        setSaveStatus(verifyData.message || "API Key verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setSaveStatus(
        `${error instanceof Error ? error?.message : "Failed to verify API Key"}`
      );
      setIsSettingsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setApiKeyState(value);
    setShowWarning(false);
    if (value.trim()) {
      handleVerifyAndSet(value);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            borderBottom: "1px solid #f0f0f0",
            height: "44px",
            boxSizing: "border-box",
          }}
        >
          <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>
            Settings
          </h2>
          <button
            onClick={() => {
              if (isSettingsValid) onClose();
            }}
            disabled={!isSettingsValid}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              backgroundColor: "transparent",
              border: "none",
              color: !isSettingsValid ? "#9CA3AF" : "#6b7280",
              cursor: !isSettingsValid ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: !isSettingsValid ? 0.5 : 1,
            }}
            onMouseOver={(e) => {
              if (isSettingsValid) {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }
            }}
            onMouseOut={(e) => {
              if (isSettingsValid) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
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
        {/* Content */}
        <div
          style={{
            padding: "16px",
            height: "calc(100vh - 44px)",
            overflowY: "auto",
            boxSizing: "border-box",
          }}
        >
          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            {/* API Key Section */}
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                <span style={{ color: "red" }}>*</span> API Key
              </h3>
              <div style={{ position: "relative" }}>
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={handleApiKeyChange}
                  placeholder="Enter your API key"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    borderRadius: "8px",
                    border: `1px solid ${showWarning ? "#DC2626" : "#D1D5DB"}`,
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#F9FAFB",
                    paddingRight: "56px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#6b7280",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  tabIndex={-1}
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? (
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.94 17.94A10.06 10.06 0 0 1 12 20c-5.05 0-9.27-3.11-11-8 1.09-2.86 3.05-5.13 5.56-6.44" />
                      <path d="M1 1l22 22" />
                      <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.38 0 2.63-.83 3.16-2.03" />
                      <path d="M14.47 14.47A3.5 3.5 0 0 1 12 8.5c-.41 0-.8.07-1.17.2" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M2.05 12C3.81 7.61 7.88 4.5 12 4.5s8.19 3.11 9.95 7.5c-1.76 4.39-5.83 7.5-9.95 7.5s-8.19-3.11-9.95-7.5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {/* Save Button */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <button
                onClick={() => handleVerifyAndSet(apiKey)}
                disabled={isValidating || !apiKey.trim()}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: isValidating ? "#d1d5db" : "#000000",
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
                    e.currentTarget.style.opacity = "0.7";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isValidating) {
                    e.currentTarget.style.opacity = "1";
                  }
                }}
              >
                {isValidating ? "Saving..." : "Save"}
              </button>
              {saveStatus && (
                <span
                  style={{
                    fontSize: "14px",
                    color:
                      saveStatus.includes("Failed") ||
                      saveStatus.includes("required")
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
