import {
  MessageCircleMore,
  SquarePen,
  Settings as SettingsIcon,
} from "lucide-react";
import { db } from "~/utils/db";
import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import ModelCascader, { ProviderGroup } from "./ModelCascader";

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
    const init = async () => {
      const user = await db.getCurrentUser();
      console.log("user", user);
      if (user) {
        const userModels = await db.getUserModels(user.id);
        console.log("userModels", userModels);
        // 构建 fullProviderGroups（含完整模型信息）
        const fullGroups: Record<string, any> = {};
        userModels.forEach((model) => {
          if (!fullGroups[model.type]) {
            fullGroups[model.type] = {
              type: model.type,
              models: [],
            };
          }
          fullGroups[model.type].models.push(model); // 保留完整对象
        });
        const fullProviderGroups = Object.values(fullGroups);

        // 构建 providerGroups（只含 id, name）
        const providerGroups = fullProviderGroups.map((g: any) => ({
          type: g.type,
          models: g.models.map((m: any) => ({ id: m.id, name: m.name })),
        }));
        console.log("groupArr", providerGroups);
        setProviderGroups(providerGroups);
        // Set default provider/model
        if (providerGroups.length > 0) {
          setSelectedProvider((prev) => prev || providerGroups[0].type);
          const firstModel = providerGroups[0].models[0];
          setSelectedModelId(
            (prev) => prev || (firstModel ? firstModel.id : "")
          );
        }
      }
    };
    init();
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

  // Use string label for both provider and model
  const cascaderOptions = providerGroups.map((provider) => ({
    value: provider.type,
    label: provider.type.charAt(0).toUpperCase() + provider.type.slice(1),
    children: provider.models.map((model) => ({
      value: model.id,
      label: model.name,
    })),
  }));

  // Only show the model name in the input after selection
  const displayRender = (labels: string[]) => labels[labels.length - 1] || "";

  // optionRender for v5: show icon, name, and settings button for provider rows only
  const optionRender = (option: any, context?: { level: number }) => {
    console.log("optionRender", option, context);
    if (context && context.level === 0) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* providerIcons[option.value] || providerIcons.default */}
            <span>{option.label}</span>
          </div>
          <SettingsIcon
            size={18}
            style={{ marginLeft: 8, cursor: "pointer", color: "#aaa" }}
            onClick={(e) => {
              e.stopPropagation();
              handleProviderSetting(option.value);
            }}
          />
        </div>
      );
    }
    // model row or context is undefined
    return <span>{option.label}</span>;
  };

  // Handler for cascader change
  const handleCascaderChange = (value: string[]) => {
    // value: [providerType, modelId]
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
      // Update all models for this provider with the new API key
      const user = await db.getCurrentUser();
      if (user) {
        const userModels = await db.getUserModels(user.id);
        const modelsToUpdate = userModels.filter(
          (m: any) => m.type === editingProvider
        );
        for (const model of modelsToUpdate) {
          await db.addOrUpdateModel({
            ...model,
            apiKey: apiKeyInput,
            type: editingProvider || "",
          });
        }
        // Refresh provider groups
        const groups: Record<string, ProviderGroup> = {};
        userModels.forEach((model: any) => {
          if (!groups[model.type]) {
            groups[model.type] = {
              type: model.type,
              models: [],
            };
          }
          groups[model.type].models.push({ id: model.id, name: model.name });
        });
        setProviderGroups(Object.values(groups));
      }
      setApiModalOpen(false);
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
        <ModelCascader
          providerGroups={providerGroups as ProviderGroup[]}
          value={cascaderValue as [string, string]}
          onChange={handleCascaderChange}
          onProviderSetting={handleProviderSetting}
        />
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
        width={500}
        bodyStyle={{
          background: "#181818",
          borderRadius: 20,
          color: "#fff",
          padding: 32,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
          设置 API 密钥：
          {editingProvider
            ? editingProvider.charAt(0).toUpperCase() + editingProvider.slice(1)
            : ""}
        </div>
        <div style={{ color: "#f87171", marginBottom: 16 }}>
          您的密钥将永远有效
        </div>
        <div style={{ marginBottom: 16 }}>
          <select
            style={{ width: 220, height: 40, borderRadius: 12, fontSize: 16 }}
          >
            <option>Expires in 12 hours</option>
          </select>
        </div>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>OpenAI API Key</div>
        <input
          placeholder="输入值：OpenAI API Key"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          style={{
            width: "100%",
            height: 40,
            borderRadius: 8,
            border: "1px solid #333",
            background: "#222",
            color: "#fff",
            padding: "0 12px",
            marginBottom: 24,
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 16 }}>
          <button
            style={{
              background: "#dc2626",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 32px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
            onClick={() => setApiModalOpen(false)}
          >
            Cancel
          </button>
          <button
            style={{
              background: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 32px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
            onClick={handleApiKeySave}
          >
            Save
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Header;
