import { parseHtml, minify } from "./dom-minify";

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

  async getPageSource(
    includeHtml: boolean = true
  ): Promise<WebToolkitResponse> {
    try {
      const result = await this.executeInTab<PageSourceResult>(
        (userFuncString: string) => {
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
            const result = userFunc();

            // 确保返回的是 Promise
            if (result instanceof Promise) {
              return result;
            }

            // 如果不是 Promise，包装成 Promise
            return Promise.resolve(result);
          } catch (error) {
            console.error("Error in content script execution:", error);
            return Promise.reject(error);
          }
        },
        []
      );

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
    value: string,
    options?: {
      clearFirst?: boolean;
      delay?: number;
    }
  ): Promise<WebInteractionResult> {
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
          const style = window.getComputedStyle(element);
          const isVisible =
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            rect.width > 0 &&
            rect.height > 0;

          return {
            success: true,
            data: {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              visible: isVisible,
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

      // 9. 分离调试器
      await this.detachDebugger();

      if (!finalResult.success) {
        return {
          success: false,
          error: finalResult.error,
        };
      }

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
      // Get current tab
      const tab = await this.getCurrentTab();
      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      // Get element info and verify it exists and is visible
      const elementInfo = await this.executeInTab<any>(
        (sel) => {
          const element = document.querySelector(sel) as HTMLElement;
          if (!element) {
            return {
              success: false,
              error: `Element not found: ${sel}`,
            };
          }

          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          const isVisible =
            style.visibility !== "hidden" &&
            style.display !== "none" &&
            rect.width > 0 &&
            rect.height > 0;

          // 获取元素的详细信息
          const attributes: Record<string, string> = {};
          Array.from(element.attributes).forEach((attr) => {
            attributes[attr.name] = attr.value;
          });

          return {
            success: true,
            data: {
              element,
              visible: isVisible,
              rect,
              elementState: {
                isVisible,
                isEnabled: !element.hasAttribute("disabled"),
                attributes,
                tagName: element.tagName.toLowerCase(),
                className: element.className,
                id: element.id,
                role: element.getAttribute("role"),
                ariaLabel: element.getAttribute("aria-label"),
                dataTestId: element.getAttribute("data-testid"),
              },
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

      // Try to click using the debugger API first
      if (this.hasDebuggerSupport) {
        try {
          await this.attachDebugger(tab.id);

          const { rect } = elementInfo.data;
          // Ensure coordinates are valid numbers
          const x = Math.round(rect.left + rect.width / 2);
          const y = Math.round(rect.top + rect.height / 2);

          if (isNaN(x) || isNaN(y)) {
            throw new Error("Invalid element coordinates");
          }

          // Move mouse to element
          await this.sendCommand("Input.dispatchMouseEvent", {
            type: "mouseMoved",
            x,
            y,
            button: "none",
            buttons: 0,
            modifiers: 0,
            timestamp: Date.now(),
          });

          // Click
          await this.sendCommand("Input.dispatchMouseEvent", {
            type: "mousePressed",
            x,
            y,
            button: "left",
            buttons: 1,
            clickCount: 1,
            modifiers: 0,
            timestamp: Date.now(),
          });

          await this.sendCommand("Input.dispatchMouseEvent", {
            type: "mouseReleased",
            x,
            y,
            button: "left",
            buttons: 0,
            clickCount: 1,
            modifiers: 0,
            timestamp: Date.now(),
          });

          await this.detachDebugger();
        } catch (error) {
          console.error("Debugger click failed:", error);
          this.hasDebuggerSupport = false;
        }
      }

      // Fallback to direct DOM click if debugger failed or not supported
      const clickResult = await this.executeInTab<any>(
        (sel) => {
          return new Promise((resolve) => {
            const element = document.querySelector(sel) as HTMLElement;
            if (!element) {
              resolve({
                success: false,
                error: "Element not found after click attempt",
              });
              return;
            }

            // Scroll element into view
            element.scrollIntoView({ behavior: "smooth", block: "center" });

            // Wait for scroll to complete
            setTimeout(() => {
              try {
                // Try native click first
                element.click();

                // If element is a button or has role="button", also trigger click event
                if (
                  element.tagName === "BUTTON" ||
                  element.getAttribute("role") === "button"
                ) {
                  const event = new MouseEvent("click", {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                  });
                  element.dispatchEvent(event);
                }

                resolve({ success: true });
              } catch (error) {
                resolve({ success: false, error: String(error) });
              }
            }, 100);
          });
        },
        [selector]
      );

      if (!clickResult.success) {
        return {
          success: false,
          error: clickResult.error || "Failed to click element",
        };
      }

      // Verify the click had an effect by checking if the element's state changed
      const finalState = await this.executeInTab<any>(
        (sel) => {
          const element = document.querySelector(sel) as HTMLElement;
          if (!element) {
            return { success: false, error: "Element not found after click" };
          }

          const rect = element.getBoundingClientRect();
          return {
            success: true,
            data: {
              text: element.textContent,
              html: element.outerHTML,
              rect,
              elementState: {
                isVisible:
                  element.style.visibility !== "hidden" &&
                  element.style.display !== "none" &&
                  rect.width > 0 &&
                  rect.height > 0,
                isEnabled: !element.hasAttribute("disabled"),
                attributes: Array.from(element.attributes).reduce(
                  (acc, attr) => {
                    acc[attr.name] = attr.value;
                    return acc;
                  },
                  {} as Record<string, string>
                ),
                tagName: element.tagName.toLowerCase(),
                className: element.className,
                id: element.id,
                role: element.getAttribute("role"),
                ariaLabel: element.getAttribute("aria-label"),
                dataTestId: element.getAttribute("data-testid"),
              },
            },
          };
        },
        [selector]
      );

      if (!finalState.success) {
        return {
          success: false,
          error: finalState.error,
        };
      }

      return {
        success: true,
        data: {
          text: finalState.data.text,
          html: finalState.data.html,
          clicked: true,
          position: {
            x: finalState.data.rect.x + finalState.data.rect.width / 2,
            y: finalState.data.rect.y + finalState.data.rect.height / 2,
          },
          elementState: finalState.data.elementState,
        },
      };
    } catch (error) {
      console.error("Error in clickElement:", error);
      await this.detachDebugger();
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

  async refreshPage(
    url?: string,
    waitForLoad: boolean = true,
    timeout: number = 5000
  ): Promise<WebInteractionResult> {
    try {
      // 获取当前标签页
      const tab = await this.getCurrentTab();
      if (!tab?.id) {
        throw new Error("No active tab found");
      }

      // 记录开始时间
      const startTime = Date.now();

      await this.executeInTab<WebInteractionResult>(() => {
        return new Promise((resolve) => {
          if (url) {
            window.location.href = url;
          } else {
            location.reload();
          }
          resolve({ success: true });
        });
      });

      // 如果需要等待页面加载完成
      if (waitForLoad) {
        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(listener);
            reject(new Error("Page load timeout"));
          }, timeout);

          const listener = (tabId: number, info: chrome.tabs.TabChangeInfo) => {
            if (tabId === tab.id && info.status === "complete") {
              clearTimeout(timeoutId);
              chrome.tabs.onUpdated.removeListener(listener);
              resolve();
            }
          };

          chrome.tabs.onUpdated.addListener(listener);
        });
      }

      // 获取页面状态
      const pageState = await this.executeInTab<any>(() => {
        return {
          url: window.location.href,
          title: document.title,
          readyState: document.readyState,
        };
      });

      // 计算加载时间
      const loadTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          url: pageState.url,
          title: pageState.title,
          loadTime,
          status: pageState.readyState,
        },
      };
    } catch (error) {
      console.error("Error refreshing page:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async listElements(selector?: string): Promise<WebInteractionResult> {
    try {
      if (!selector) {
        throw new Error(
          "Selector is required. Please provide a valid CSS selector."
        );
      }

      const result = await this.executeInTab<WebInteractionResult>(
        (selector: string) => {
          const elements = Array.from(document.querySelectorAll(selector));
          return {
            success: true,
            data: {
              elements: elements.map((el) => {
                const element = el as HTMLElement;
                const rect = element.getBoundingClientRect();
                const style = window.getComputedStyle(element);
                const isVisible =
                  style.visibility !== "hidden" &&
                  style.display !== "none" &&
                  rect.width > 0 &&
                  rect.height > 0;

                // 收集元素属性
                const attributes: Record<string, string> = {};
                Array.from(element.attributes).forEach((attr) => {
                  attributes[attr.name] = attr.value;
                });

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
                  attributes,
                  isVisible,
                  isInteractive:
                    (element.tagName === "BUTTON" ||
                      element.tagName === "A" ||
                      element.tagName === "INPUT" ||
                      element.getAttribute("role") === "button" ||
                      element.onclick != null ||
                      style.cursor === "pointer") &&
                    !element.hasAttribute("disabled"),
                  elementState: {
                    isEnabled: !element.hasAttribute("disabled"),
                    tagName: element.tagName.toLowerCase(),
                    className: element.className,
                    id: element.id,
                    role: element.getAttribute("role"),
                    ariaLabel: element.getAttribute("aria-label"),
                    dataTestId: element.getAttribute("data-testid"),
                  },
                };
              }),
            },
          };
        },
        [selector]
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
