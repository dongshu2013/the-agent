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
      description: "List all tabs in the current window",
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
      description:
        "Types text into a specified input element on the page. If the element is not found or not interactable, use listElements to find the correct selector. The selector can be a simple tag name (e.g., 'input'), a class name (e.g., '.username'), an ID (e.g., '#email'), or a combination of these with attributes (e.g., 'input[type=\"text\"]').",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description:
              "CSS selector for the target input element. Examples:\n- 'input' - any input\n- '.username' - input with class 'username'\n- '#email' - input with ID 'email'\n- 'input[type=\"text\"]' - text input\n- 'textarea' - any textarea\nIf the selector fails, use listElements to find the correct selector.",
          },
          value: {
            type: "string",
            description: "The text to input into the element",
          },
          options: {
            type: "object",
            description: "Optional configuration for input behavior",
            properties: {
              clearFirst: {
                type: "boolean",
                description:
                  "If true, clears existing content before inputting. Default: true",
              },
              delay: {
                type: "number",
                description:
                  "Delay (in milliseconds) between keystrokes. Default: 100",
              },
            },
          },
        },
        required: ["selector", "value"],
      },
      returns: {
        type: "object",
        description:
          "The result of the input action. If unsuccessful, use listElements to find the correct selector.",
        properties: {
          success: {
            type: "boolean",
            description: "Indicates whether the text was successfully input",
          },
          error: {
            type: "string",
            description:
              "Error message if the input failed. Common errors include: 'Element not found', 'Element is not visible', 'Element is not interactable'. If the selector is incorrect, use listElements to find the correct selector.",
          },
          data: {
            type: "object",
            description: "Additional information about the input operation",
            properties: {
              text: {
                type: "string",
                description: "Text content of the element",
              },
              value: {
                type: "string",
                description: "Value of the input element",
              },
              html: {
                type: "string",
                description: "HTML content of the element",
              },
            },
          },
        },
      },
    },
    {
      name: "WebToolkit_clickElement",
      description:
        "Click an element on the page. The element must be visible and clickable. Always use listElements first to find the correct selector.",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: `CSS selector for the element to click. Use listElements first to find the correct selector.

Best practices for selectors:
1. Prefer attribute selectors for interactive elements:
   - '[role="button"]'
   - '[aria-label="Submit"]'
   - '[data-testid="submitButton"]'
   - 'button[type="submit"]'

2. Use specific class or id if available:
   - '.submit-button'
   - '#submitButton'

3. Combine selectors for more precision:
   - 'button.primary[type="submit"]'
   - '.form-container button[type="submit"]'

4. Avoid relying on text content alone as it may change

If click fails:
1. Use listElements to verify the element exists
2. Check if element is visible and interactive
3. Try a more specific selector`,
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
            description: "Whether the click was successful",
          },
          error: {
            type: "string",
            description:
              "Error details if click failed, including why the element was not clickable",
          },
          data: {
            type: "object",
            description: "Information about the clicked element",
            properties: {
              text: {
                type: "string",
                description: "Element's text content",
              },
              html: {
                type: "string",
                description: "Element's HTML structure",
              },
              clicked: {
                type: "boolean",
                description: "Whether click was performed",
              },
              position: {
                type: "object",
                description: "Click coordinates",
                properties: {
                  x: { type: "number" },
                  y: { type: "number" },
                },
              },
              elementState: {
                type: "object",
                description: "Element state when clicked",
                properties: {
                  isVisible: { type: "boolean" },
                  isEnabled: { type: "boolean" },
                  attributes: { type: "object" },
                },
              },
            },
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
      description:
        "Refresh the current page based on the user's context. This will reload the current page and wait for it to be fully loaded. The page to refresh is determined by the user's current context and cannot be specified directly.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description:
              "The URL of the page to refresh. Default: determined by the user's current context",
          },
          waitForLoad: {
            type: "boolean",
            description:
              "Whether to wait for the page to be fully loaded after refresh. Default: true",
          },
          timeout: {
            type: "number",
            description:
              "Maximum time to wait for page load in milliseconds. Default: 5000",
          },
        },
      },
      returns: {
        type: "object",
        description: "Result of the refresh operation",
        properties: {
          success: {
            type: "boolean",
            description:
              "Whether the page was successfully refreshed and loaded",
          },
          error: {
            type: "string",
            description:
              "Error message if the refresh failed. Common errors include: 'Page load timeout', 'Navigation failed', 'No active page to refresh'",
          },
          data: {
            type: "object",
            description: "Additional information about the refresh operation",
            properties: {
              url: {
                type: "string",
                description: "The URL of the refreshed page",
              },
              loadTime: {
                type: "number",
                description: "Time taken for the page to load in milliseconds",
              },
              status: {
                type: "string",
                description:
                  "Final status of the page after refresh (complete, loading, error)",
              },
            },
          },
        },
      },
    },
    {
      name: "WebToolkit_listElements",
      description:
        "List elements on the page that match the given selector. Use this tool first to find the correct selector before attempting to click or input. Returns detailed information about matching elements including their attributes, text content, and role.",
      parameters: {
        type: "object",
        properties: {
          selectors: {
            type: "string",
            description: `CSS selector to find elements. Common selector patterns:
1. Basic selectors:
   - tag: 'button', 'input', 'a'
   - class: '.classname'
   - id: '#elementId'
   - attribute: '[attr="value"]'

2. Attribute selectors:
   - '[role="button"]' - elements with role attribute
   - '[aria-label="Submit"]' - elements with aria-label
   - '[data-testid="submitButton"]' - elements with data-testid
   - '[type="submit"]' - input/button type

3. Combining selectors:
   - 'button.primary' - button with class
   - 'button[type="submit"]' - button with type
   - '.container button' - button inside container

4. Multiple elements:
   - 'button, [role="button"]' - buttons and button-like elements
   - 'input[type="text"], textarea' - text inputs

Always use listElements first to find the correct selector before clicking or inputting.`,
          },
        },
      },
      returns: {
        type: "object",
        description: "List of matching elements with their properties",
        properties: {
          success: {
            type: "boolean",
            description: "Whether elements were found",
          },
          data: {
            type: "object",
            properties: {
              elements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    selector: {
                      type: "string",
                      description: "Unique selector for this element",
                    },
                    text: {
                      type: "string",
                      description: "Text content of the element",
                    },
                    type: {
                      type: "string",
                      description: "Element type (button, input, link, etc)",
                    },
                    attributes: {
                      type: "object",
                      description:
                        "Element attributes (role, aria-label, data-testid, etc)",
                    },
                    isVisible: {
                      type: "boolean",
                      description: "Whether the element is visible",
                    },
                    isInteractive: {
                      type: "boolean",
                      description: "Whether the element can be interacted with",
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
