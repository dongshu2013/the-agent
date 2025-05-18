window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data && event.data.type === "FROM_WEB_TO_EXTENSION") {
    chrome.storage.local.set({
      apiKey: event.data.apiKey,
    });
  }
});
