import { Storage } from "@plasmohq/storage";
import { ChromeMessage } from "../types";
import { env } from "../utils/env";

// 初始化存储
const storage = new Storage();

// 配置项键名
const CONFIG_KEYS = {
  API_KEY: "API_KEY",
};

// 设置默认配置
async function initializeConfig() {
  try {
    const apiKey = await storage.get(CONFIG_KEYS.API_KEY);
    if (!apiKey) {
      throw new Error(
        "No API Key found. User needs to provide one in settings."
      );
    }
  } catch (error) {
    console.error("Error initializing config:", error);
  }
}

// 检查API Key是否存在
async function checkApiKey(): Promise<string | null> {
  try {
    const apiKey = await storage.get(CONFIG_KEYS.API_KEY);
    return apiKey || null;
  } catch (error) {
    console.error("Error checking API key:", error);
    return null;
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

// 打开侧边栏
async function openSidePanel(tab: chrome.tabs.Tab) {
  if (!tab?.id) {
    console.error("Invalid tab id");
    return;
  }

  try {
    await chrome.sidePanel.setOptions({
      enabled: true,
      path: "sidepanel.html",
    });
    // @ts-ignore - sidePanel.open is available in Chrome 114+
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    console.error("Failed to open side panel:", error);
  }
}

// 检查并设置扩展图标点击事件
if (chrome.action) {
  chrome.action.onClicked.addListener(async (tab) => {
    await openSidePanel(tab);
  });
} else {
  console.error("chrome.action API is not available");
}

// 处理来自侧边面板的消息
chrome.runtime.onMessage.addListener(
  (message: ChromeMessage, sender, sendResponse) => {
    console.log("Background script received message:", message);

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
  }
);

// 更新右键菜单点击处理程序
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "mizu-agent" && info.selectionText && tab?.windowId) {
    await openSidePanel(tab);
  }
});
