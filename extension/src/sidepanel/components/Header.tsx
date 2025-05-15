import { MessageCircleMore, SquarePen, User as UserIcon } from "lucide-react";
import { db, systemModelId } from "~/utils/db";
import { useState, useEffect } from "react";
import { Modal, Dropdown } from "antd";
import ModelCascader, { ProviderGroup } from "./ModelCascader";
import { useLiveQuery } from "dexie-react-hooks";
import { Model } from "~/types";
import { ItemType } from "antd/es/menu/interface";

interface HeaderProps {
  createNewConversation: () => void;
  setShowConversationList: (value?: boolean) => void;
  onModelChange?: (model: string) => void;
}

const Header = ({
  createNewConversation,
  setShowConversationList,
  onModelChange,
}: HeaderProps) => {
  const [providerGroups, setProviderGroups] = useState<ProviderGroup[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const user = useLiveQuery(() => db.getCurrentUser(), []);
  const models = useLiveQuery(
    () => (user?.id ? db.getUserModels(user.id) : []),
    [user?.id]
  );

  useEffect(() => {
    const init = async () => {
      console.log("user", user);
      if (user) {
        // 构建 fullProviderGroups（含完整模型信息）
        const fullGroups: Record<string, any> = {};
        (models ?? []).forEach((model) => {
          if (!fullGroups[model.type]) {
            fullGroups[model.type] = {
              type: model.type,
              models: [],
            };
          }
          fullGroups[model.type].models.push(model);
        });
        const fullProviderGroups = Object.values(fullGroups);

        const providerGroups = fullProviderGroups.map((g: any) => ({
          type: g.type,
          models: g.models.map((m: any) => ({ id: m.id, name: m.name })),
        }));
        console.log("groupArr", providerGroups);
        setProviderGroups(providerGroups);
        // Set default provider/model
        if (providerGroups.length > 0) {
          if (user?.selectedModelId) {
            let found = false;
            let defaultProvider = providerGroups[0].type;
            let defaultModelId = systemModelId;

            providerGroups.forEach((group) => {
              const match = group.models.find(
                (m: Model) => m.id === user.selectedModelId
              );
              if (match) {
                defaultProvider = group.type;
                defaultModelId = match.id;
                found = true;
              }
            });

            if (!found) {
              providerGroups.forEach((group) => {
                const match = group.models.find(
                  (m: Model) => m.id === systemModelId
                );
                if (match) {
                  defaultProvider = group.type;
                  defaultModelId = systemModelId;
                }
              });
            }

            setSelectedProvider(defaultProvider);
            setSelectedModelId(defaultModelId);
          }
        }
      }
    };
    init();
  }, [user, models]);

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
    } catch (error) {
      console.error("Failed to save API key:", error);
    }
  };

  const menuItems = [
    {
      key: "profile",
      label: user?.email || user?.username || "User",
      disabled: true,
    },
    {
      type: "divider",
    },
    // Add more items as needed
    {
      key: "view-profile",
      label: "View Profile",
      onClick: () => {
        window.open(process.env.PLASMO_PUBLIC_WEB_URL || "", "_blank");
      },
    },
  ];

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
          onClick={() => setShowConversationList(true)}
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
        <Dropdown
          menu={{ items: menuItems as ItemType[] }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              background: "#f3f4f6",
              cursor: "pointer",
              overflow: "hidden",
            }}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.username || "User"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <UserIcon size={20} color="#6b7280" />
            )}
          </button>
        </Dropdown>
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
          Set API Key:
          {editingProvider
            ? editingProvider.charAt(0).toUpperCase() + editingProvider.slice(1)
            : ""}
        </div>

        <div
          style={{
            width: "100%",
            gap: 12,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <input
            placeholder={`Enter ${editingProvider ? editingProvider.charAt(0).toUpperCase() + editingProvider.slice(1) + " API Key" : "API Key"}`}
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
