export interface WebInteractionResult {
  success: boolean;
  data?: any;
  error?: string;
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
            // 提取页面内容
            const extractPageContent = () => {
              // 1. 获取页面基本信息
              const pageInfo = {
                title: document.title,
                url: window.location.href,
                description: document
                  .querySelector('meta[name="description"]')
                  ?.getAttribute("content"),
                keywords: document
                  .querySelector('meta[name="keywords"]')
                  ?.getAttribute("content"),
              };

              // 2. 提取主要内容区域
              const mainContent =
                document.querySelector(
                  'main, article, #content, .content, [role="main"]'
                ) || document.body;

              // 3. 提取结构化数据
              const structuredData = {
                headings: Array.from(
                  mainContent.querySelectorAll("h1, h2, h3, h4, h5, h6")
                ).map((h) => ({
                  level: h.tagName.toLowerCase(),
                  text: h.textContent?.trim(),
                })),
                links: Array.from(mainContent.querySelectorAll("a"))
                  .map((a) => ({ href: a.href, text: a.textContent?.trim() }))
                  .filter((link) => link.href && link.text),
                images: Array.from(mainContent.querySelectorAll("img")).map(
                  (img) => ({ src: img.src, alt: img.alt })
                ),
              };

              // 4. 提取文本内容
              const textContent = mainContent.textContent?.trim() || "";

              // 5. 分块处理文本内容
              const chunkSize = 10000; // 每个块的大小
              const chunks = [];
              for (let i = 0; i < textContent.length; i += chunkSize) {
                chunks.push(textContent.slice(i, i + chunkSize));
              }

              return {
                pageInfo,
                structuredData,
                contentChunks: chunks,
                totalChunks: chunks.length,
                currentChunk: 0,
              };
            };

            const extractedContent = extractPageContent();

            return {
              html: JSON.stringify(extractedContent),
              js: [], // 不再返回 JS 脚本，因为我们现在专注于内容提取
            };
          } catch (error) {
            console.error("Error extracting content:", error);
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

  async findElement(
    selector: string,
    timeout: number = 5000
  ): Promise<WebInteractionResult> {
    try {
      const code = `
        (() => {
          return new Promise((resolve) => {
            const element = document.querySelector('${selector}');
            if (element) {
              resolve({
                found: true,
                selector: '${selector}',
                text: element.textContent,
                html: element.outerHTML
              });
            } else {
              resolve({
                found: false,
                selector: '${selector}'
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
      const code = `
        (() => {
          const element = document.querySelector('${selector}');
          if (element) {
            element.value = '${value}';
            element.dispatchEvent(new Event('input', { bubbles: true }));
            return { success: true };
          }
          return { success: false, error: 'Element not found' };
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
      const code = `
        (() => {
          const element = document.querySelector('${selector}');
          if (element) {
            element.click();
            return { success: true };
          }
          return { success: false, error: 'Element not found' };
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
              const element = document.querySelector('${selector}');
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
