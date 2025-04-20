import { Storage } from "@plasmohq/storage";
import { TabToolkit } from "../tools/tab-toolkit";

// 初始化存储
const storage = new Storage();

// 设置面板行为
chrome.runtime.onInstalled.addListener(async () => {
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
      tabId: tab.id,
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

chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  console.log("Background script received message:", message);

  // 处理工具调用消息
  if (message.name === "execute-tool") {
    const { tool, params } = message.body;

    import("../tools/tab-toolkit")
      .then((module) => {
        const TabToolkit = module.TabToolkit;
        const methodName = tool.replace("TabToolkit_", "");

        switch (methodName) {
          case "openTab":
            return TabToolkit.openTab(params.url);
          case "closeTab":
            return TabToolkit.closeTab(params.tabId);
          case "findTab":
            return TabToolkit.findTab(params);
          case "switchToTab":
            return TabToolkit.switchToTab(params.tabId);
          case "waitForTabLoad":
            return TabToolkit.waitForTabLoad(params.tabId, params.timeout);
          case "getCurrentActiveTab":
            return TabToolkit.getCurrentActiveTab();
          case "handleTwitterSequence":
            return TabToolkit.handleTwitterSequence();
          default:
            throw new Error(`Tool ${tool} not implemented in TabToolkit`);
        }
      })
      .then((result) => {
        sendResponse({ success: true, result });
      })
      .catch((error) => {
        console.error("Error executing tool in background:", error);
        sendResponse({ success: false, error: error.message || String(error) });
      });

    return true;
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

// 更新右键菜单点击处理程序
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "mizu-agent" && info.selectionText && tab?.windowId) {
    await openSidePanel(tab);
  }
});
