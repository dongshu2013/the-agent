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

export class WebToolkit {
  private async executeInTab<T = any>(
    userFunc: (...args: any[]) => any,
    args: any[] = []
  ): Promise<T> {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tab = tabs[0];
      if (!tab?.id) throw new Error("No active tab found");

      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: userFunc,
        args,
      });

      if (!result || typeof result.result === "undefined") {
        throw new Error("No result returned from script execution");
      }

      return result.result as T;
    } catch (error) {
      console.error("Error in executeInTab:", error);
      throw error;
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
    value: string
  ): Promise<WebInteractionResult> {
    try {
      const result = await this.executeInTab<WebInteractionResult>(
        (sel, val) => {
          // 尝试多种选择器方式
          let element = document.querySelector(sel) as HTMLElement;

          // 如果直接选择器失败，尝试其他方式
          if (!element) {
            // 尝试通过 data-testid 查找
            element = document.querySelector(
              `[data-testid="${sel}"]`
            ) as HTMLElement;
          }

          if (!element) {
            // 尝试通过 aria-label 查找
            element = document.querySelector(
              `[aria-label="${sel}"]`
            ) as HTMLElement;
          }

          if (!element) {
            // 尝试通过 class 查找
            element = document.querySelector(`.${sel}`) as HTMLElement;
          }

          if (!element) {
            // 尝试通过 id 查找
            element = document.getElementById(sel) as HTMLElement;
          }

          if (!element) {
            console.error("Element not found with selector:", sel);
            console.log("Available elements with similar attributes:");
            // 输出所有可能的元素信息用于调试
            const allElements = document.querySelectorAll("*");
            allElements.forEach((el) => {
              if (
                el.getAttribute("data-testid") ||
                el.getAttribute("aria-label") ||
                el.getAttribute("class")?.includes(sel) ||
                el.id === sel
              ) {
                console.log("Found potential element:", {
                  tag: el.tagName,
                  id: el.id,
                  class: el.className,
                  "data-testid": el.getAttribute("data-testid"),
                  "aria-label": el.getAttribute("aria-label"),
                  contenteditable: el.getAttribute("contenteditable"),
                });
              }
            });
            return {
              success: false,
              error: `Element not found with selector: ${sel}`,
            };
          }

          try {
            // 确保元素可见
            element.scrollIntoView({ behavior: "smooth", block: "center" });

            // 模拟真实的用户交互
            return new Promise((resolve) => {
              // 先触发 mousedown 和 focus 事件
              element.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true })
              );
              element.focus();
              element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));

              // 清除现有内容
              if (
                element instanceof HTMLInputElement ||
                element instanceof HTMLTextAreaElement
              ) {
                element.value = "";
              } else if (element.isContentEditable) {
                element.textContent = "";
              }

              // 触发内容清除的事件
              element.dispatchEvent(new Event("input", { bubbles: true }));

              let currentText = "";
              const typeNextChar = () => {
                if (currentText.length < val.length) {
                  const nextChar = val[currentText.length];
                  currentText += nextChar;

                  // 设置值
                  if (
                    element instanceof HTMLInputElement ||
                    element instanceof HTMLTextAreaElement
                  ) {
                    element.value = currentText;
                  } else if (element.isContentEditable) {
                    element.textContent = currentText;
                  }

                  // 触发更完整的输入事件
                  ["keydown", "beforeinput", "input", "keyup"].forEach(
                    (eventType) => {
                      const event = new Event(eventType, {
                        bubbles: true,
                        cancelable: true,
                        composed: true,
                      });
                      element.dispatchEvent(event);
                    }
                  );

                  // 触发 input 事件以更新 React 状态
                  const inputEvent = new Event("input", {
                    bubbles: true,
                    cancelable: true,
                    composed: true,
                  });
                  element.dispatchEvent(inputEvent);

                  // 随机延迟 50-150ms 模拟真实打字速度
                  const delay = Math.floor(Math.random() * 100) + 50;
                  setTimeout(typeNextChar, delay);
                } else {
                  // 输入完成后触发完整的事件序列
                  const finalEvents = [
                    "change",
                    "input",
                    "keydown",
                    "keypress",
                    "keyup",
                    "compositionend",
                  ];

                  finalEvents.forEach((eventType) => {
                    const event = new Event(eventType, {
                      bubbles: true,
                      cancelable: true,
                      composed: true,
                    });
                    element.dispatchEvent(event);
                  });

                  // 等待一下以确保状态更新
                  setTimeout(() => {
                    resolve({ success: true });
                  }, 100);
                }
              };

              // 开始打字
              typeNextChar();
            });
          } catch (error) {
            console.error("Error while setting value:", error);
            return {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            };
          }
        },
        [selector, value]
      );

      return result;
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
      // selector: "button[aria-label=\"Post\"]"
      const result = await this.executeInTab<WebInteractionResult>(
        (sel) => {
          // 尝试多种选择器方式
          let element = document.querySelector(sel) as HTMLElement;

          // 如果直接选择器失败，尝试其他方式
          if (!element) {
            // 尝试通过 data-testid 查找
            element = document.querySelector(
              `[data-testid="${sel}"]`
            ) as HTMLElement;
          }

          if (!element) {
            // 尝试通过 aria-label 查找
            element = document.querySelector(
              `[aria-label="${sel}"]`
            ) as HTMLElement;
          }

          if (!element) {
            // 尝试通过 class 查找
            element = document.querySelector(`.${sel}`) as HTMLElement;
          }

          if (!element) {
            // 尝试通过 id 查找
            element = document.getElementById(sel) as HTMLElement;
          }

          if (!element) {
            console.error("Element not found with selector:", sel);
            return {
              success: false,
              error: `Element not found with selector: ${sel}`,
            };
          }

          try {
            // 确保元素可见
            element.scrollIntoView({ behavior: "smooth", block: "center" });

            // 模拟完整的点击事件序列
            return new Promise((resolve) => {
              // 1. 鼠标移动到元素上
              element.dispatchEvent(
                new MouseEvent("mouseover", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                })
              );

              // 2. 鼠标按下
              element.dispatchEvent(
                new MouseEvent("mousedown", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                })
              );

              // 3. 元素获得焦点
              element.focus();
              element.dispatchEvent(
                new FocusEvent("focus", {
                  bubbles: true,
                  cancelable: true,
                })
              );

              // 4. 鼠标释放
              element.dispatchEvent(
                new MouseEvent("mouseup", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                })
              );

              // 5. 点击事件
              element.dispatchEvent(
                new MouseEvent("click", {
                  bubbles: true,
                  cancelable: true,
                  view: window,
                })
              );

              // 6. 使用原生点击方法
              element.click();

              // 等待一下以确保事件处理完成
              setTimeout(() => {
                resolve({
                  success: true,
                  data: {
                    text: element.textContent,
                    html: element.outerHTML,
                  },
                });
              }, 100);
            });
          } catch (error) {
            console.error("Error while clicking element:", error);
            return {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            };
          }
        },
        [selector]
      );

      return result;
    } catch (error) {
      console.error("Error in clickElement:", error);
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

  async refreshPage(): Promise<WebInteractionResult> {
    try {
      const result = await this.executeInTab<WebInteractionResult>(() => {
        return new Promise((resolve) => {
          location.reload();
          resolve({ success: true });
        });
      });
      return result;
    } catch (error) {
      console.error("Error refreshing page:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
