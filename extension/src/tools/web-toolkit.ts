import { parseHtml, minify } from "./dom-minify";

export interface WebInteractionResult {
  success: boolean;
  data?: any;
  error?: string | null;
}
interface WebToolkitResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface DebuggerState {
  attached: boolean;
  tabId: number | null;
  targetId: string | null;
}

export class WebToolkit {
  private debuggerState: DebuggerState = {
    attached: false,
    tabId: null,
    targetId: null,
  };

  private hasDebuggerSupport = typeof chrome.debugger?.attach === "function";

  private async attachDebugger(tabId: number): Promise<void> {
    if (!this.hasDebuggerSupport) {
      return;
    }

    if (this.debuggerState.attached && this.debuggerState.tabId === tabId) {
      return;
    }

    try {
      await chrome.debugger.attach({ tabId }, "1.3");
      this.debuggerState.attached = true;
      this.debuggerState.tabId = tabId;
      console.log("Debugger attached successfully");
    } catch (error) {
      console.error("Failed to attach debugger:", error);
      this.hasDebuggerSupport = false; // 禁用 debugger 支持
    }
  }

  private async detachDebugger(): Promise<void> {
    if (
      !this.hasDebuggerSupport ||
      !this.debuggerState.attached ||
      !this.debuggerState.tabId
    ) {
      return;
    }

    try {
      await chrome.debugger.detach({ tabId: this.debuggerState.tabId });
      this.debuggerState.attached = false;
      this.debuggerState.tabId = null;
      console.log("Debugger detached successfully");
    } catch (error) {
      console.error("Failed to detach debugger:", error);
    }
  }

  private async sendCommand(method: string, params: any = {}): Promise<any> {
    if (
      !this.hasDebuggerSupport ||
      !this.debuggerState.attached ||
      !this.debuggerState.tabId
    ) {
      throw new Error("Debugger not available");
    }

    try {
      return await chrome.debugger.sendCommand(
        { tabId: this.debuggerState.tabId },
        method,
        params
      );
    } catch (error) {
      console.error(`Failed to execute command ${method}:`, error);
      throw error;
    }
  }

  private async getCurrentTab(): Promise<chrome.tabs.Tab> {
    try {
      // 1. 尝试使用 chrome.tabs.getCurrent()
      const currentTab = await chrome.tabs.getCurrent();
      if (currentTab?.id) {
        return currentTab;
      }

      // 2. 尝试查询当前窗口的活动标签页
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });
      if (tab?.id) {
        return tab;
      }

      // 3. 尝试查询所有窗口的活动标签页
      const tabs = await chrome.tabs.query({
        active: true,
        windowType: "normal",
      });
      if (tabs.length > 0) {
        return tabs[0];
      }

      throw new Error(
        "No active tab found. Please ensure the extension has the necessary permissions."
      );
    } catch (error) {
      console.error("Error getting current tab:", error);
      throw error;
    }
  }

  private async executeInTab<T = any>(
    userFunc: (...args: any[]) => any,
    args: any[] = []
  ): Promise<T> {
    try {
      const tab = await this.getCurrentTab();

      if (!tab?.id) {
        console.error("No tab ID found. Tab info:", tab);
        throw new Error(
          "Tab ID not found. Please ensure the tab is properly loaded."
        );
      }

      // 执行脚本
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: userFunc,
        args,
      });

      if (!result) {
        console.error("Script execution returned no result");
        throw new Error("No result returned from script execution");
      }

      // 如果结果是一个 Promise，等待它完成
      if (result.result instanceof Promise) {
        const promiseResult = await result.result;
        // 检查 Promise 结果是否包含错误
        if (
          promiseResult &&
          typeof promiseResult === "object" &&
          "success" in promiseResult &&
          !promiseResult.success
        ) {
          throw new Error(
            promiseResult.error || "Unknown error in Promise result"
          );
        }
        return promiseResult;
      }

      // 检查结果是否包含错误
      if (
        result.result &&
        typeof result.result === "object" &&
        "success" in result.result &&
        !result.result.success
      ) {
        throw new Error(result.result.error || "Unknown error in result");
      }

      return result.result as T;
    } catch (error) {
      console.error("executeInTab error:", error);
      // 检查是否是权限问题
      if (
        error instanceof Error &&
        error.toString().includes("Cannot access")
      ) {
        throw new Error(
          "Cannot access this page. Make sure the extension has permissions for this URL."
        );
      }
      throw error; // 向上传播错误
    }
  }

  async getPageText(format: string = "text"): Promise<WebToolkitResponse> {
    try {
      const result = await this.executeInTab<{
        html: string;
        text: string;
        url: string;
        title: string;
      }>(() => {
        const html = document.documentElement.outerHTML;
        const text = document.body?.innerText || "";
        return {
          html,
          text,
          url: window.location.href,
          title: document.title,
        };
      }, []);

      if (!result || !result.html) {
        throw new Error("No result returned from page");
      }

      const domTree = parseHtml(result.html);
      if (format === "html") {
        const { html: minifiedHtml } = minify(domTree);
        return {
          success: true,
          data: {
            content: minifiedHtml,
            url: result.url,
            title: result.title,
          },
        };
      } else {
        return {
          success: true,
          data: {
            content: result.text,
            url: result.url,
            title: result.title,
          },
        };
      }
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
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tabs[0]?.id) {
        throw new Error("No active tab found");
      }

      // 获取原始截图
      const originalDataUrl = await new Promise<string>((resolve, reject) => {
        chrome.tabs.captureVisibleTab(
          tabs[0].windowId,
          { format: "jpeg", quality: 60 },
          (dataUrl) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            resolve(dataUrl);
          }
        );
      });

      // 压缩和调整图片大小，使用WebP格式
      const compressedDataUrl = await this.executeInTab<string>(
        (dataUrl) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;

              // 限制最大宽度为800像素
              if (width > 800) {
                height = (800 * height) / width;
                width = 800;
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext("2d");
              if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
              }

              ctx.imageSmoothingEnabled = false;
              ctx.drawImage(img, 0, 0, width, height);

              // 使用WebP格式，质量设置为0.6
              resolve(canvas.toDataURL("image/webp", 0.6));
            };

            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = dataUrl;
          });
        },
        [originalDataUrl]
      );

      return {
        success: true,
        data: {
          screenshot: compressedDataUrl,
        },
      };
    } catch (error) {
      console.error("Error taking screenshot:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async inputElement({
    selector,
    value,
    options,
  }: {
    selector: string;
    value: string;
    options?: {
      clearFirst?: boolean;
      delay?: number;
      pressEnterAfterInput?: boolean;
    };
  }): Promise<WebInteractionResult> {
    console.log("🤭🤭 inputElement", selector, value, options);
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tabs[0]?.id) {
        throw new Error("No active tab found");
      }
      const tabId = tabs[0].id;

      // 1. 获取元素信息
      const elementInfo = await this.executeInTab<any>(
        (sel) => {
          const element = document.querySelector(sel);
          if (!element) {
            return {
              success: false,
              error: `Element not found: ${sel}`,
              visible: false,
            };
          }

          const rect = element.getBoundingClientRect();
          return {
            success: true,
            data: {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              visible: rect.width > 0 && rect.height > 0,
              text: element.textContent,
              html: element.outerHTML,
            },
          };
        },
        [selector]
      );

      // Add null check for elementInfo
      if (!elementInfo) {
        return {
          success: false,
          error: "Failed to get element information",
        };
      }

      if (!elementInfo.success) {
        return {
          success: false,
          error: elementInfo.error || "Failed to get element information",
        };
      }

      if (!elementInfo.data.visible) {
        return {
          success: false,
          error: "Element is not visible",
        };
      }

      // 2. 附加调试器
      await this.attachDebugger(tabId);

      // 3. 模拟鼠标移动到元素
      await this.sendCommand("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: elementInfo.data.x,
        y: elementInfo.data.y,
        button: "none",
        buttons: 0,
      });

      // 4. 模拟点击以获得焦点
      await this.sendCommand("Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: elementInfo.data.x,
        y: elementInfo.data.y,
        button: "left",
        buttons: 1,
        clickCount: 1,
      });

      await this.sendCommand("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: elementInfo.data.x,
        y: elementInfo.data.y,
        button: "left",
        buttons: 0,
        clickCount: 1,
      });

      // 5. 如果需要清空，发送 Backspace 键
      if (options?.clearFirst) {
        const currentValue = await this.executeInTab<string>(
          (sel) =>
            (document.querySelector(sel) as HTMLInputElement)?.value || "",
          [selector]
        );

        for (let i = 0; i < currentValue.length; i++) {
          await this.sendCommand("Input.dispatchKeyEvent", {
            type: "keyDown",
            key: "Backspace",
            code: "Backspace",
          });
          await this.sendCommand("Input.dispatchKeyEvent", {
            type: "keyUp",
            key: "Backspace",
            code: "Backspace",
          });
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }

      // 6. 模拟输入 - 使用 insertText 而不是逐个字符输入
      await this.sendCommand("Input.insertText", {
        text: value,
      });

      // 7. 等待一小段时间确保事件处理完成
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 8. 获取最终结果
      const finalResult = await this.executeInTab<any>(
        (sel) => {
          const element = document.querySelector(sel) as HTMLInputElement;
          if (!element) {
            return {
              success: false,
              error: `Element not found after input: ${sel}`,
            };
          }
          return {
            success: true,
            data: {
              value: element.value,
              text: element.textContent,
              html: element.outerHTML,
            },
          };
        },
        [selector]
      );

      // 9. 回车操作（如果需要）
      if (options?.pressEnterAfterInput) {
        await this.sendCommand("Input.dispatchKeyEvent", {
          type: "keyDown",
          key: "Enter",
          code: "Enter",
          windowsVirtualKeyCode: 13,
          nativeVirtualKeyCode: 13,
        });
        await this.sendCommand("Input.dispatchKeyEvent", {
          type: "keyUp",
          key: "Enter",
          code: "Enter",
          windowsVirtualKeyCode: 13,
          nativeVirtualKeyCode: 13,
        });
      }

      // 10. 分离调试器
      await this.detachDebugger();

      if (!finalResult.success) {
        return {
          success: false,
          error: finalResult.error,
        };
      }

      console.log("😂😂 options", options);
      return {
        success: true,
        data: {
          text: finalResult.data.text,
          value: finalResult.data.value,
          html: finalResult.data.html,
        },
      };
    } catch (error) {
      console.error("Error in inputElement:", error);
      // 确保调试器被分离
      await this.detachDebugger();
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async clickElement(selector: string): Promise<WebInteractionResult> {
    try {
      // 1. 查找元素（主文档+iframe）
      const elementInfo = await this.executeInTab<any>(
        (sel) => {
          function findElement(sel: string): {
            element: HTMLElement | null;
            frame?: HTMLIFrameElement;
          } {
            let el = document.querySelector(sel) as HTMLElement;
            if (el) return { element: el };
            const iframes = Array.from(document.getElementsByTagName("iframe"));
            for (const frame of iframes) {
              try {
                const doc = frame.contentDocument;
                if (doc) {
                  el = doc.querySelector(sel) as HTMLElement;
                  if (el) return { element: el, frame };
                }
              } catch {}
            }
            return { element: null };
          }
          const { element, frame } = findElement(sel);
          if (!element)
            return { success: false, error: `Element not found: ${sel}` };
          const rect = element.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          return { success: true, data: { isVisible, frame } };
        },
        [selector]
      );

      if (!elementInfo?.success)
        return {
          success: false,
          error: elementInfo?.error || "Element not found",
        };

      if (!elementInfo.data.isVisible)
        return { success: false, error: "Element is not visible" };

      // 2. 执行点击
      const clickResult = await this.executeInTab<any>(
        (sel) => {
          function findElement(sel: string): HTMLElement | null {
            let el = document.querySelector(sel) as HTMLElement;
            if (el) return el;
            const iframes = Array.from(document.getElementsByTagName("iframe"));
            for (const frame of iframes) {
              try {
                const doc = frame.contentDocument;
                if (doc) {
                  el = doc.querySelector(sel) as HTMLElement;
                  if (el) return el;
                }
              } catch {}
            }
            return null;
          }
          const el = findElement(sel);
          if (!el)
            return { success: false, error: "Element not found for click" };
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(() => el.click(), 50);
          return { success: true };
        },
        [selector]
      );

      if (!clickResult?.success)
        return { success: false, error: clickResult?.error || "Click failed" };

      // 3. 简单等待后返回状态
      await new Promise((r) => setTimeout(r, 500));
      const stillExists = await this.executeInTab<boolean>(
        (sel) => !!document.querySelector(sel),
        [selector]
      );

      return {
        success: true,
        data: {
          clicked: true,
          elementStillExists: stillExists,
        },
      };
    } catch (error) {
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
      return result;
    } catch (error) {
      console.error("Error scrolling to element:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async listElements(
    selectors?: string,
    text?: string
  ): Promise<WebInteractionResult> {
    try {
      if (!selectors && !text) {
        throw new Error("At least one of selectors or text is required.");
      }

      const result = await this.executeInTab<WebInteractionResult>(
        (selectors: string | null, text: string | null) => {
          let elements: Element[] = [];

          if (selectors) {
            elements = Array.from(document.querySelectorAll(selectors));
          } else {
            elements = Array.from(document.querySelectorAll("body *"));
          }

          if (text) {
            const lowerText = text.trim().toLowerCase();
            elements = elements.filter(
              (el) =>
                el.textContent &&
                el.textContent.trim().toLowerCase().includes(lowerText)
            );
          }

          // 只返回前20个元素，并且只包含必要字段
          return {
            success: true,
            data: {
              elements: elements.slice(0, 20).map((el) => {
                const element = el as HTMLElement;
                const rect = element.getBoundingClientRect();
                const style = window.getComputedStyle(element);
                const isVisible =
                  style.visibility !== "hidden" &&
                  style.display !== "none" &&
                  rect.width > 0 &&
                  rect.height > 0;

                // 构建唯一选择器
                let uniqueSelector = element.tagName.toLowerCase();
                if (element.id) {
                  uniqueSelector = `#${element.id}`;
                } else if (element.className) {
                  uniqueSelector += `.${element.className.split(" ").join(".")}`;
                }
                if (element.getAttribute("role")) {
                  uniqueSelector += `[role="${element.getAttribute("role")}"]`;
                }
                if (element.getAttribute("data-testid")) {
                  uniqueSelector += `[data-testid="${element.getAttribute("data-testid")}"]`;
                }

                return {
                  selector: uniqueSelector,
                  text: element.innerText?.trim() || "",
                  type: element.tagName.toLowerCase(),
                  isVisible,
                  isInteractive:
                    (element.tagName === "BUTTON" ||
                      element.tagName === "A" ||
                      element.tagName === "INPUT" ||
                      element.getAttribute("role") === "button" ||
                      (element as any).onclick != null ||
                      style.cursor === "pointer") &&
                    !element.hasAttribute("disabled"),
                };
              }),
            },
          };
        },
        [selectors ?? null, text ?? null]
      );

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
