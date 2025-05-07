export interface WebInteractionResult {
  success: boolean;
  data?: any;
  error?: string;
}

const TAB_LOAD_TIMEOUT = 10000;

export class TabToolkit {
  /**
   * Open a new tab with a specific URL
   */
  static async openTab(url: string): Promise<WebInteractionResult> {
    try {
      const existingTabs = await chrome.tabs.query({});
      const matchedTab = existingTabs.find((tab) => tab.url === url);

      if (matchedTab && matchedTab.id !== undefined) {
        // 只调用 switchToTab，让它负责等待
        const switchResult = await TabToolkit.switchToTab(matchedTab.id);
        if (switchResult.success) {
          return {
            success: true,
            data: {
              tabId: matchedTab.id,
              alreadyOpened: true,
              url: switchResult.data.url,
              title: switchResult.data.title,
            },
          };
        } else {
          return {
            success: false,
            error: switchResult.error || "Failed to switch to existing tab",
            data: {
              tabId: matchedTab.id,
              alreadyOpened: true,
            },
          };
        }
      }

      // 新建 tab 并等待加载完成
      return new Promise((resolve) => {
        chrome.tabs.create({ url }, async (newTab) => {
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

          // 等待新 tab 加载完成
          const loadResult = await TabToolkit.waitForTabLoad(
            newTab.id!,
            TAB_LOAD_TIMEOUT
          );
          if (loadResult.success) {
            resolve({
              success: true,
              data: {
                tabId: newTab.id!,
                alreadyOpened: false,
                url: loadResult.data.url,
                title: loadResult.data.title,
              },
            });
          } else {
            resolve({
              success: false,
              error: loadResult.error || "Failed to load new tab",
              data: {
                tabId: newTab.id!,
                alreadyOpened: false,
              },
            });
          }
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
  static async switchToTab(tabId: number): Promise<WebInteractionResult> {
    console.log("switchToTab 🍒", tabId);
    return new Promise((resolve) => {
      chrome.tabs.update(tabId, { active: true }, async (tab) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else if (tab) {
          // Focus the window containing the tab
          chrome.windows.update(tab.windowId, { focused: true }, async () => {
            // 等待页面加载完成
            const loadResult = await TabToolkit.waitForTabLoad(
              tabId,
              TAB_LOAD_TIMEOUT
            );
            if (loadResult.success) {
              resolve({
                success: true,
                data: {
                  tabId: tab.id,
                  url: loadResult.data.url,
                  title: loadResult.data.title,
                },
              });
            } else {
              resolve({
                success: false,
                error: loadResult.error || "Failed to load tab",
              });
            }
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
    timeout: number = TAB_LOAD_TIMEOUT
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

          if (tab.status === "complete" || tab.status === "interactive") {
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
