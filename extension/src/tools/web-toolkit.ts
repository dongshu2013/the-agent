import { parseHtml, minify } from "./dom-parser";

export interface WebInteractionResult {
  success: boolean;
  data?: any;
  error?: string | null;
}

interface PageSourceResult {
  html: string;
  js: string[];
  url: string;
  title: string;
  links: { text: string | null; href: string | null }[];
}

interface WebToolkitResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class WebToolkit {
  private async executeInTab<T>(fn?: () => any): Promise<T> {
    try {
      const tabs = await chrome.tabs.query({
        currentWindow: true,
        status: "complete",
      });

      if (!tabs || tabs.length === 0) {
        throw new Error("No tabs found in current window");
      }

      const activeTab = tabs.find((tab) => tab.active) || tabs[0];

      if (!activeTab?.id) {
        throw new Error("Invalid tab ID");
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: (userFuncString: string) => {
          try {
            if (!userFuncString) {
              // 如果没有传入函数，则返回页面内容
              const html = document.documentElement.outerHTML;
              return {
                html,
                url: window.location.href,
                title: document.title,
              };
            }

            // 执行传入的函数
            const userFunc = new Function("return " + userFuncString)();
            return userFunc();
          } catch (error) {
            console.error("Error in content script execution:", error);
            throw error;
          }
        },
        args: [fn ? fn.toString() : ""],
      });

      if (!results || results.length === 0 || !results[0].result) {
        throw new Error("No results returned from script execution");
      }

      return results[0].result as T;
    } catch (error) {
      console.error("Error executing in tab:", error);
      throw error;
    }
  }

  async getPageSource(
    includeHtml: boolean = true
  ): Promise<WebToolkitResponse> {
    try {
      const result = await this.executeInTab<PageSourceResult>();

      if (!result || !result.html) {
        throw new Error("No result returned from page");
      }

      // 使用dom-parser处理HTML
      const domTree = parseHtml(result.html);
      const { html: minifiedHtml, selectors } = minify(domTree);

      return {
        success: true,
        data: {
          html: includeHtml ? minifiedHtml : null,
          selectors: selectors,
          url: result.url,
          title: result.title,
        },
      };
    } catch (error) {
      console.error("Error getting page source:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async screenshot(): Promise<WebInteractionResult> {
    try {
      // 获取当前标签页
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tabs[0]?.id) {
        throw new Error("No active tab found");
      }

      // 使用 chrome.tabs.captureVisibleTab 进行截图
      const dataUrl = await new Promise<string>((resolve, reject) => {
        chrome.tabs.captureVisibleTab(
          tabs[0].windowId,
          { format: "png", quality: 100 },
          (dataUrl) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve(dataUrl);
          }
        );
      });

      return { success: true, data: dataUrl };
    } catch (error) {
      console.error("Error taking screenshot:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  async inputElement(
    selector: string,
    value: string
  ): Promise<WebInteractionResult> {
    try {
      const result = await this.executeInTab<WebInteractionResult>(() => {
        return new Promise((resolve) => {
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            element.focus();
            (element as HTMLInputElement).value = value;
            const events = ["input", "change", "blur"];
            events.forEach((eventType) => {
              const event = new Event(eventType, { bubbles: true });
              element.dispatchEvent(event);
            });
            const keyboardEvents = ["keydown", "keypress", "keyup"];
            keyboardEvents.forEach((eventType) => {
              const event = new KeyboardEvent(eventType, {
                bubbles: true,
                key: "Enter",
                keyCode: 13,
                which: 13,
              });
              element.dispatchEvent(event);
            });
            resolve({ success: true });
          } else {
            resolve({ success: false, error: "Element not found" });
          }
        });
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Error in inputElement:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async clickElement(selector: string): Promise<WebInteractionResult> {
    try {
      const result = await this.executeInTab<WebInteractionResult>(() => {
        return new Promise((resolve) => {
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            element.click();
            resolve({
              found: true,
              selector: selector,
              text: element.textContent,
              html: element.outerHTML,
            });
          } else {
            resolve({
              found: false,
              selector: selector,
            });
          }
        });
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Error clicking element:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async scrollToElement(selector: string): Promise<WebInteractionResult> {
    try {
      const result = await this.executeInTab<WebInteractionResult>(() => {
        return new Promise((resolve) => {
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            resolve({ success: true });
          } else {
            resolve({ success: false, error: "Element not found" });
          }
        });
      });
      return { success: true, data: result };
    } catch (error) {
      console.error("Error scrolling to element:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
