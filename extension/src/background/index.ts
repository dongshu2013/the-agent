import { sendChatRequest } from "../services/api";
import { Storage } from "@plasmohq/storage";

// 初始化存储
const storage = new Storage();

// 配置项键名
const CONFIG_KEYS = {
  BACKEND_URL: "BACKEND_URL",
  API_ENDPOINT: "API_ENDPOINT",
  API_TOKEN: "API_TOKEN",
};

// 默认配置
const DEFAULT_CONFIG = {
  [CONFIG_KEYS.BACKEND_URL]: "http://localhost:8000",
  [CONFIG_KEYS.API_ENDPOINT]: "/v1/chat/completions",
};

// 设置默认配置
async function initializeConfig() {
  try {
    // 检查并设置默认配置
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      const existingValue = await storage.get(key);
      if (!existingValue) {
        await storage.set(key, value);
        console.log(`Set default config: ${key} = ${value}`);
      }
    }

    // 检查是否已有 API Token
    const apiToken = await storage.get(CONFIG_KEYS.API_TOKEN);
    if (!apiToken) {
      console.log("No API Token found. User needs to provide one in settings.");
    } else {
      console.log("API Token found in storage.");
    }
  } catch (error) {
    console.error("Error initializing config:", error);
  }
}

// 设置面板行为
chrome.runtime.onInstalled.addListener(async () => {
  await initializeConfig();

  // 添加右键菜单
  chrome.contextMenus.create({
    id: "mizu-agent",
    title: "Analyze with MIZU",
    contexts: ["selection"],
  });
});

// 检查并设置扩展图标点击事件
if (chrome.action) {
  chrome.action.onClicked.addListener(async (tab) => {
    console.log("Extension icon clicked", tab);

    if (!tab?.id) {
      console.error("Invalid tab id");
      return;
    }

    try {
      // 检查是否支持侧边栏
      if (chrome.sidePanel) {
        try {
          // 尝试使用侧边栏
          await chrome.sidePanel.setOptions({
            enabled: true,
            path: "sidepanel.html",
          });
          await chrome.sidePanel.open({ windowId: tab.windowId });
          console.log("Side panel opened successfully");
          return;
        } catch (sidePanelError) {
          console.error("Failed to open side panel:", sidePanelError);
        }
      }

      // 如果侧边栏不可用或打开失败，使用弹出窗口
      console.log("Falling back to popup window");
      await chrome.windows.create({
        url: chrome.runtime.getURL("sidepanel.html"),
        type: "popup",
        width: 400,
        height: 600,
        top: 20,
        left: screen.availWidth - 420,
      });
      console.log("Popup window opened successfully");
    } catch (error) {
      console.error("Error in extension click handler:", error);
    }
  });
} else {
  console.error("chrome.action API is not available");
}

// 处理来自侧边面板的消息
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  console.log("Background script received message:", message);

  // 处理process-request消息
  if (message.name === "process-request") {
    const { apiKey, request } = message.body;
    console.log("Processing request:", { request, hasApiKey: !!apiKey });

    // 使用API服务处理请求
    (async () => {
      try {
        // 发送请求到后端
        console.log("Preparing chat request with message:", request);
        const chatRequest = {
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant named MIZU Agent. Answer questions succinctly and professionally.",
            },
            {
              role: "user",
              content: request,
            },
          ],
        };
        console.log("Full chat request payload:", chatRequest);

        const response = await sendChatRequest(chatRequest, apiKey);
        console.log("Raw API response:", response);

        if (!response.success) {
          console.error("API request failed:", response.error);
          throw new Error(
            response.error || "Failed to get response from model"
          );
        }

        console.log("Received successful response from backend");

        // 从响应中提取回答内容
        const result = response.data.choices[0].message.content;
        console.log("Final chat response:", result);

        // 发送回答给UI
        sendResponse({
          result,
          error: null,
        });
      } catch (error) {
        console.error("Error processing request:", error);
        sendResponse({
          result: null,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred while processing the request",
        });
      }
    })();

    return true; // 用于异步响应
  }

  // 处理配置更新消息
  if (message.name === "update-config") {
    // 更新配置
    (async () => {
      try {
        const { key, value } = message.body;
        await storage.set(key, value);
        console.log(`Updated config: ${key} = ${value}`);
        sendResponse({ success: true });
      } catch (error) {
        console.error("Error updating config:", error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    })();

    return true; // 用于异步响应
  }

  // 处理来自content script的右键菜单文本选择
  if (message.name === "selected-text") {
    // 处理选中的文本
    console.log("Selected text received");
  }
});

// 更新右键菜单点击处理程序以保持一致性
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "mizu-agent" && info.selectionText && tab?.windowId) {
    // 使用 windowId 打开侧边栏
    chrome.sidePanel
      .setOptions({
        enabled: true,
        path: "sidepanel.html",
      })
      .then(() => {
        chrome.sidePanel.open({ windowId: tab.windowId }).then(() => {
          chrome.runtime.sendMessage({
            name: "selected-text",
            text: info.selectionText,
          });
        });
      });
  }
});
