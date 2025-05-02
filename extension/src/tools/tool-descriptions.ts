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
      description:
        "Open a new tab with the specified URL. If the URL is already open in another tab, do not open a new one. Return the existing tabId and mark it as alreadyOpened.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to open in a tab. Exact match required.",
          },
        },
        required: ["url"],
      },
      returns: {
        type: "object",
        description: "Result of attempting to open or reuse a tab",
        properties: {
          tabId: {
            type: "number",
            description: "ID of the opened or reused tab",
          },
          alreadyOpened: {
            type: "boolean",
            description: "Whether the URL was already open in an existing tab",
          },
          success: {
            type: "boolean",
            description: "Whether the tab was opened or found successfully",
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
    // {
    //   name: "WebToolkit_getPageSource",
    //   description:
    //     "Get the HTML and JavaScript source code of the current page",
    //   parameters: {
    //     type: "object",
    //     properties: {
    //       includeHtml: {
    //         type: "boolean",
    //         description: "Whether to include HTML source code",
    //       },
    //     },
    //   },
    //   returns: {
    //     type: "object",
    //     description: "Source code from the page",
    //     properties: {
    //       html: {
    //         type: "string",
    //         description: "The HTML source code of the page",
    //       },
    //     },
    //   },
    // },
    // {
    //   name: "WebToolkit_getPageContent",
    //   description:
    //     "Get the content of the current page, get the text content of the page, markdown format",
    //   parameters: {
    //     type: "object",
    //     properties: {},
    //   },
    //   returns: {
    //     type: "object",
    //     description:
    //       "Content of the current page, get the text content of the page, markdown format",
    //     properties: {
    //       content: {
    //         type: "string",
    //         description:
    //           "The content of the current page, get the text content of the page, markdown format",
    //       },
    //     },
    //   },
    // },
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
      description: "Types text into a specified input element on the page.",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "CSS selector for the target input element.",
          },
          value: {
            type: "string",
            description: "The text to input into the element.",
          },
          options: {
            type: "object",
            description: "Optional configuration for input behavior.",
            properties: {
              clearFirst: {
                type: "boolean",
                description:
                  "If true, clears existing content before inputting. Default: true.",
              },
              delay: {
                type: "number",
                description:
                  "Delay (in milliseconds) between keystrokes. Default: 100.",
              },
            },
          },
        },
        required: ["selector", "value"],
      },
      returns: {
        type: "object",
        description: "The result of the input action.",
        properties: {
          success: {
            type: "boolean",
            description: "Indicates whether the text was successfully input.",
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
            description: "Selector for the element to click",
          },
          options: {
            type: "object",
            description: "Click options",
            properties: {
              waitBefore: {
                type: "number",
                description:
                  "Time to wait before clicking in milliseconds, default: 100",
              },
              scrollIntoView: {
                type: "boolean",
                description:
                  "Whether to scroll the element into view before clicking, default: true (scroll the element into view)",
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
      name: "WebToolkit_listElements",
      description:
        "List all interactive elements on the page (buttons, inputs, etc.), optionally filtered by selectors",
      parameters: {
        type: "object",
        properties: {
          selectors: {
            type: "array",
            description:
              "Optional: list of selectors to filter elements, e.g. ['button', 'input', '[contenteditable=true]']. If omitted, all common interactive elements will be returned.",
            items: {
              type: "string",
            },
          },
        },
        required: [],
      },
      returns: {
        type: "object",
        description: "Structured list of found DOM elements and their metadata",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the operation was successful",
          },
          data: {
            type: "object",
            properties: {
              elements: {
                type: "array",
                description: "Array of elements found on the page",
                items: {
                  type: "object",
                  properties: {
                    tag: {
                      type: "string",
                      description:
                        "Tag name of the element (e.g., button, input)",
                    },
                    displayText: {
                      type: "string",
                      description:
                        "Merged visible text content (text, placeholder, aria-label, etc.)",
                    },
                    text: { type: "string", description: "Inner text content" },
                    placeholder: { type: "string" },
                    visible: {
                      type: "boolean",
                      description: "Whether the element is visible",
                    },
                    clickable: {
                      type: "boolean",
                      description: "Whether the element is likely clickable",
                    },
                    position: {
                      type: "object",
                      properties: {
                        x: { type: "number" },
                        y: { type: "number" },
                      },
                    },
                    boundingBox: {
                      type: "object",
                      description:
                        "Size and position of the element on screen (for screenshots/visual anchor)",
                      properties: {
                        x: { type: "number" },
                        y: { type: "number" },
                        width: { type: "number" },
                        height: { type: "number" },
                      },
                    },
                    attributes: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        class: { type: "string" },
                        type: { type: "string" },
                        disabled: { type: "boolean" },
                        "aria-label": { type: "string" },
                        "data-testid": { type: "string" },
                        contenteditable: { type: "boolean" },
                      },
                    },
                    parentTag: {
                      type: "string",
                      description: "Tag name of the direct parent node",
                    },
                    parentAttributes: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        class: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ];
};
