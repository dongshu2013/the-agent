import { TabToolkit } from "../tools/tab-toolkit";
import { WebToolkit } from "../tools/web-toolkit";

export interface ToolCall {
  function: {
    name: string;
    arguments: string;
  };
  id: string;
  type: string;
}

export class ToolExecutor {
  private webToolkit: WebToolkit;
  private toolMap: Record<string, (...args: any[]) => any>;

  constructor() {
    this.webToolkit = new WebToolkit();
    this.toolMap = {
      TabToolkit_openTab: TabToolkit.openTab,
      TabToolkit_closeTab: TabToolkit.closeTab,
      TabToolkit_listTabs: TabToolkit.listTabs,
      TabToolkit_switchToTab: TabToolkit.switchToTab,
      TabToolkit_waitForTabLoad: TabToolkit.waitForTabLoad,
      TabToolkit_getCurrentActiveTab: TabToolkit.getCurrentActiveTab,
      WebToolkit_findElement: this.webToolkit.findElement.bind(this.webToolkit),
      WebToolkit_clickElement: this.webToolkit.clickElement.bind(
        this.webToolkit
      ),
      WebToolkit_fillInput: this.webToolkit.fillInput.bind(this.webToolkit),
      WebToolkit_extractText: this.webToolkit.extractText.bind(this.webToolkit),
    };
  }

  async executeTool(toolCall: ToolCall): Promise<any> {
    try {
      if (!toolCall.function.name) {
        throw new Error("Tool name is required");
      }

      // 处理 TabToolkit 调用
      if (toolCall.function.name.startsWith("TabToolkit_")) {
        return this.executeTabToolkit(toolCall);
      }

      // 处理其他工具调用
      const tool = this.toolMap[toolCall.function.name];
      if (!tool) {
        throw new Error(`Tool ${toolCall.function.name} not found`);
      }

      const params = this.parseToolParams(toolCall);
      return await tool(params);
    } catch (error) {
      console.error("Error executing tool:", error);
      throw error;
    }
  }

  private async executeTabToolkit(toolCall: ToolCall): Promise<any> {
    return new Promise((resolve, reject) => {
      const params = this.parseToolParams(toolCall);

      const message = {
        name: "execute-tool",
        body: { name: toolCall.function.name, arguments: params },
      };

      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        if (!response) {
          reject(new Error("No response received from background script"));
          return;
        }

        response.success
          ? resolve(response.data)
          : reject(new Error(response.error || "Unknown error"));
      });
    });
  }

  private parseToolParams(toolCall: ToolCall): any {
    try {
      return toolCall.function.arguments
        ? JSON.parse(toolCall.function.arguments)
        : {};
    } catch (error) {
      console.error("Error parsing tool arguments:", error);
      return {};
    }
  }

  async executeToolCalls(toolCalls: ToolCall[]): Promise<string> {
    const results = [];

    try {
      for (const toolCall of toolCalls) {
        try {
          const result = await this.executeTool(toolCall);
          results.push({
            name: toolCall.function.name,
            success: true,
            result,
          });
        } catch (error) {
          results.push({
            name: toolCall.function.name,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return results
        .map((result) =>
          result.success
            ? `Tool "${result.name}" succeeded: ${JSON.stringify(result.result)}`
            : `Tool "${result.name}" failed: ${result.error}`
        )
        .join("\n");
    } catch (error) {
      console.error("Error executing tool calls:", error);
      throw error;
    }
  }
}

// Singleton instance
export const toolExecutor = new ToolExecutor();
