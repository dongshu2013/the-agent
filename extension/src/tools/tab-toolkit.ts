export interface WebInteractionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class TabToolkit {
  /**
   * Open a new tab with a specific URL
   */
  static async openTab(url: string): Promise<WebInteractionResult> {
    try {
      const existingTabs = await chrome.tabs.query({});

      const matchedTab = existingTabs.find((tab) => tab.url === url);

      if (matchedTab && matchedTab.id !== undefined) {
        return {
          success: true,
          data: {
            tabId: matchedTab.id,
            alreadyOpened: true,
          },
        };
      }

      // 没有找到，创建新 tab
      return new Promise((resolve) => {
        chrome.tabs.create({ url }, (newTab) => {
          if (chrome.runtime.lastError) {
            resolve({
              success: false,
              error: chrome.runtime.lastError.message,
              data: {
                tabId: newTab.id!,
                alreadyOpened: false,
              },
            });
            return;
          }

          resolve({
            success: true,
            data: {
              tabId: newTab.id!,
              alreadyOpened: true,
            },
          });
        });
      });
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Close a specific tab
   */
  static closeTab(tabId: number): Promise<WebInteractionResult> {
    return new Promise((resolve) => {
      chrome.tabs.remove(tabId, () => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else {
          resolve({
            success: true,
            data: { tabId },
          });
        }
      });
    });
  }

  /**
   * Find a tab by URL or title
   */
  static async listTabs(): Promise<WebInteractionResult> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
        console.log("listTabs 🍒", tabs);
        if (chrome.runtime.lastError) {
          reject({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else {
          resolve({
            success: true,
            data: tabs.map((tab) => ({
              tabId: tab.id,
              url: tab.url,
              title: tab.title,
            })),
          });
        }
      });
    });
  }

  /**
   * Switch to a specific tab
   */
  static switchToTab(tabId: number): Promise<WebInteractionResult> {
    console.log("switchToTab 🍒", tabId);
    return new Promise((resolve) => {
      chrome.tabs.update(tabId, { active: true }, (tab) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else if (tab) {
          // Focus the window containing the tab
          chrome.windows.update(tab.windowId, { focused: true }, () => {
            resolve({
              success: true,
              data: {
                tabId: tab.id,
                url: tab.url,
              },
            });
          });
        } else {
          console.log("Failed to switch to tab");
          resolve({
            success: false,
            error: "Failed to switch to tab",
          });
        }
      });
    });
  }

  /**
   * Wait for a tab to load
   */
  static waitForTabLoad(
    tabId: number,
    timeout: number = 10000
  ): Promise<WebInteractionResult> {
    return new Promise((resolve) => {
      const start = Date.now();

      const check = () => {
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError) {
            return resolve({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          }

          if (!tab) {
            return resolve({
              success: false,
              error: "Tab not found",
            });
          }

          if (tab.status === "complete") {
            return resolve({
              success: true,
              data: {
                tabId: tab.id!,
                url: tab.url!,
                title: tab.title ?? "",
              },
            });
          }

          if (Date.now() - start > timeout) {
            return resolve({
              success: false,
              error: "Tab load timeout",
            });
          }

          setTimeout(check, 200); // 稍微拉长间隔，减少资源占用
        });
      };

      check();
    });
  }

  /**
   * Get current active tab
   */
  static getCurrentActiveTab(): Promise<WebInteractionResult> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        console.log("getCurrentActiveTab 🍒", tabs);
        if (tabs.length > 0 && tabs[0].id) {
          resolve({
            success: true,
            data: {
              tabId: tabs[0].id,
              url: tabs[0].url,
              title: tabs[0].title,
            },
          });
        } else {
          resolve({
            success: false,
            error: "No active tab found",
          });
        }
      });
    });
  }

  /**
   * Create a popup window for the extension
   * @param url URL to load in the popup
   * @param width Optional width of the popup (default: 400)
   * @param height Optional height of the popup (default: 600)
   */
  static createPopupWindow(
    url: string,
    width: number = 400,
    height: number = 600
  ): Promise<WebInteractionResult> {
    return new Promise((resolve) => {
      const createData: chrome.windows.CreateData = {
        url,
        type: "popup",
        width,
        height,
        focused: true,
      };

      chrome.windows.create(createData, (window) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else if (window && window.tabs && window.tabs[0]?.id) {
          resolve({
            success: true,
            data: {
              windowId: window.id,
              tabId: window.tabs[0].id,
              url: window.tabs[0].url,
            },
          });
        } else {
          resolve({
            success: false,
            error: "Failed to create popup window",
          });
        }
      });
    });
  }

  /**
   * Close a specific window
   */
  static closeWindow(windowId: number): Promise<WebInteractionResult> {
    return new Promise((resolve) => {
      chrome.windows.remove(windowId, () => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else {
          resolve({
            success: true,
            data: { windowId },
          });
        }
      });
    });
  }
}
