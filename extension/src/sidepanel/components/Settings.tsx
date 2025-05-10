import React, { useState, useEffect } from "react";
import { env } from "../../utils/env";
import { db } from "~/utils/db";

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
  const [userId, setUserId] = useState<string>("");
  const [apiKey, setApiKeyState] = useState("");
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<any | null>(null);
  const [isSettingsValid, setIsSettingsValid] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const user = await db.getCurrentUser();
      if (user && user.api_key) {
        setApiKeyState(user.api_key);
        setSelectedModelId(user.selectedModelId || "");
        setUserId(user.id);
        const userModels = await db.getUserModels(user.id);
        setModels(userModels);
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
        const newUserId = verifyData.user.id;
        try {
          await db.saveOrUpdateUser({
            ...verifyData.user,
            api_key: formattedKey,
            selectedModelId,
          });
          setUserId(newUserId);
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
    console.log(",,,,,,value", value.trim());
    if (value.trim()) {
      handleVerifyAndSet(value);
    }
  };

  const refreshModels = async () => {
    try {
      const response = await fetch(`${env.BACKEND_URL}/v1/models`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch models");
      }

      const data = await response.json();
      setModels(
        data.map((model: any) => ({
          ...model,
          apiKey: model.api_key,
          apiUrl: model.api_url,
        }))
      );
    } catch (error) {
      console.error("Model refresh error:", error);
      setSaveStatus(
        `Failed to refresh models: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handleAddModel = () => {
    if (!apiKey.trim()) {
      setSaveStatus("Please set your API Key first (required)");
      setShowWarning(true);
      return;
    }
    setEditingModel({
      type: "custom",
      name: "",
      apiKey: "",
      apiUrl: "",
      userId: userId,
    });
    setModalOpen(true);
  };
  const handleEditModel = (model: any) => {
    setEditingModel(model);
    setModalOpen(true);
  };
  const handleDeleteModel = async (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const response = await fetch(`${env.BACKEND_URL}/v1/models/delete`, {
        method: "POST",
        body: JSON.stringify({ id: confirmDeleteId }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete model");
      }

      const data = await response.json();
      if (data.success) {
        if (selectedModelId === confirmDeleteId) setSelectedModelId("");
        await refreshModels();
        setConfirmDeleteId(null);
      } else {
        throw new Error(data.message || "Failed to delete model");
      }
    } catch (error) {
      console.error("Model delete error:", error);
      setSaveStatus(
        `Failed to delete model: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => setConfirmDeleteId(null);

  const handleSaveModel = async (model: any) => {
    if (!model.name?.trim()) {
      setSaveStatus("Model name is required");
      return;
    }

    // Duplicate name check (case-insensitive, ignore self when editing)
    const nameExists = models.some(
      (m) =>
        m.name.trim().toLowerCase() === model.name.trim().toLowerCase() &&
        m.id !== model.id
    );
    if (nameExists) {
      setSaveStatus(
        "Model name already exists. Please choose a different name."
      );
      return;
    }

    if (!model.apiKey?.trim()) {
      setSaveStatus("API key is required");
      return;
    }

    if (!model.apiUrl?.trim()) {
      setSaveStatus("API URL is required");
      return;
    }

    try {
      const response = await fetch(`${env.BACKEND_URL}/v1/models`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: model.type,
          name: model.name,
          api_key: model.apiKey,
          api_url: model.apiUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save model");
      }

      const data = await response.json();
      if (data.success && data.model) {
        await db.addOrUpdateModel({
          id: data.model.id,
          type: data.model.type,
          name: data.model.name,
          apiKey: data.model.api_key,
          apiUrl: data.model.api_url,
          userId: userId,
        });
        await refreshModels();
        setModalOpen(false);
        setSaveStatus("");
      } else {
        throw new Error(data.message || "Failed to save model");
      }
    } catch (error) {
      console.error("Model save error:", error);
      setSaveStatus(
        `Failed to save model: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };
  const closeModal = () => setModalOpen(false);

  const isDisabled = !(
    editingModel?.name?.trim() &&
    editingModel?.apiKey?.trim() &&
    editingModel?.apiUrl?.trim()
  );

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
            padding: "16px 24px",
            borderBottom: "1px solid #E5E7EB",
            height: "64px",
            boxSizing: "border-box",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827" }}>
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
            padding: "24px",
            height: "calc(100vh - 64px)",
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
                    paddingRight: "40px",
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
            {/* Model Management Section */}
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                Custom Model
              </h3>
              <div style={{ marginBottom: "16px" }}>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "14px",
                    borderRadius: "8px",
                    border: "1px solid #D1D5DB",
                    outline: "none",
                    boxSizing: "border-box",
                    backgroundColor: "#F9FAFB",
                    color: "#374151",
                  }}
                >
                  {models
                    .filter((model) => model.type !== "system")
                    .map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                </select>
              </div>
              {/* Model List */}
              {models
                .filter((model) => model.type !== "system")
                .map((model) => (
                  <div
                    key={model.id}
                    style={{
                      border: "1px solid #E5E7EB",
                      borderRadius: 8,
                      padding: "8px 16px",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ maxWidth: "70%", overflow: "hidden" }}>
                      <div style={{ fontWeight: 600, wordBreak: "break-all" }}>
                        {model.name}
                      </div>
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: 13,
                          wordBreak: "break-all",
                          marginTop: 4,
                        }}
                      >
                        {model.apiKey ? (
                          "*****************************" +
                          model.apiKey.slice(-4)
                        ) : (
                          <span style={{ color: "#DC2626" }}>No API Key</span>
                        )}
                      </div>
                      <div
                        style={{
                          color: "#6B7280",
                          fontSize: 13,
                          wordBreak: "break-all",
                          marginTop: 4,
                        }}
                      >
                        {model.apiUrl}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => handleEditModel(model)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          color: "#2563EB",
                        }}
                        title="Edit"
                      >
                        {/* Edit (pencil) icon */}
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                          <path d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteModel(model.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          color: "#DC2626",
                        }}
                        title="Delete"
                      >
                        {/* Delete (trash) icon */}
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={handleAddModel}
                  style={{
                    border: "2px dashed #2563EB",
                    borderRadius: 8,
                    padding: 14,
                    textAlign: "center",
                    color: "#2563EB",
                    cursor: "pointer",
                    background: "none",
                    width: "100%",
                  }}
                >
                  + Add New Model
                </button>
              </div>
              {/* Model Edit Modal */}
              {modalOpen && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      padding: "32px 32px 24px 32px",
                      minWidth: 380,
                      boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <h3
                      style={{
                        marginBottom: 24,
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#111827",
                      }}
                    >
                      {editingModel?.id ? "Edit Model" : "Add Model"}
                    </h3>
                    <div style={{ marginBottom: 18 }}>
                      <label
                        style={{
                          fontWeight: 500,
                          fontSize: 15,
                          marginBottom: 6,
                          display: "block",
                        }}
                      >
                        <span style={{ color: "red" }}>*</span> Model Name
                      </label>
                      <input
                        value={editingModel?.name || ""}
                        onChange={(e) =>
                          setEditingModel({
                            ...editingModel,
                            name: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 15,
                          borderRadius: 8,
                          border: "1px solid #D1D5DB",
                          outline: "none",
                          marginTop: 2,
                          boxSizing: "border-box",
                          transition: "border 0.2s",
                        }}
                        placeholder="Enter model name"
                      />
                    </div>
                    <div style={{ marginBottom: 28 }}>
                      <label
                        style={{
                          fontWeight: 500,
                          fontSize: 15,
                          marginBottom: 6,
                          display: "block",
                        }}
                      >
                        <span style={{ color: "red" }}>*</span> API Key
                      </label>
                      <input
                        value={editingModel?.apiKey || ""}
                        onChange={(e) =>
                          setEditingModel({
                            ...editingModel,
                            apiKey: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 15,
                          borderRadius: 8,
                          border: "1px solid #D1D5DB",
                          outline: "none",
                          marginTop: 2,
                          boxSizing: "border-box",
                          transition: "border 0.2s",
                        }}
                        placeholder="Enter API key"
                      />
                    </div>
                    <div style={{ marginBottom: 28 }}>
                      <label
                        style={{
                          fontWeight: 500,
                          fontSize: 15,
                          marginBottom: 6,
                          display: "block",
                        }}
                      >
                        <span style={{ color: "red" }}>*</span> API Url
                      </label>
                      <input
                        value={editingModel?.apiUrl || ""}
                        onChange={(e) =>
                          setEditingModel({
                            ...editingModel,
                            apiUrl: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          fontSize: 15,
                          borderRadius: 8,
                          border: "1px solid #D1D5DB",
                          outline: "none",
                          marginTop: 2,
                          boxSizing: "border-box",
                          transition: "border 0.2s",
                        }}
                        placeholder="Enter API url"
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 16,
                      }}
                    >
                      <button
                        onClick={closeModal}
                        style={{
                          padding: "9px 22px",
                          borderRadius: 7,
                          border: "1px solid #D1D5DB",
                          background: "#fff",
                          color: "#111827",
                          fontWeight: 500,
                          fontSize: 15,
                          cursor: "pointer",
                          transition: "background 0.2s, border 0.2s",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          editingModel && handleSaveModel(editingModel)
                        }
                        disabled={isDisabled}
                        style={{
                          padding: "9px 22px",
                          borderRadius: 7,
                          border: "none",
                          background: "#2563EB",
                          color: "#fff",
                          fontWeight: 600,
                          fontSize: 15,
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          boxShadow: "0 2px 8px 0 rgba(37,99,235,0.08)",
                          transition: "background 0.2s",
                          opacity: isDisabled ? 0.5 : 1,
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                  backgroundColor: isValidating ? "#93C5FD" : "#2563EB",
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
                    e.currentTarget.style.backgroundColor = "#1D4ED8";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isValidating) {
                    e.currentTarget.style.backgroundColor = "#2563EB";
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
      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "32px 32px 24px 32px",
              minWidth: 340,
              boxShadow: "0 8px 32px 0 rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "90%",
              maxWidth: "400px",
            }}
          >
            <h3
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 18,
              }}
            >
              Confirm Delete
            </h3>
            <div
              style={{
                fontSize: 15,
                color: "#374151",
                marginBottom: 28,
                textAlign: "center",
              }}
            >
              Are you sure you want to delete this model? This action cannot be
              undone.
            </div>
            <div style={{ display: "flex", gap: 16 }}>
              <button
                onClick={cancelDelete}
                style={{
                  padding: "9px 22px",
                  borderRadius: 7,
                  border: "1px solid #D1D5DB",
                  background: "#fff",
                  color: "#111827",
                  fontWeight: 500,
                  fontSize: 15,
                  cursor: "pointer",
                  transition: "background 0.2s, border 0.2s",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "9px 22px",
                  borderRadius: 7,
                  border: "none",
                  background: "#DC2626",
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px 0 rgba(220,38,38,0.08)",
                  transition: "background 0.2s",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
