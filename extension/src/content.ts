// 监听来自 Web 端的消息
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data && event.data.type === "FROM_WEB_TO_EXTENSION") {
    // 保存 API key 到 chrome.storage.local
    chrome.storage.local.set({
      apiKey: event.data.apiKey,
    });
  }
});

// 支持插件端主动请求 API Key
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_API_KEY") {
    const apiKey = localStorage.getItem("apiKey");
    sendResponse({ apiKey });
  }
  return true;
});
