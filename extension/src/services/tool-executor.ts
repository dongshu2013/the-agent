import { TabToolkit } from "../tools/tab-toolkit";
import { WebToolkit } from "../tools/web-toolkit";
import OpenAI from "openai";

export interface ToolCall {
  tool: string;
  params: Record<string, any> | any[];
}

export class ToolExecutor {
  private webToolkit: WebToolkit;
  private toolMap: Record<string, (...args: any[]) => any>;
  private toolCallCache: Record<string, { name: string; arguments: string }> =
    {};

  constructor() {
    this.webToolkit = new WebToolkit();
    this.toolMap = {
      TabToolkit_openTab: TabToolkit.openTab,
      TabToolkit_closeTab: TabToolkit.closeTab,
      TabToolkit_findTab: TabToolkit.findTab,
      TabToolkit_switchToTab: TabToolkit.switchToTab,
      TabToolkit_waitForTabLoad: TabToolkit.waitForTabLoad,
      TabToolkit_getCurrentActiveTab: TabToolkit.getCurrentActiveTab,
      TabToolkit_handleTwitterSequence: TabToolkit.handleTwitterSequence,
      WebToolkit_findElement: this.webToolkit.findElement.bind(this.webToolkit),
      WebToolkit_clickElement: this.webToolkit.clickElement.bind(
        this.webToolkit
      ),
      WebToolkit_fillInput: this.webToolkit.fillInput.bind(this.webToolkit),
      WebToolkit_extractText: this.webToolkit.extractText.bind(this.webToolkit),
    };
  }

  // Process streaming tool calls
  processStreamingToolCalls(chunk: any) {
    if (chunk.choices[0]?.delta?.tool_calls) {
      chunk.choices[0].delta.tool_calls.forEach((call: any) => {
        const id = call.id || call.index || "default";
        if (!this.toolCallCache[id]) {
          this.toolCallCache[id] = { name: "", arguments: "" };
        }
        if (call.function?.name) {
          this.toolCallCache[id].name += call.function.name;
        }
        if (call.function?.arguments) {
          this.toolCallCache[id].arguments += call.function.arguments;
        }
      });
    } else if (chunk.choices[0]?.delta?.content) {
      // Check for URLs in the content
      const content = chunk.choices[0].delta.content;
      const urlMatch = content.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        const url = urlMatch[0];
        // Only create a tool call if we have a valid URL
        if (url && url.startsWith("http")) {
          this.toolCallCache["url"] = {
            name: "TabToolkit_openTab",
            arguments: JSON.stringify({ url }),
          };
        }
      }
    }
  }

  // Check if tool calls are complete
  isToolCallComplete(chunk: any): boolean {
    return (
      chunk.choices[0]?.finish_reason === "tool_calls" ||
      (Object.keys(this.toolCallCache).length > 0 &&
        chunk.choices[0]?.finish_reason === "stop")
    );
  }

  // Process completed tool calls
  async processCompletedToolCalls(): Promise<string> {
    if (Object.keys(this.toolCallCache).length === 0) {
      return "";
    }

    const toolCalls: ToolCall[] = Object.values(this.toolCallCache)
      .map((call) => {
        // Skip empty tool calls
        if (!call.name || !call.arguments) {
          return null;
        }

        try {
          // For TabToolkit_openTab, ensure we have a valid URL
          if (call.name === "TabToolkit_openTab") {
            const parsedArgs = JSON.parse(call.arguments);
            const url = parsedArgs.url || parsedArgs;

            if (!url || typeof url !== "string" || !url.startsWith("http")) {
              throw new Error("Invalid URL parameter for TabToolkit_openTab");
            }

            return {
              tool: call.name,
              params: { url },
            } as ToolCall;
          }

          // For other tools, parse the arguments normally
          const parsedArgs = JSON.parse(call.arguments);
          return {
            tool: call.name,
            params: parsedArgs,
          } as ToolCall;
        } catch (err) {
          console.error("Error processing tool call:", {
            name: call.name,
            arguments: call.arguments,
            error: err,
          });
          return null;
        }
      })
      .filter((call): call is ToolCall => call !== null);

    if (toolCalls.length === 0) {
      return "";
    }

    try {
      const results = await this.executeToolCalls(toolCalls);
      this.toolCallCache = {}; // Clear the cache after processing

      return results
        .map((result) =>
          result.success
            ? `Tool "${result.tool}" succeeded: ${JSON.stringify(result.result)}`
            : `Tool "${result.tool}" failed: ${result.error}`
        )
        .join("\n");
    } catch (error) {
      console.error("Error executing tool calls:", error);
      return `Error executing tools: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  async executeTool(toolCall: ToolCall): Promise<any> {
    try {
      if (!toolCall.tool || toolCall.tool.trim() === "") {
        throw new Error("Tool name is required");
      }

      // 处理 TabToolkit 调用
      if (toolCall.tool.startsWith("TabToolkit_")) {
        console.log("Sending TabToolkit message to background:", {
          tool: toolCall.tool,
          params: toolCall.params,
        });

        // 特殊处理 TabToolkit_openTab 的空参数情况
        if (
          toolCall.tool === "TabToolkit_openTab" &&
          (!toolCall.params ||
            (typeof toolCall.params === "object" &&
              Object.keys(toolCall.params).length === 0))
        ) {
          throw new Error("URL parameter is required for TabToolkit_openTab");
        }

        return new Promise((resolve, reject) => {
          // 设置更长的超时时间（30秒）
          const timeoutId = setTimeout(() => {
            reject(
              new Error(
                "Timeout: no response from background script after 30 seconds"
              )
            );
          }, 30000);

          // 检查 background script 是否已加载
          if (!chrome.runtime.getBackgroundPage) {
            clearTimeout(timeoutId);
            reject(new Error("Background script not available"));
            return;
          }

          // 确保参数格式正确
          let params;
          if (typeof toolCall.params === "string") {
            params = { url: toolCall.params };
          } else if (Array.isArray(toolCall.params)) {
            params = { url: toolCall.params[0] };
          } else {
            params = toolCall.params;
          }

          // 验证 URL 参数
          if (
            toolCall.tool === "TabToolkit_openTab" &&
            (!params.url || typeof params.url !== "string")
          ) {
            clearTimeout(timeoutId);
            reject(new Error("Invalid URL parameter for TabToolkit_openTab"));
            return;
          }

          chrome.runtime.sendMessage(
            {
              name: "execute-tool",
              body: {
                tool: toolCall.tool,
                params: params,
              },
            },
            (response) => {
              clearTimeout(timeoutId);

              if (chrome.runtime.lastError) {
                console.error(
                  "Chrome runtime error:",
                  chrome.runtime.lastError
                );
                reject(chrome.runtime.lastError);
                return;
              }

              if (!response) {
                console.error("No response received from background script");
                reject(
                  new Error("No response received from background script")
                );
                return;
              }

              console.log("Received response from background:", response);

              if (response.success) {
                resolve(response.result);
              } else {
                reject(new Error(response.error || "Unknown error"));
              }
            }
          );
        });
      }

      // 处理其他工具调用
      const tool = this.toolMap[toolCall.tool];
      if (!tool) {
        throw new Error(`Tool ${toolCall.tool} not found`);
      }

      console.log(
        "Executing local tool:",
        toolCall.tool,
        "with params:",
        toolCall.params
      );

      // Handle different parameter types
      let params: any[];
      if (Array.isArray(toolCall.params)) {
        params = toolCall.params;
      } else if (
        typeof toolCall.params === "object" &&
        toolCall.params !== null
      ) {
        // Convert object to array based on tool type
        if (toolCall.tool === "WebToolkit_findElement") {
          params = [toolCall.params.selector, toolCall.params.timeout];
        } else if (toolCall.tool === "WebToolkit_clickElement") {
          params = [toolCall.params.selector];
        } else if (toolCall.tool === "WebToolkit_fillInput") {
          params = [toolCall.params.selector, toolCall.params.value];
        } else if (toolCall.tool === "WebToolkit_selectOption") {
          params = [
            toolCall.params.selectSelector,
            toolCall.params.optionSelector,
          ];
        } else if (toolCall.tool === "WebToolkit_scrollToElement") {
          params = [toolCall.params.selector];
        } else if (toolCall.tool === "WebToolkit_waitForElement") {
          params = [toolCall.params.selector, toolCall.params.timeout];
        } else if (toolCall.tool === "WebToolkit_extractText") {
          params = [toolCall.params.selector];
        } else if (toolCall.tool === "WebToolkit_extractAttribute") {
          params = [toolCall.params.selector, toolCall.params.attribute];
        } else {
          // Default case: convert object values to array
          params = Object.values(toolCall.params);
        }
      } else {
        params = [toolCall.params];
      }

      const result = await tool(...params);
      console.log("Local tool execution result:", result);
      return result;
    } catch (error) {
      console.error("Error executing tool:", error);
      throw error;
    }
  }

  async executeToolCalls(toolCalls: ToolCall[]): Promise<any[]> {
    const results = [];

    for (const toolCall of toolCalls) {
      try {
        console.log("Executing tool call:", toolCall);
        const result = await this.executeTool(toolCall);
        console.log("Tool execution successful:", result);
        results.push({
          tool: toolCall.tool,
          success: true,
          result,
        });
      } catch (error) {
        console.error("Tool execution failed:", error);
        results.push({
          tool: toolCall.tool,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });

        // Only stop execution if it's a critical error
        if (
          error instanceof Error &&
          error.message.includes("Tool not found")
        ) {
          break;
        }
      }
    }

    return results;
  }

  parseToolCalls(aiResponse: string): ToolCall[] {
    try {
      // Clean the response string
      const cleanedResponse = aiResponse.trim();
      console.log("Parsing response for tool calls:", cleanedResponse);

      // First try to extract URL directly
      const urlMatch = cleanedResponse.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        console.log("Found URL in response:", urlMatch[0]);
        return [
          {
            tool: "TabToolkit_openTab",
            params: { url: urlMatch[0] },
          },
        ];
      }

      // Try to find JSON content in code blocks
      const codeBlockMatch = cleanedResponse.match(
        /```(?:json)?\n([\s\S]*?)\n```/
      );
      if (codeBlockMatch) {
        try {
          const jsonContent = codeBlockMatch[1].trim();
          console.log("Found JSON content:", jsonContent);
          const parsed = JSON.parse(jsonContent);

          if (parsed && typeof parsed === "object") {
            const toolCalls = Array.isArray(parsed) ? parsed : [parsed];
            return toolCalls.map((call) => ({
              tool: call.tool,
              params: call.params || {},
            }));
          }
        } catch (error) {
          console.error("Failed to parse JSON content:", error);
        }
      }

      // Handle Chinese instructions
      const actionMatch = cleanedResponse.match(
        /(打开|访问|浏览|查看)\s*([^\s]+)/
      );
      if (actionMatch) {
        const action = actionMatch[1];
        const target = actionMatch[2];
        console.log("Found action and target:", action, target);

        // Map common site names to URLs
        const siteMap: Record<string, string> = {
          twitter: "https://twitter.com",
          youtube: "https://youtube.com",
          github: "https://github.com",
          google: "https://google.com",
          百度: "https://baidu.com",
          知乎: "https://zhihu.com",
          微博: "https://weibo.com",
          马斯克: "https://twitter.com/elonmusk",
          elon: "https://twitter.com/elonmusk",
        };

        let url = target;
        if (!target.startsWith("http")) {
          url = siteMap[target.toLowerCase()] || `https://${target}`;
        }

        console.log("Generated URL:", url);
        return [
          {
            tool: "TabToolkit_openTab",
            params: { url },
          },
        ];
      }

      // Handle direct tool calls in the format: tool_name(params)
      const toolCallMatch = cleanedResponse.match(/(\w+)\((.*)\)/);
      if (toolCallMatch) {
        const toolName = toolCallMatch[1];
        const paramsStr = toolCallMatch[2];

        // Handle URL parameters directly
        if (paramsStr.startsWith("http")) {
          return [
            {
              tool: toolName,
              params: { url: paramsStr },
            },
          ];
        }

        try {
          // Try to parse as JSON, but handle string parameters
          let params;
          try {
            params = JSON.parse(paramsStr);
          } catch (e) {
            // If it's not valid JSON, treat it as a string parameter
            params = { url: paramsStr };
          }

          return [
            {
              tool: toolName,
              params,
            },
          ];
        } catch (error) {
          console.error("Failed to parse tool call parameters:", error);
        }
      }

      console.error("Could not parse any tool calls from response");
      return [];
    } catch (error) {
      console.error("Error parsing tool calls:", error);
      return [];
    }
  }
}

// Singleton instance
export const toolExecutor = new ToolExecutor();
