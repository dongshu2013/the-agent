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
  // 初始化配置
  await initializeConfig();

  // 设置侧边面板在点击扩展图标时打开
  if (chrome.sidePanel) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error("Error setting panel behavior:", error));
  }

  // 添加右键菜单
  chrome.contextMenus.create({
    id: "mizu-agent",
    title: "Analyze with MIZU",
    contexts: ["selection"],
  });

  console.log("MIZU Agent Extension installed successfully");
});

// 添加点击处理程序作为备用
chrome.action.onClicked.addListener((tab) => {
  // 当点击扩展图标时强制打开侧边面板
  try {
    if (chrome.sidePanel) {
      // 检查是否可以为此窗口打开侧边面板
      if (tab.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
      }
    }
  } catch (error) {
    console.error("Error opening side panel:", error);
  }
});

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

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "mizu-agent" && info.selectionText) {
    // 打开侧边面板并发送选中的文本
    if (tab?.windowId && chrome.sidePanel) {
      chrome.sidePanel.open({ windowId: tab.windowId }).then(() => {
        // 发送选中的文本到侧边面板
        chrome.runtime.sendMessage({
          name: "selected-text",
          text: info.selectionText,
        });
      });
    }
  }
});
