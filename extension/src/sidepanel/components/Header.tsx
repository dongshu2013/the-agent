import { MessageCircleMore, SquarePen, Settings } from "lucide-react";
import { db } from "~/utils/db";
import React, { useState, useEffect } from "react";

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
  const [models, setModels] = useState<
    { id: string; type: string; name: string; userId: string }[]
  >([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      const user = await db.getCurrentUser();
      if (user) {
        setSelectedModelId(
          !user.selectedModelId || user.selectedModelId === ""
            ? "system"
            : user.selectedModelId
        );
        const userModels = await db.getUserModels(user.id);
        setModels(userModels);
      }
    };
    init();
  }, []);

  const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = e.target.value;
    setSelectedModelId(newModelId);
    if (onModelChange) {
      onModelChange(newModelId);
    }
    const user = await db.getCurrentUser();
    if (user) {
      await db.saveOrUpdateUser({
        ...user,
        selectedModelId: newModelId,
      });
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
      <div style={{ display: "flex", alignItems: "center", height: "44px", gap: "12px" }}>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageCircleMore size={20} />
          </div>
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <select
          value={selectedModelId}
          onChange={handleModelChange}
          style={{
            padding: "4px 8px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #D1D5DB",
            outline: "none",
            backgroundColor: "#ffffff",
            color: "#374151",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>

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
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
};

export default Header;
