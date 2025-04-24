import { Storage } from "@plasmohq/storage";
import { TabToolkit } from "../tools/tab-toolkit";
import { WebToolkit } from "../tools/web-toolkit";

const storage = new Storage();
const webToolkit = new WebToolkit();

chrome.runtime.onInstalled.addListener(async () => {
  console.log("Extension installed");
});

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

// 检查 chrome.action 是否存在
if (typeof chrome !== "undefined" && chrome.action) {
  chrome.action.onClicked.addListener(async (tab) => {
    await openSidePanel(tab);
  });
} else {
  console.error("chrome.action API is not available");
}

chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  console.log("Background script received message:", message);

  if (message.name === "ping") {
    console.log("Background script received ping");
    sendResponse({ success: true, message: "ping" });
  }

  // 处理工具调用消息
  if (message.name === "execute-tool") {
    const { name, arguments: params } = message.body;
    console.log("🍒Executing tool:", name, "with params:", params);

    (async () => {
      try {
        // 检查 chrome.tabs 是否可用
        if (!chrome?.tabs) {
          throw new Error("chrome.tabs API is not available");
        }

        // 处理 WebToolkit 调用
        if (name.startsWith("WebToolkit_")) {
          const toolName = name.replace("WebToolkit_", "");
          let result;
          // 执行 WebToolkit 操作
          switch (toolName) {
            case "getPageSource":
              result = await webToolkit.getPageSource(
                params.includeHtml,
                params.includeJs
              );
              break;
            case "screenshot":
              result = await webToolkit.screenshot(params.fullPage);
              break;
            case "findElement":
              result = await webToolkit.findElement(
                params.selector,
                params.timeout
              );
              break;
            case "inputElement":
              result = await webToolkit.inputElement(
                params.selector,
                params.value
              );
              break;
            case "clickElement":
              result = await webToolkit.clickElement(params.selector);
              break;
            case "scrollToElement":
              result = await webToolkit.scrollToElement(params.selector);
              break;
            case "waitForElement":
              result = await webToolkit.waitForElement(
                params.selector,
                params.timeout
              );
              break;
            case "extractText":
              result = await webToolkit.extractText(params.selector);
              break;
            case "extractAttribute":
              result = await webToolkit.extractAttribute(
                params.selector,
                params.attribute
              );
              break;
            default:
              throw new Error(`Unknown WebToolkit operation: ${toolName}`);
          }

          sendResponse({ success: true, data: result });
          return true;
        }

        // 处理 TabToolkit 调用
        const toolNoolName = name.replace("TabToolkit_", "");

        switch (toolNoolName) {
          case "openTab":
            const result = await TabToolkit.openTab(params.url);
            sendResponse(result);
            return true;
          case "listTabs":
            const listResult = await TabToolkit.listTabs();
            sendResponse(listResult);
            return true;
          case "closeTab":
            const closeResult = await TabToolkit.closeTab(params.tabId);
            sendResponse(closeResult);
            return true;
          case "switchToTab":
            const switchResult = await TabToolkit.switchToTab(params.tabId);
            sendResponse(switchResult);
            return true;
          case "waitForTabLoad":
            const waitForResult = await TabToolkit.waitForTabLoad(params.tabId);
            sendResponse(waitForResult);
            return true;
          case "getCurrentActiveTab":
            const getCurrentActiveTabResult =
              await TabToolkit.getCurrentActiveTab();
            sendResponse(getCurrentActiveTabResult);
            return true;
          default:
            sendResponse({
              success: false,
              error: `Tool ${name} not implemented in background script`,
            });
        }
      } catch (error: any) {
        console.error("Error executing tool in background:", error);
        sendResponse({ success: false, error: error.message || String(error) });
      }
    })();

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
