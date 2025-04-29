export interface ToolCall {
  function: {
    name: string;
    arguments: string;
  };
  id: string;
  type: string;
}

export class ToolExecutor {
  async executeTool(toolCall: ToolCall): Promise<any> {
    try {
      if (!toolCall.function.name) {
        throw new Error("Tool name is required");
      }

      const toolName = toolCall.function.name;
      console.log(`Executing tool: ${toolName}`);

      // 处理 TabToolkit 调用
      if (toolName.startsWith("TabToolkit_")) {
        return await this.executeTabToolkit(toolCall);
      }

      // 处理 WebToolkit 调用
      if (toolName.startsWith("WebToolkit_")) {
        return await this.executeWebToolkit(toolCall);
      }

      // 处理 TgToolkit 调用
      if (toolName.startsWith("TgToolkit_")) {
        return await this.executeTgToolkit(toolCall);
      }

      throw new Error(`Unknown tool type: ${toolName}`);
    } catch (error) {
      console.error(`Error executing ${toolCall.function.name}:`, error);
      throw error;
    }
  }

  private async executeTgToolkit(toolCall: ToolCall): Promise<any> {
    const params = this.parseToolParams(toolCall);
    const message = {
      name: "execute-tool",
      body: { name: toolCall.function.name, arguments: params },
    };

    console.log("Sending TgToolkit message to background:", message);

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error("TgToolkit error:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        if (!response) {
          const error = new Error(
            "No response received from background script"
          );
          console.error(error);
          reject(error);
          return;
        }

        console.log("TgToolkit response:", response);

        if (!response.success) {
          const error = new Error(response.error || "Unknown error");
          console.error("TgToolkit failed:", error);
          reject(error);
          return;
        }

        resolve(response.data);
      });
    });
  }

  private async executeWebToolkit(toolCall: ToolCall): Promise<any> {
    const params = this.parseToolParams(toolCall);
    const message = {
      name: "execute-tool",
      body: { name: toolCall.function.name, arguments: params },
    };

    console.log("Sending WebToolkit message to background:", message);

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error("WebToolkit error:", chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        if (!response) {
          const error = new Error(
            "No response received from background script"
          );
          console.error(error);
          reject(error);
          return;
        }

        console.log("WebToolkit response:", response);

        if (!response.success) {
          const error = new Error(response.error || "Unknown error");
          console.error("WebToolkit failed:", error);
          reject(error);
          return;
        }

        resolve(response.data);
      });
    });
  }

  private async executeTabToolkit(toolCall: ToolCall): Promise<any> {
    const params = this.parseToolParams(toolCall);
    const message = {
      name: "execute-tool",
      body: { name: toolCall.function.name, arguments: params },
    };

    console.log("Sending TabToolkit message to background:", message);

    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        if (!response) {
          const error = new Error(
            "No response received from background script"
          );
          console.error(error);
          reject(error);
          return;
        }

        console.log("TabToolkit response:", response);

        if (!response.success) {
          const error = new Error(response.error || "Unknown error");
          console.error("TabToolkit failed:", error);
          reject(error);
          return;
        }

        resolve(response.data);
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

  async executeToolCall(
    toolCall: ToolCall
  ): Promise<{ success: boolean; data: any }> {
    try {
      return await this.executeTool(toolCall);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Tool execution failed:", message);
      return { success: false, data: message };
    }
  }
}

// Singleton instance
export const toolExecutor = new ToolExecutor();
