export interface WebInteractionResult {
  success: boolean;
  data?: any;
  error?: string | null;
}

interface PageSourceResult {
  html: string;
  js: string[];
}

interface WebToolkitResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class WebToolkit {
  private async executeInTab<T>(code: string): Promise<T> {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tabs[0]?.id) {
        throw new Error("No active tab found");
      }

      const results = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (): PageSourceResult => {
          try {
            return {
              html: document.documentElement.outerHTML,
              js: Array.from(document.scripts).map((script) => script.src),
            };
          } catch (error) {
            console.error("Error getting page source:", error);
            throw error;
          }
        },
      });

      if (!results || results.length === 0) {
        throw new Error("No results returned from script execution");
      }

      return results[0].result as T;
    } catch (error) {
      console.error("Error executing in tab:", error);
      throw error;
    }
  }

  async getPageSource(
    includeHtml: boolean = true,
    includeJs: boolean = true
  ): Promise<WebToolkitResponse> {
    try {
      const result = await this.executeInTab<PageSourceResult>("");
      if (!result) {
        throw new Error("Failed to get page source");
      }

      // 根据参数过滤结果
      const filteredResult = {
        html: includeHtml ? result.html : null,
        js: includeJs ? result.js : null,
      };

      return { success: true, data: filteredResult };
    } catch (error) {
      console.error("Error getting page source:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async screenshot(fullPage: boolean = false): Promise<WebInteractionResult> {
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

  // 安全地转义字符串，防止 XSS
  private escapeString(str: string): string {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
  }

  // 安全地构建选择器
  private buildSafeSelector(selector: string): string {
    return this.escapeString(selector);
  }

  async getCurrentUrl(): Promise<WebInteractionResult> {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tabs[0]?.url) throw new Error("No active tab found");
      return { success: true, data: tabs[0].url };
    } catch (error) {
      console.error("Error getting URL:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async highlightElement(selector: string): Promise<WebInteractionResult> {
    try {
      const safeSelector = this.buildSafeSelector(selector);
      const code = `
        (() => {
          const el = document.querySelector('${safeSelector}');
          if (el) {
            el.style.outline = '3px solid red';
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return { success: true };
          }
          return { success: false, error: 'Element not found' };
        })()
      `;
      const result = await this.executeInTab(code);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error highlighting element:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getInnerHTML(selector: string): Promise<WebInteractionResult> {
    try {
      const safeSelector = this.buildSafeSelector(selector);
      const code = `
        (() => {
          const element = document.querySelector('${safeSelector}');
          return element ? element.innerHTML : null;
        })()
      `;
      const result = await this.executeInTab(code);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error getting innerHTML:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // 更新现有的 findElement 方法以使用安全的选择器
  async findElement(
    selector: string,
    timeout: number = 5000
  ): Promise<WebInteractionResult> {
    try {
      const safeSelector = this.buildSafeSelector(selector);
      const code = `
        (() => {
          return new Promise((resolve) => {
            const element = document.querySelector('${safeSelector}');
            if (element) {
              resolve({
                found: true,
                selector: '${safeSelector}',
                text: element.textContent,
                html: element.outerHTML
              });
            } else {
              resolve({
                found: false,
                selector: '${safeSelector}'
              });
            }
          });
        })()
      `;

      const result = await this.executeInTab(code);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error finding element:", error);
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
      // First wait for the element to be present
      await this.waitForElement(selector);

      const code = `
        (() => {
          try {
            const element = document.querySelector(${JSON.stringify(selector)});
            if (!element) {
              return { success: false, error: 'Element not found' };
            }
            
            // Ensure element is visible and editable
            if (element.offsetParent === null) {
              return { success: false, error: 'Element is not visible' };
            }
            
            // Scroll element into view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add a small delay to ensure scrolling is complete
            setTimeout(() => {
              // Clear existing value
              element.value = '';
              // Set new value
              element.value = ${JSON.stringify(value)};
              // Trigger input event
              element.dispatchEvent(new Event('input', { bubbles: true }));
              // Trigger change event
              element.dispatchEvent(new Event('change', { bubbles: true }));
            }, 100);
            
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `;

      const result = await this.executeInTab(code);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error inputting element:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async clickElement(selector: string): Promise<WebInteractionResult> {
    try {
      // First wait for the element to be present
      await this.waitForElement(selector);

      const code = `
        (() => {
          try {
            const element = document.querySelector(${JSON.stringify(selector)});
            if (!element) {
              return { success: false, error: 'Element not found' };
            }
            
            // Ensure element is visible and clickable
            if (element.offsetParent === null) {
              return { success: false, error: 'Element is not visible' };
            }
            
            // Scroll element into view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add a small delay to ensure scrolling is complete
            setTimeout(() => {
              element.click();
            }, 100);
            
            return { success: true };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `;

      const result = await this.executeInTab(code);
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
      const code = `
        (() => {
          const element = document.querySelector('${selector}');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            return { success: true };
          }
          return { success: false, error: 'Element not found' };
        })()
      `;

      const result = await this.executeInTab(code);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error scrolling to element:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async waitForElement(
    selector: string,
    timeout: number = 5000
  ): Promise<WebInteractionResult> {
    try {
      const code = `
        (() => {
          return new Promise((resolve) => {
            const startTime = Date.now();
            const checkElement = () => {
              const element = document.querySelector(${JSON.stringify(selector)});
              if (element) {
                resolve({ success: true, found: true });
              } else if (Date.now() - startTime >= ${timeout}) {
                resolve({ success: false, error: 'Timeout waiting for element' });
              } else {
                setTimeout(checkElement, 100);
              }
            };
            checkElement();
          });
        })()
      `;

      const result = await this.executeInTab(code);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error waiting for element:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async extractText(selector: string): Promise<WebInteractionResult> {
    try {
      const code = `
        (() => {
          const element = document.querySelector('${selector}');
          return element ? element.textContent : null;
        })()
      `;

      const result = await this.executeInTab(code);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error extracting text:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async extractAttribute(
    selector: string,
    attribute: string
  ): Promise<WebInteractionResult> {
    try {
      const code = `
        (() => {
          const element = document.querySelector('${selector}');
          return element ? element.getAttribute('${attribute}') : null;
        })()
      `;

      const result = await this.executeInTab(code);
      return { success: true, data: result };
    } catch (error) {
      console.error("Error extracting attribute:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
