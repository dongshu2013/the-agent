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
          } else {
            resolve({
              success: true,
              data: {
                tabId: tab.id,
                url: tab.url,
              },
            });
          }
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

  /**
   * Find a tab by URL or title
   */
  static async listTabs(): Promise<WebInteractionResult> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ currentWindow: true }, (tabs) => {
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
    return new Promise((resolve) => {
      chrome.tabs.update(tabId, { active: true }, (tab) => {
        console.log("tab 🍒", tab);
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else if (tab) {
          // Focus the window containing the tab
          chrome.windows.update(tab.windowId, { focused: true }, () => {
            console.log("window 🍒", window);
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
                title: tab.title,
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
