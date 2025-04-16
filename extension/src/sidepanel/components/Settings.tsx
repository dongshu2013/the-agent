import React, { useState, useEffect } from "react";
import { Storage } from "@plasmohq/storage";

// 配置项键名常量
const CONFIG_KEYS = {
  BACKEND_URL: "BACKEND_URL",
  API_ENDPOINT: "API_ENDPOINT",
  API_TOKEN: "API_TOKEN",
};

interface SettingsProps {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  setShowSettings: (value: boolean) => void;
  clearConversation: () => void;
}

const Settings = ({
  apiKey,
  setApiKey,
  setShowSettings,
  clearConversation,
}: SettingsProps) => {
  // 初始化存储
  const storage = new Storage();

  // 配置状态
  const [backendUrl, setBackendUrl] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // 加载当前配置
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const url = await storage.get(CONFIG_KEYS.BACKEND_URL);
        const endpoint = await storage.get(CONFIG_KEYS.API_ENDPOINT);
        const token = await storage.get(CONFIG_KEYS.API_TOKEN);

        setBackendUrl(url || "http://localhost:5000");
        setApiEndpoint(endpoint || "/v1/chat/completions");
        if (token) setApiKey(token);
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };

    loadConfig();
  }, [setApiKey]);

  // 保存配置
  const saveConfig = async () => {
    setIsSaving(true);
    setSaveMessage("");

    try {
      // 更新配置
      await storage.set(CONFIG_KEYS.BACKEND_URL, backendUrl);
      await storage.set(CONFIG_KEYS.API_ENDPOINT, apiEndpoint);
      await storage.set(CONFIG_KEYS.API_TOKEN, apiKey);

      // 发送消息给background脚本
      await chrome.runtime.sendMessage({
        name: "update-config",
        body: { key: CONFIG_KEYS.BACKEND_URL, value: backendUrl },
      });

      await chrome.runtime.sendMessage({
        name: "update-config",
        body: { key: CONFIG_KEYS.API_ENDPOINT, value: apiEndpoint },
      });

      await chrome.runtime.sendMessage({
        name: "update-config",
        body: { key: CONFIG_KEYS.API_TOKEN, value: apiKey },
      });

      setSaveMessage("设置已保存");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error) {
      console.error("Error saving config:", error);
      setSaveMessage("保存失败");
    } finally {
      setIsSaving(false);
    }
  };

  // 重置为默认配置
  const resetConfig = () => {
    setBackendUrl("http://localhost:5000");
    setApiEndpoint("/v1/chat/completions");
  };

  return (
    <div className="bg-white flex flex-col h-full w-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex-1"></div>
        <h1 className="text-xl font-medium text-center flex-1 text-gray-800">
          MIZU Agent Settings
        </h1>
        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            aria-label="Close settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 text-gray-800 overflow-y-auto">
        <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6">
          {/* API密钥设置 */}
          <section className="w-full">
            <h2 className="text-xl font-medium mb-4">用户认证</h2>
            <div className="space-y-2">
              <label
                htmlFor="apiKey"
                className="block text-sm font-medium text-gray-700"
              >
                API Token
              </label>
              <input
                id="apiKey"
                type="text"
                value={apiKey || ""}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="从网页端获取的认证令牌"
                className="w-full max-w-md py-2 px-3 border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 text-gray-800 focus:ring-blue-300"
              />
              <p className="text-xs text-gray-500">
                请在网页端登录后获取您的认证令牌，用于验证您的身份和访问权限。
              </p>
            </div>
          </section>

          {/* 服务器设置 */}
          <section className="w-full">
            <h2 className="text-xl font-medium mb-4">服务器设置</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="backendUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  后端服务器URL
                </label>
                <input
                  id="backendUrl"
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:5000"
                  className="w-full max-w-md py-2 px-3 border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 text-gray-800 focus:ring-blue-300"
                />
              </div>

              <div>
                <label
                  htmlFor="apiEndpoint"
                  className="block text-sm font-medium text-gray-700"
                >
                  API端点
                </label>
                <input
                  id="apiEndpoint"
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="/v1/chat/completions"
                  className="w-full max-w-md py-2 px-3 border rounded-md focus:outline-none focus:ring-2 bg-white border-gray-300 text-gray-800 focus:ring-blue-300"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={resetConfig}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  重置为默认值
                </button>

                <button
                  onClick={saveConfig}
                  disabled={isSaving}
                  className={`px-4 py-2 text-sm rounded-md text-white ${
                    isSaving ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {isSaving ? "保存中..." : "保存配置"}
                </button>
              </div>

              {saveMessage && (
                <p className="text-sm text-center text-green-600">
                  {saveMessage}
                </p>
              )}
            </div>
          </section>

          {/* 会话管理 */}
          <section className="w-full">
            <h2 className="text-xl font-medium mb-4">会话管理</h2>
            <div className="space-y-2">
              <button
                onClick={clearConversation}
                className="w-full py-2 max-w-md bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                  清除对话历史
                </div>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
