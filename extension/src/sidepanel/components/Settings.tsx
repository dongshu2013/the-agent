import React, { useState, useEffect } from "react";
import { Storage } from "@plasmohq/storage";

interface SettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ apiKey, setApiKey }) => {
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
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-y-0 right-0  shadow-xl"
        style={{
          top: "50px",
          backgroundColor: "#fff",
          height: "300px",
          padding: "20px",
        }}
      >
        <h2 className="text-xl font-medium" style={{ color: "#111827" }}>
          Your API Key
        </h2>

        {/* Content */}
        <div className="gap-4">
          <div className="space-y-6">
            {/* Description */}
            <p className="text-sm" style={{ color: "#4B5563" }}>
              Use this API key to authenticate requests to the MIZU Agent API.
            </p>

            {/* API Key Input */}
            <input
              id="api-key"
              type="password"
              value={tempApiKey || ""}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="text-sm rounded-md px-4 py-2 mb-4"
              style={{
                backgroundColor: "#fff",
                borderColor: "#D1D5DB",
                color: "#111827",
                border: "1px solid #D1D5DB",
                width: "90%",
              }}
            />

            <button
              onClick={handleSave}
              className="w-full rounded-md text-sm font-medium py-2 px-4"
              style={{
                backgroundColor: "#3B82F6",
                color: "#fff",
                borderColor: "#3B82F6",
                border: "none",
              }}
            >
              Save
            </button>
            {saveStatus && (
              <span
                className="ml-3 text-sm"
                style={{
                  color: saveStatus.includes("Failed") ? "#DC2626" : "#059669",
                }}
              >
                {saveStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
