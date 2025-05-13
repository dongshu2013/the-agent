import {
  MessageCircleMore,
  SquarePen,
  Settings as SettingsIcon,
} from "lucide-react";
import { db } from "~/utils/db";
import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import ModelCascader, { ProviderGroup } from "./ModelCascader";
import { PROVIDER_MODELS } from "~/utils/openaiModels";

interface HeaderProps {
  setShowSettings: (value: boolean) => void;
  createNewConversation: () => void;
  setShowConversationList: () => void;
  showSettings: boolean;
  onModelChange?: (model: string) => void;
}

const Header = ({
  setShowSettings,
  createNewConversation,
  setShowConversationList,
  showSettings,
  onModelChange,
}: HeaderProps) => {
  const [providerGroups, setProviderGroups] = useState<ProviderGroup[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  useEffect(() => {
    setProviderGroups(PROVIDER_MODELS);
    if (PROVIDER_MODELS.length > 0) {
      setSelectedProvider((prev) => prev || PROVIDER_MODELS[0].type);
      const firstModel = PROVIDER_MODELS[0].models[0];
      setSelectedModelId((prev) => prev || (firstModel ? firstModel.id : ""));
    }
  }, []);

  // When provider changes, update model selection
  useEffect(() => {
    if (!selectedProvider && providerGroups.length > 0) {
      setSelectedProvider(providerGroups[0].type);
    }
    const group = providerGroups.find((g) => g.type === selectedProvider);
    if (group && group.models.length > 0) {
      setSelectedModelId(group.models[0].id);
    }
  }, [selectedProvider, providerGroups]);

  // Handler for cascader change
  const handleCascaderChange = (value: string[]) => {
    if (value.length === 2) {
      setSelectedProvider(value[0]);
      setSelectedModelId(value[1]);
      if (onModelChange) {
        onModelChange(value[1]);
      }
      db.getCurrentUser().then((user) => {
        if (user) {
          db.saveOrUpdateUser({
            ...user,
            selectedModelId: value[1],
          });
        }
      });
    }
  };

  // Set cascader value from selectedProvider and selectedModelId
  const cascaderValue =
    selectedProvider && selectedModelId
      ? [selectedProvider, selectedModelId]
      : undefined;

  const handleProviderSetting = (providerType: string) => {
    setEditingProvider(providerType);
    setApiModalOpen(true);
  };

  const handleApiKeySave = async () => {
    setIsSavingApiKey(true);
    try {
      const user = await db.getCurrentUser();
      if (!user) {
        console.error("No user found");
        return;
      }
      const userModels = await db.getUserModels(user.id);
      const modelsToUpdate = userModels.filter(
        (m: any) => m.type === editingProvider
      );
      if (modelsToUpdate.length === 0) {
        console.error("No models found for provider:", editingProvider);
        return;
      }

      await db.updateModels(
        modelsToUpdate.map((model) => ({
          ...model,
          apiKey: apiKeyInput,
        }))
      );
      setApiModalOpen(false);
      setApiKeyInput("");
    } catch (error) {
      console.error("Error saving API key:", error);
    } finally {
      setIsSavingApiKey(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        padding: "0 16px",
        height: "44px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          height: "44px",
          gap: "12px",
        }}
      >
        <button
          onClick={setShowConversationList}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            color: "#6b7280",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            transition: "all 0.2s",
            borderRadius: "8px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#374151";
            e.currentTarget.style.backgroundColor = "#F3F4F6";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#6b7280";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageCircleMore size={20} />
          </div>
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ width: "200px" }}>
          <ModelCascader
            providerGroups={providerGroups as ProviderGroup[]}
            value={cascaderValue as [string, string]}
            onChange={handleCascaderChange}
            onProviderSetting={handleProviderSetting}
          />
        </div>
        <button
          onClick={createNewConversation}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            color: "#6b7280",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            transition: "all 0.2s",
            borderRadius: "8px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#374151";
            e.currentTarget.style.backgroundColor = "#F3F4F6";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#6b7280";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <SquarePen size={20} />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            height: "44px",
            color: showSettings ? "#111827" : "#6b7280",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            transition: "all 0.2s",
            borderRadius: "8px",
          }}
          onMouseOver={(e) => {
            if (!showSettings) {
              e.currentTarget.style.color = "#374151";
              e.currentTarget.style.backgroundColor = "#F3F4F6";
            }
          }}
          onMouseOut={(e) => {
            if (!showSettings) {
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          <SettingsIcon size={20} />
        </button>
      </div>

      {/* API Key Modal */}
      <Modal
        open={apiModalOpen}
        onCancel={() => setApiModalOpen(false)}
        footer={null}
        centered
        closable
        style={{
          background: "#fff",
          borderRadius: 10,
          color: "#111",
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
          Set API Key for:
          {editingProvider
            ? editingProvider.charAt(0).toUpperCase() + editingProvider.slice(1)
            : ""}
        </div>
        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>
          {editingProvider
            ? `${editingProvider.charAt(0).toUpperCase() + editingProvider.slice(1)} API Key`
            : "API Key"}
        </div>
        <div style={{ width: "100%" }}>
          <input
            placeholder={`${editingProvider ? editingProvider.charAt(0).toUpperCase() + editingProvider.slice(1) + " API Key" : "API Key"}`}
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            style={{
              width: "100%",
              height: 32,
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              background: "#fafafa",
              color: "#111",
              padding: "0 8px",
              marginBottom: 10,
              fontSize: 13,
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              width: "100%",
            }}
          >
            <button
              style={{
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "7px 0",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                width: "100%",
                marginBottom: 8,
                boxSizing: "border-box",
              }}
              onClick={handleApiKeySave}
            >
              Save
            </button>
            <button
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "7px 0",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                width: "100%",
                boxSizing: "border-box",
              }}
              onClick={() => setApiModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Header;
