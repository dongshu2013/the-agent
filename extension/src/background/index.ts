import { sendChatRequest } from "../services/api";
import { executeTool } from "../services/tools";

// 设置面板行为
chrome.runtime.onInstalled.addListener(() => {
  // 设置侧边面板在点击扩展图标时打开
  if (chrome.sidePanel) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error("Error setting panel behavior:", error));
  }
});

// 添加点击处理程序作为备用
chrome.action.onClicked.addListener((tab) => {
  // 当点击扩展图标时强制打开侧边面板
  try {
    if (chrome.sidePanel) {
      // 检查是否可以为此窗口打开侧边面板
      if (tab.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
      }
    }
  } catch (error) {
    console.error("Error opening side panel:", error);
  }
});

// 处理来自侧边面板的消息
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  // 处理process-request消息
  if (message.name === "process-request") {
    const { apiKey, request } = message.body;

    // 使用API服务处理请求
    (async () => {
      try {
        // Step 1: Send initial request to API
        const initialResponse = await sendChatRequest(
          {
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful AI assistant named MIZU Agent. Answer questions succinctly and professionally. When a user asks about information that requires tools (like weather, time, etc.), identify the need and call the appropriate function.",
              },
              {
                role: "user",
                content: request,
              },
            ],
            tools: AVAILABLE_TOOLS,
          },
          apiKey
        );

        if (!initialResponse.success) {
          throw new Error(
            initialResponse.error || "Failed to get response from model"
          );
        }

        // Step 2: Check for tool calls
        if (
          initialResponse.tool_calls &&
          initialResponse.tool_calls.length > 0
        ) {
          // Process the tool call
          const toolCall = initialResponse.tool_calls[0];
          const { name, arguments: args } = toolCall;

          // Step 3: Execute the tool locally
          const toolResult = await executeTool(name, args);

          // Create messages with tool result
          const messagesWithToolResult = [
            {
              role: "system",
              content:
                "You are a helpful AI assistant named MIZU Agent. Answer questions succinctly and professionally.",
            },
            {
              role: "user",
              content: request,
            },
            {
              role: "assistant",
              content: initialResponse.data.choices[0].message.content || "",
              function_call: {
                name,
                arguments: JSON.stringify(args),
              },
            },
            {
              role: "function",
              name,
              content: JSON.stringify(
                toolResult.success
                  ? toolResult.result
                  : { error: toolResult.error }
              ),
            },
          ];

          // Step 4: Send the result back
          const followUpResponse = await sendChatRequest(
            { messages: messagesWithToolResult },
            apiKey
          );

          if (!followUpResponse.success) {
            throw new Error(
              followUpResponse.error ||
                "Failed to get follow-up response from model"
            );
          }

          // Step 5: Send the final response
          sendResponse({
            result: followUpResponse.data.choices[0].message.content,
            error: null,
            toolUsed: {
              name,
              result: toolResult.success
                ? toolResult.result
                : { error: toolResult.error },
            },
          });
        } else {
          // No tool calls, just return the initial response
          sendResponse({
            result: initialResponse.data.choices[0].message.content,
            error: null,
          });
        }
      } catch (error) {
        console.error("Error processing request:", error);
        sendResponse({
          result: null,
          error:
            error instanceof Error
              ? error.message
              : "Unknown error occurred while processing the request",
        });
      }
    })();

    return true; // 用于异步响应
  }

  // 处理来自content script的工具执行请求
  if (message.name === "EXECUTE_TOOLKIT") {
    const { method, args } = message;

    // 转发到活动标签页的content script
    (async () => {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (!tab || !tab.id) {
          throw new Error("No active tab found");
        }

        const result = await chrome.tabs.sendMessage(tab.id, {
          type: "EXECUTE_TOOLKIT",
          method,
          args,
        });

        sendResponse(result);
      } catch (error) {
        console.error("Toolkit execution error:", error);
        sendResponse({
          error: "Error executing toolkit method",
        });
      }
    })();

    return true; // 用于异步响应
  }
});

// 在扩展安装时创建上下文菜单项
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");

  // 添加右键菜单
  chrome.contextMenus.create({
    id: "mizu-agent",
    title: "Analyze with MIZU",
    contexts: ["selection"],
  });
});

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "mizu-agent" && info.selectionText) {
    // 打开侧边面板并发送选中的文本
    if (tab?.windowId && chrome.sidePanel) {
      chrome.sidePanel.open({ windowId: tab.windowId }).then(() => {
        // 发送选中的文本到侧边面板
        chrome.runtime.sendMessage({
          name: "selected-text",
          text: info.selectionText,
        });
      });
    }
  }
});
