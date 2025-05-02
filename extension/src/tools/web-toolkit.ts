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
      console.log("🍒 【executeInTab】开始执行");

      // 获取所有标签页信息
      const allTabs = await chrome.tabs.query({});
      console.log("🍒 【executeInTab】所有标签页:", allTabs);

      // 获取当前窗口的标签页
      const currentWindowTabs = await chrome.tabs.query({
        currentWindow: true,
      });
      console.log("🍒 【executeInTab】当前窗口标签页:", currentWindowTabs);

      // 获取活动标签页
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      console.log("🍒 【executeInTab】活动标签页:", tabs);

      if (!tabs || tabs.length === 0) {
        console.error("🍒 【executeInTab】错误: 未找到活动标签页");
        return {
          success: false,
          error:
            "No active tab found. Please ensure you have an active tab in the current window.",
        } as T;
      }

      const tab = tabs[0];
      console.log("🍒 【executeInTab】目标标签页:", tab);

      if (!tab?.id) {
        console.error("🍒 【executeInTab】错误: 标签页ID未找到");
        return {
          success: false,
          error: "Tab ID not found. Please ensure the tab is properly loaded.",
        } as T;
      }

      console.log("🍒 【executeInTab】准备执行脚本");
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: userFunc,
        args,
      });

      if (!result || typeof result.result === "undefined") {
        console.error("🍒 【executeInTab】错误: 脚本执行未返回结果");
        return {
          success: false,
          error: "No result returned from script execution",
        } as T;
      }

      console.log("🍒 【executeInTab】执行完成");
      return result.result as T;
    } catch (error) {
      console.error("🍒 【executeInTab】错误:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      } as T;
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
      const result = await this.executeInTab<WebInteractionResult>(
        async (sel, val, opts) => {
          const element = document.querySelector(sel) as HTMLElement | null;
          if (!element) {
            throw new Error(`Element not found with selector: ${sel}`);
          }

          element.scrollIntoView({ behavior: "smooth", block: "center" });

          const isInput =
            element instanceof HTMLInputElement ||
            element instanceof HTMLTextAreaElement;

          const isEditable = element.isContentEditable;

          // 模拟鼠标点击和聚焦
          element.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
          element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          element.focus();
          element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
          element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
          element.dispatchEvent(new MouseEvent("click", { bubbles: true }));

          if (opts.clearFirst !== false) {
            if (isInput) {
              const prototype = Object.getPrototypeOf(element);
              const descriptor = Object.getOwnPropertyDescriptor(
                prototype,
                "value"
              );
              descriptor?.set?.call(element, "");
            } else if (isEditable) {
              element.textContent = "";
            }
            element.dispatchEvent(new Event("input", { bubbles: true }));
            element.dispatchEvent(new Event("change", { bubbles: true }));
          }

          const delay = typeof opts.delay === "number" ? opts.delay : 100;

          return await new Promise<WebInteractionResult>((resolve) => {
            let currentText = "";

            const typeNextChar = () => {
              if (currentText.length < val.length) {
                const nextChar = val[currentText.length];
                currentText += nextChar;

                if (isInput) {
                  const prototype = Object.getPrototypeOf(element);
                  const descriptor = Object.getOwnPropertyDescriptor(
                    prototype,
                    "value"
                  );
                  descriptor?.set?.call(element, currentText);
                } else if (isEditable) {
                  element.textContent = currentText;
                }

                // 触发完整的输入事件序列
                const events = [
                  new KeyboardEvent("keydown", {
                    bubbles: true,
                    cancelable: true,
                    key: nextChar,
                    code: `Key${nextChar.toUpperCase()}`,
                    view: window,
                  }),
                  new InputEvent("beforeinput", {
                    bubbles: true,
                    cancelable: true,
                    data: nextChar,
                    inputType: "insertText",
                    view: window,
                  }),
                  new InputEvent("input", {
                    bubbles: true,
                    cancelable: true,
                    data: currentText,
                    inputType: "insertText",
                    view: window,
                  }),
                  new KeyboardEvent("keyup", {
                    bubbles: true,
                    cancelable: true,
                    key: nextChar,
                    code: `Key${nextChar.toUpperCase()}`,
                    view: window,
                  }),
                ];

                events.forEach((event) => {
                  element.dispatchEvent(event);
                });

                // 触发额外的状态更新事件
                element.dispatchEvent(new Event("change", { bubbles: true }));
                element.dispatchEvent(new Event("blur", { bubbles: true }));
                element.dispatchEvent(new Event("focus", { bubbles: true }));

                setTimeout(typeNextChar, delay);
              } else {
                // 触发最终事件序列
                const finalEvents = [
                  new Event("change", { bubbles: true }),
                  new Event("blur", { bubbles: true }),
                  new Event("focus", { bubbles: true }),
                ];

                finalEvents.forEach((event) => element.dispatchEvent(event));

                // 确保状态更新
                setTimeout(() => {
                  element.dispatchEvent(new Event("change", { bubbles: true }));
                  resolve({
                    success: true,
                    data: {
                      text: currentText,
                      html: element.outerHTML,
                    },
                  });
                }, 100);
              }
            };

            typeNextChar();
          });
        },
        [selector, value, options || {}]
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
      const result = await this.executeInTab<WebInteractionResult>(
        (sel) => {
          const element = document.querySelector(sel) as HTMLElement;

          if (!element) {
            throw new Error(`Element not found with selector: ${sel}`);
          }

          try {
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
            throw error;
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

  async listElements(selectors: string[]): Promise<WebInteractionResult> {
    try {
      console.log("🍒 【listElements】 selectors = ", selectors);
      const result = await this.executeInTab<WebInteractionResult>(
        (selectors: string[]) => {
          return new Promise((resolve) => {
            if (!selectors || selectors.length === 0) {
              throw new Error("No selectors provided");
            }

            const elements = Array.from(
              document.querySelectorAll(selectors.join(","))
            );

            const isVisible = (el: Element) => {
              const style = window.getComputedStyle(el);
              const rect = el.getBoundingClientRect();
              return (
                style.visibility !== "hidden" &&
                style.display !== "none" &&
                rect.width > 0 &&
                rect.height > 0
              );
            };

            const result = elements.map((el) => {
              const rect = el.getBoundingClientRect();
              const attrs = el.attributes || {};
              const attrObj: Record<string, string> = {};
              for (let attr of attrs) {
                attrObj[attr.name] = attr.value;
              }

              const clickableTags = ["button", "a", "summary"];
              const clickable =
                clickableTags.includes(el.tagName.toLowerCase()) ||
                el.getAttribute("role") === "button" ||
                typeof (el as HTMLElement).onclick === "function";

              const parent = el.parentElement;
              const parentAttrs: Record<string, string | null> = {};
              if (parent) {
                parentAttrs.id = parent.id || null;
                parentAttrs.class = parent.className || null;
              }

              const aria = el.getAttribute("aria-label");
              const testid = el.getAttribute("data-testid");
              const placeholder = el.getAttribute("placeholder");

              return {
                tag: el.tagName.toLowerCase(),
                displayText:
                  (el as HTMLElement).innerText?.trim() ||
                  aria ||
                  placeholder ||
                  (el as HTMLInputElement).value ||
                  el.getAttribute("title") ||
                  "",
                text: (el as HTMLElement).innerText || "",
                placeholder: placeholder || "",
                visible: isVisible(el),
                clickable,
                position: {
                  x: rect.x,
                  y: rect.y,
                },
                boundingBox: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height,
                },
                attributes: {
                  id: el.id || null,
                  class: el.className || null,
                  type: el.getAttribute("type") || null,
                  disabled: (el as HTMLInputElement).disabled || false,
                  "aria-label": aria || null,
                  "data-testid": testid || null,
                  contenteditable:
                    el.getAttribute("contenteditable") === "true",
                },
                parentTag: parent?.tagName?.toLowerCase() || null,
                parentAttributes: parentAttrs,
              };
            });

            resolve({
              success: true,
              data: {
                elements: result,
              },
            });
          });
        },
        [selectors] // 👈 args 显式传入
      );

      console.log("🍒 【listElements】 result = ", result);
      return result;
    } catch (error) {
      console.error("Error in findElement:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
