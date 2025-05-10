import {
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
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
        height: "64px",
        borderBottom: "1px solid #E5E7EB",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={setShowConversationList}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
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
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
        </button>
        <span
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#111827",
          }}
        >
          Mysta Agent
        </span>
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
            width: "40px",
            height: "40px",
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            color: showSettings ? "#2563EB" : "#6b7280",
            background: showSettings ? "#EFF6FF" : "none",
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
          <Cog6ToothIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Header;
