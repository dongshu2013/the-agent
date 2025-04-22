import { sendChatCompletion } from "~/services/chat";
import { indexedDB } from "../utils/db";

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
      return new Promise((resolve) => {
        chrome.tabs.create({ url }, async (tab) => {
          if (chrome.runtime.lastError) {
            resolve({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }

          if (!tab || !tab.id) {
            resolve({
              success: false,
              error: "Failed to create tab: no tab ID returned",
            });
            return;
          }

          // 保存到标签页表
          try {
            await indexedDB.saveTab({
              tabId: tab.id,
              url: tab.url || "",
              title: tab.title,
              type: "openTab",
            });
          } catch (error) {
            console.error("Failed to save tab info to IndexedDB:", error);
          }

          resolve({
            success: true,
            data: {
              tabId: tab.id,
              url: tab.url,
            },
          });
        });
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
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

  static async listTabs(): Promise<WebInteractionResult> {
    return new Promise((resolve) => {
      chrome.tabs.query({}, async (tabs) => {
        const tablist = await sendChatCompletion({
          messages: [
            {
              role: "user",
              content: `请根据以下标签页列表，返回一个包含所有标签页信息的列表：${JSON.stringify(tabs)}`,
            },
          ],
        });
        console.log("tablist 🍒", tablist);
        resolve({
          success: true,
          data: tabs,
        });
      });
    });
  }

  /**
   * Find a tab by URL or title
   */
  static async findTab(query: {
    url?: string | RegExp;
    title?: string | RegExp;
  }): Promise<WebInteractionResult> {
    try {
      // const tablist = await this.listTabs();
      // 首先从当前标签页中查找
      const currentTabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          console.log("tabs 🍒", tabs);
          resolve(tabs);
        });
      });

      const matchingCurrentTabs = currentTabs.filter((tab) => {
        const urlMatch = query.url
          ? typeof query.url === "string"
            ? tab.url === query.url
            : query.url.test(tab.url || "")
          : true;

        const titleMatch = query.title
          ? typeof query.title === "string"
            ? tab.title === query.title
            : query.title.test(tab.title || "")
          : true;

        return urlMatch && titleMatch;
      });

      // 如果找到当前标签页，直接返回
      if (matchingCurrentTabs.length > 0) {
        return {
          success: true,
          data: matchingCurrentTabs.map((tab) => ({
            tabId: tab.id,
            url: tab.url,
            title: tab.title,
          })),
        };
      }

      // 如果没有找到当前标签页，从 IndexedDB 中查找历史记录
      const dbTabs = await indexedDB.getAllTabs();
      const matchingDbTabs = dbTabs.filter((tab) => {
        const urlMatch = query.url
          ? typeof query.url === "string"
            ? tab.url === query.url
            : query.url.test(tab.url || "")
          : true;

        const titleMatch = query.title
          ? typeof query.title === "string"
            ? tab.title === query.title
            : query.title.test(tab.title || "")
          : true;

        return urlMatch && titleMatch;
      });

      if (matchingDbTabs.length > 0) {
        return {
          success: true,
          data: matchingDbTabs.map((tab) => ({
            tabId: tab.tabId,
            url: tab.url,
            title: tab.title,
          })),
        };
      }

      return {
        success: false,
        error: "No matching tabs found",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Switch to a specific tab
   */
  static switchToTab(tabId: number): Promise<WebInteractionResult> {
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
      const startTime = Date.now();

      const checkTabStatus = () => {
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError) {
            resolve({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }

          if (tab.status === "complete") {
            resolve({
              success: true,
              data: {
                tabId: tab.id,
                url: tab.url,
              },
            });
          } else if (Date.now() - startTime > timeout) {
            resolve({
              success: false,
              error: "Tab load timeout",
            });
          } else {
            // Retry after a short delay
            setTimeout(checkTabStatus, 100);
          }
        });
      };

      checkTabStatus();
    });
  }

  /**
   * Get current active tab
   */
  static getCurrentActiveTab(): Promise<WebInteractionResult> {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
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

  /**
   * Handle Twitter tab sequence
   */
  // static async handleTwitterSequence(): Promise<WebInteractionResult> {
  //   try {
  //     // Step 1: Open Twitter tab
  //     const openResult = await TabToolkit.openTab("https://twitter.com");
  //     if (!openResult.success || !openResult.data?.tabId) {
  //       return {
  //         success: false,
  //         error: "Failed to open Twitter tab",
  //       };
  //     }
  //     const twitterTabId = openResult.data.tabId;

  //     // Step 2: Wait for the tab to load
  //     await TabToolkit.waitForTabLoad(twitterTabId);

  //     // Step 3: Get current active tab (to switch back to later)
  //     const currentTabResult = await TabToolkit.getCurrentActiveTab();
  //     if (!currentTabResult.success || !currentTabResult.data?.tabId) {
  //       return {
  //         success: false,
  //         error: "Failed to get current tab",
  //       };
  //     }
  //     const originalTabId = currentTabResult.data.tabId;

  //     // Step 4: Switch to original tab
  //     await TabToolkit.switchToTab(originalTabId);

  //     // Step 5: Wait a moment (for demonstration)
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     // Step 6: Switch back to Twitter tab
  //     await TabToolkit.switchToTab(twitterTabId);

  //     // Step 7: Wait a moment (for demonstration)
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     // Step 8: Close Twitter tab
  //     const closeResult = await TabToolkit.closeTab(twitterTabId);
  //     if (!closeResult.success) {
  //       return {
  //         success: false,
  //         error: "Failed to close Twitter tab",
  //       };
  //     }

  //     return {
  //       success: true,
  //       data: {
  //         message: "Twitter tab sequence completed successfully",
  //       },
  //     };
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error: `Twitter sequence failed: ${error.message}`,
  //     };
  //   }
  // }
}
