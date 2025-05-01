// Define the structure of tool descriptions
export interface ToolDescription {
  name: string;
  description: string;
  parameters?: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
  returns?: {
    type: string;
    description: string;
    properties?: Record<string, any>;
  };
}

// Generate tool descriptions for AI model
export const getToolDescriptions = (): ToolDescription[] => {
  return [
    // Telegram Toolkit Tools
    {
      name: "TgToolkit_getDialogs",
      description: "Get a list of user's Telegram dialogs",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of dialogs to return (default: 100)",
          },
          offset: {
            type: "number",
            description: "Offset for pagination (default: 0)",
          },
          chatTitle: {
            type: "string",
            description: "Optional filter by chat title",
          },
          isPublic: {
            type: "boolean",
            description: "Optional filter by public status",
          },
          isFree: {
            type: "boolean",
            description: "Optional filter by free status",
          },
          status: {
            type: "string",
            description: "Optional filter by status",
          },
          sortBy: {
            type: "string",
            description: "Field to sort by (default: 'updated_at')",
          },
          sortOrder: {
            type: "string",
            description: "Sort order (default: 'desc')",
          },
        },
      },
      returns: {
        type: "object",
        description: "List of Telegram dialogs",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the operation was successful",
          },
          data: {
            type: "object",
            description:
              "Dialog data including list of dialogs and pagination info",
          },
        },
      },
    },
    {
      name: "TgToolkit_getMessages",
      description: "Get messages from a specified chat",
      parameters: {
        type: "object",
        properties: {
          chatId: {
            type: "string",
            description: "ID of the chat to get messages from",
          },
          limit: {
            type: "number",
            description: "Maximum number of messages to return (default: 100)",
          },
          offset: {
            type: "number",
            description: "Offset for pagination (default: 0)",
          },
          messageText: {
            type: "string",
            description: "Optional filter by message text",
          },
          senderId: {
            type: "string",
            description: "Optional filter by sender ID",
          },
          startTimestamp: {
            type: "number",
            description: "Optional filter by start timestamp",
          },
          endTimestamp: {
            type: "number",
            description: "Optional filter by end timestamp",
          },
          sortBy: {
            type: "string",
            description: "Field to sort by (default: 'message_timestamp')",
          },
          sortOrder: {
            type: "string",
            description: "Sort order (default: 'desc')",
          },
        },
        required: ["chatId"],
      },
      returns: {
        type: "object",
        description: "List of messages from the specified chat",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the operation was successful",
          },
          data: {
            type: "object",
            description:
              "Message data including list of messages and pagination info",
          },
        },
      },
    },
    {
      name: "TgToolkit_searchMessages",
      description: "Search messages based on vector similarity",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query",
          },
          chatId: {
            type: "string",
            description: "Optional chat ID to limit search to",
          },
          topK: {
            type: "number",
            description: "Maximum number of results to return (default: 10)",
          },
          messageRange: {
            type: "number",
            description:
              "Number of messages before and after the match to include (default: 2)",
          },
          threshold: {
            type: "number",
            description: "Similarity threshold (default: 0.7)",
          },
          isPublic: {
            type: "boolean",
            description: "Optional filter by public status",
          },
          isFree: {
            type: "boolean",
            description: "Optional filter by free status",
          },
        },
        required: ["query"],
      },
      returns: {
        type: "object",
        description: "Search results with matching messages and their context",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the operation was successful",
          },
          data: {
            type: "object",
            description:
              "Search results including matching messages and their context",
          },
        },
      },
    },
    // Tab Toolkit Tools
    {
      name: "TabToolkit_openTab",
      description: "Open a new tab with the specified URL",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to open in the new tab",
          },
        },
        required: ["url"],
      },
      returns: {
        type: "object",
        description: "Information about the newly opened tab",
        properties: {
          tabId: {
            type: "number",
            description: "The ID of the newly opened tab",
          },
          success: {
            type: "boolean",
            description: "Whether the tab was successfully opened",
          },
        },
      },
    },
    {
      name: "TabToolkit_closeTab",
      description: "Close a specific tab by its ID",
      parameters: {
        type: "object",
        properties: {
          tabId: {
            type: "number",
            description: "The ID of the tab to close",
          },
        },
        required: ["tabId"],
      },
      returns: {
        type: "object",
        description: "Result of the close operation",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the tab was successfully closed",
          },
        },
      },
    },
    {
      name: "TabToolkit_listTabs",
      description: "List all tabs",
      returns: {
        type: "array",
        description: "List of matching tabs",
        properties: {
          items: {
            type: "object",
            properties: {
              tabId: {
                type: "number",
                description: "tab ID",
              },
              url: {
                type: "string",
                description: "tab url",
              },
              title: {
                type: "string",
                description: "tab title",
              },
            },
          },
        },
      },
    },
    {
      name: "TabToolkit_switchToTab",
      description: "Switch to a specific tab by its ID",
      parameters: {
        type: "object",
        properties: {
          tabId: {
            type: "number",
            description: "The ID of the tab to switch to",
          },
        },
        required: ["tabId"],
      },
      returns: {
        type: "object",
        description: "Result of the switch operation",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the switch was successful",
          },
        },
      },
    },
    {
      name: "TabToolkit_getCurrentActiveTab",
      description: "Get the currently active tab in the current window",
      parameters: {
        type: "object",
        properties: {},
      },
      returns: {
        type: "object",
        description: "Information about the active tab",
        properties: {
          tabId: {
            type: "number",
            description: "The ID of the active tab",
          },
          url: {
            type: "string",
            description: "The URL of the active tab",
          },
          title: {
            type: "string",
            description: "The title of the active tab",
          },
        },
      },
    },
    // Web Toolkit Tools
    {
      name: "WebToolkit_getPageSource",
      description:
        "Get the HTML and JavaScript source code of the current page",
      parameters: {
        type: "object",
        properties: {
          includeHtml: {
            type: "boolean",
            description: "Whether to include HTML source code",
          },
        },
      },
      returns: {
        type: "object",
        description: "Source code from the page",
        properties: {
          html: {
            type: "string",
            description: "The HTML source code of the page",
          },
        },
      },
    },
    {
      name: "WebToolkit_screenshot",
      description: "Take a screenshot of the current page",
      parameters: {
        type: "object",
        properties: {
          fullPage: {
            type: "boolean",
            description:
              "Whether to capture the full page or just the viewport",
          },
        },
      },
      returns: {
        type: "object",
        description: "Screenshot data",
        properties: {
          dataUrl: {
            type: "string",
            description: "Base64 encoded data of the screenshot",
          },
          success: {
            type: "boolean",
            description: "Whether the screenshot was successfully taken",
          },
        },
      },
    },
    {
      name: "WebToolkit_inputElement",
      description: "Input text into a form element",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the input element",
          },
          value: {
            type: "string",
            description: "Text to input",
          },
          options: {
            type: "object",
            description: "Input options",
            properties: {
              clearFirst: {
                type: "boolean",
                description: "Whether to clear existing content before input",
              },
              delay: {
                type: "number",
                description: "Delay between keystrokes in milliseconds",
              },
            },
          },
        },
        required: ["selector", "value"],
      },
      returns: {
        type: "object",
        description: "Result of the input operation",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the text was successfully input",
          },
        },
      },
    },
    {
      name: "WebToolkit_clickElement",
      description: "Click on an element on the page",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the element to click",
          },
          options: {
            type: "object",
            description: "Click options",
            properties: {
              waitBefore: {
                type: "number",
                description: "Time to wait before clicking in milliseconds",
              },
              scrollIntoView: {
                type: "boolean",
                description:
                  "Whether to scroll the element into view before clicking",
              },
            },
          },
        },
        required: ["selector"],
      },
      returns: {
        type: "object",
        description: "Result of the click operation",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the element was successfully clicked",
          },
        },
      },
    },
    {
      name: "WebToolkit_scrollToElement",
      description: "Scroll the page to bring an element into view",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the element to scroll to",
          },
          options: {
            type: "object",
            description: "Scroll options",
            properties: {
              behavior: {
                type: "string",
                description: "Scroll behavior (smooth or auto)",
                enum: ["smooth", "auto"],
              },
              block: {
                type: "string",
                description: "Vertical alignment (start, center, end, nearest)",
                enum: ["start", "center", "end", "nearest"],
              },
            },
          },
        },
        required: ["selector"],
      },
      returns: {
        type: "object",
        description: "Result of the scroll operation",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the page was successfully scrolled",
          },
        },
      },
    },
    {
      name: "WebToolkit_refreshPage",
      description: "Refresh the current page",
      parameters: {
        type: "object",
        properties: {},
      },
      returns: {
        type: "object",
        description: "Result of the refresh operation",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the page was successfully refreshed",
          },
        },
      },
    },
    {
      name: "WebToolkit_findElement",
      description: "Find an element on the page using CSS selector",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the element to find",
          },
        },
        required: ["selector"],
      },
      returns: {
        type: "object",
        description: "Result of the find operation",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the element was successfully found",
          },
          element: {
            type: "object",
            description: "Information about the found element",
          },
        },
      },
    },
  ];
};
