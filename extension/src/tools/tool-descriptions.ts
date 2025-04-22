// Define the structure of tool descriptions
export interface ToolDescription {
  name: string;
  description: string;
  parameters: {
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
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "list tabs by exact URL to match",
          },
          title: {
            type: "string",
            description: "list tabs by exact title to match",
          },
        },
      },
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
      name: "TabToolkit_switchTab",
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
      name: "TabToolkit_waitForTabLoad",
      description: "Wait for a specific tab to finish loading",
      parameters: {
        type: "object",
        properties: {
          tabId: {
            type: "number",
            description: "The ID of the tab to wait for",
          },
          timeout: {
            type: "number",
            description: "Maximum wait time in milliseconds (default: 10000)",
          },
        },
        required: ["tabId"],
      },
      returns: {
        type: "object",
        description: "Result of the wait operation",
        properties: {
          success: {
            type: "boolean",
            description:
              "Whether the tab loaded successfully within the timeout",
          },
          status: {
            type: "string",
            description: "The status of the tab (complete, loading, error)",
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
    //   name: "TabToolkit_handleTwitterSequence",
    //   description: "Handle a sequence of tab operations for Twitter",
    //   parameters: {
    //     type: "object",
    //     properties: {},
    //     required: [],
    //   },
    //   returns: {
    //     type: "object",
    //     description: "Result of the Twitter sequence operation",
    //     properties: {
    //       success: {
    //         type: "boolean",
    //         description: "Whether the sequence was completed successfully",
    //       },
    //       error: {
    //         type: "string",
    //         description: "Error message if the sequence failed",
    //       },
    //     },
    //   },
    // },

    // Web Toolkit Tools
    {
      name: "WebToolkit_getPageContent",
      description: "Get the content of the current page",
      parameters: {
        type: "object",
        properties: {
          tabId: {
            type: "number",
            description: "The ID of the tab to get content from",
          },
          selector: {
            type: "string",
            description: "CSS selector to get specific content (optional)",
          },
        },
        required: ["tabId"],
      },
      returns: {
        type: "object",
        description: "Content from the page",
        properties: {
          content: {
            type: "string",
            description:
              "The HTML or text content of the page or selected element",
          },
          success: {
            type: "boolean",
            description: "Whether the content was successfully retrieved",
          },
        },
      },
    },
    {
      name: "WebToolkit_clickElement",
      description: "Click on a specific element in the current page",
      parameters: {
        type: "object",
        properties: {
          selector: {
            type: "string",
            description: "The CSS selector for the element to click",
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
          error: {
            type: "string",
            description: "Error message if the click failed",
          },
        },
      },
    },
    {
      name: "WebToolkit_fillForm",
      description: "Fill out a form on the current page",
      parameters: {
        type: "object",
        properties: {
          formData: {
            type: "object",
            description:
              "An object containing form field selectors and their values",
            additionalProperties: {
              type: "string",
            },
          },
        },
        required: ["formData"],
      },
      returns: {
        type: "object",
        description: "Result of the form fill operation",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the form field was successfully filled",
          },
          error: {
            type: "string",
            description: "Error message if the operation failed",
          },
        },
      },
    },
    {
      name: "WebToolkit_scrollPage",
      description: "Scroll the page",
      parameters: {
        type: "object",
        properties: {
          tabId: {
            type: "number",
            description: "The ID of the tab to scroll",
          },
          direction: {
            type: "string",
            description: "Direction to scroll (up, down, left, right)",
            enum: ["up", "down", "left", "right"],
          },
          amount: {
            type: "number",
            description: "Amount to scroll in pixels",
          },
        },
        required: ["tabId", "direction"],
      },
      returns: {
        type: "object",
        description: "Result of the scroll operation",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the page was successfully scrolled",
          },
          newPosition: {
            type: "object",
            description: "New scroll position",
            properties: {
              x: {
                type: "number",
                description: "Horizontal scroll position",
              },
              y: {
                type: "number",
                description: "Vertical scroll position",
              },
            },
          },
        },
      },
    },
    {
      name: "WebToolkit_takeScreenshot",
      description: "Take a screenshot of the current page",
      parameters: {
        type: "object",
        properties: {
          tabId: {
            type: "number",
            description: "The ID of the tab to screenshot",
          },
          fullPage: {
            type: "boolean",
            description:
              "Whether to capture the full page or just the viewport",
          },
        },
        required: ["tabId"],
      },
      returns: {
        type: "object",
        description: "Result of the screenshot operation",
        properties: {
          success: {
            type: "boolean",
            description: "Whether the screenshot was successfully taken",
          },
          dataUrl: {
            type: "string",
            description: "Base64 encoded data URL of the screenshot image",
          },
        },
      },
    },
  ];
};
