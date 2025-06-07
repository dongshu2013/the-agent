import { ToolDescription } from '~/types/tools';

// Generate tool descriptions for AI model
export const getToolDescriptions = (): ToolDescription[] => {
  return [
    // Telegram Toolkit Tools
    {
      name: 'TgToolkit_getDialogs',
      description: "Get a list of user's Telegram dialogs",
      parameters: {
        type: 'object',
        properties: {
          limit: {
            type: 'number',
            description: 'Maximum number of dialogs to return (default: 100)',
          },
          offset: {
            type: 'number',
            description: 'Offset for pagination (default: 0)',
          },
          chatTitle: {
            type: 'string',
            description: 'Optional filter by chat title',
          },
          isPublic: {
            type: 'boolean',
            description: 'Optional filter by public status',
          },
          isFree: {
            type: 'boolean',
            description: 'Optional filter by free status',
          },
          status: {
            type: 'string',
            description: 'Optional filter by status',
          },
          sortBy: {
            type: 'string',
            description: "Field to sort by (default: 'updated_at')",
          },
          sortOrder: {
            type: 'string',
            description: "Sort order (default: 'desc')",
          },
        },
      },
      returns: {
        type: 'object',
        description: 'List of Telegram dialogs',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the operation was successful',
          },
          data: {
            type: 'object',
            description: 'Dialog data including list of dialogs and pagination info',
          },
        },
      },
    },
    {
      name: 'TgToolkit_getMessages',
      description: 'Get messages from a specified chat',
      parameters: {
        type: 'object',
        properties: {
          chatId: {
            type: 'string',
            description: 'ID of the chat to get messages from',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of messages to return (default: 100)',
          },
          offset: {
            type: 'number',
            description: 'Offset for pagination (default: 0)',
          },
          messageText: {
            type: 'string',
            description: 'Optional filter by message text',
          },
          senderId: {
            type: 'string',
            description: 'Optional filter by sender ID',
          },
          startTimestamp: {
            type: 'number',
            description: 'Optional filter by start timestamp',
          },
          endTimestamp: {
            type: 'number',
            description: 'Optional filter by end timestamp',
          },
          sortBy: {
            type: 'string',
            description: "Field to sort by (default: 'message_timestamp')",
          },
          sortOrder: {
            type: 'string',
            description: "Sort order (default: 'desc')",
          },
        },
        required: ['chatId'],
      },
      returns: {
        type: 'object',
        description: 'List of messages from the specified chat',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the operation was successful',
          },
          data: {
            type: 'object',
            description: 'Message data including list of messages and pagination info',
          },
        },
      },
    },
    // {
    //   name: "TgToolkit_searchMessages",
    //   description: "Search messages based on vector similarity",
    //   parameters: {
    //     type: "object",
    //     properties: {
    //       query: {
    //         type: "string",
    //         description: "Search query",
    //       },
    //       chatId: {
    //         type: "string",
    //         description: "Optional chat ID to limit search to",
    //       },
    //       topK: {
    //         type: "number",
    //         description: "Maximum number of results to return (default: 10)",
    //       },
    //       messageRange: {
    //         type: "number",
    //         description:
    //           "Number of messages before and after the match to include (default: 2)",
    //       },
    //       threshold: {
    //         type: "number",
    //         description: "Similarity threshold (default: 0.7)",
    //       },
    //       isPublic: {
    //         type: "boolean",
    //         description: "Optional filter by public status",
    //       },
    //       isFree: {
    //         type: "boolean",
    //         description: "Optional filter by free status",
    //       },
    //     },
    //     required: ["query"],
    //   },
    //   returns: {
    //     type: "object",
    //     description: "Search results with matching messages and their context",
    //     properties: {
    //       success: {
    //         type: "boolean",
    //         description: "Whether the operation was successful",
    //       },
    //       data: {
    //         type: "object",
    //         description:
    //           "Search results including matching messages and their context",
    //       },
    //     },
    //   },
    // },
    // Tab Toolkit Tools
    {
      name: 'TabToolkit_openTab',
      description:
        "Open a new browser tab with the specified URL. If a tab with the exact same URL is already open, do not open a new tab—instead, return the existing tab's ID and indicate that it was already open. Use this tool to help the user navigate to a specific website or web application.",
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description:
              "The full URL to open in a new browser tab. Must be a valid and complete URL (e.g., 'https://twitter.com').",
          },
        },
        required: ['url'],
      },
      returns: {
        type: 'object',
        description: 'Information about the tab that was opened or reused.',
        properties: {
          tabId: {
            type: 'number',
            description: 'The unique ID of the tab that was opened or reused.',
          },
          alreadyOpened: {
            type: 'boolean',
            description: 'True if the tab was already open, false if a new tab was created.',
          },
          success: {
            type: 'boolean',
            description: 'True if the operation succeeded, false otherwise.',
          },
          error: {
            type: 'string',
            description: 'Error message if the operation failed.',
          },
        },
      },
    },
    {
      name: 'TabToolkit_closeTab',
      description: 'Close a specific tab by its ID',
      parameters: {
        type: 'object',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the tab to close',
          },
        },
        required: ['tabId'],
      },
      returns: {
        type: 'object',
        description: 'Result of the close operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the tab was successfully closed',
          },
        },
      },
    },
    {
      name: 'TabToolkit_listTabs',
      description: 'List all tabs in the current window',
      returns: {
        type: 'array',
        description: 'List of matching tabs',
        properties: {
          items: {
            type: 'object',
            description: 'Tab information',
            properties: {
              tabId: {
                type: 'number',
                description: 'tab ID',
              },
              url: {
                type: 'string',
                description: 'tab url',
              },
              title: {
                type: 'string',
                description: 'tab title',
              },
            },
          },
        },
      },
    },
    {
      name: 'TabToolkit_switchToTab',
      description: 'Switch to a specific tab by its ID',
      parameters: {
        type: 'object',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the tab to switch to',
          },
        },
        required: ['tabId'],
      },
      returns: {
        type: 'object',
        description: 'Result of the switch operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the switch was successful',
          },
        },
      },
    },
    {
      name: 'TabToolkit_getCurrentActiveTab',
      description: 'Get the currently active tab in the current window',
      parameters: {
        type: 'object',
        properties: {},
      },
      returns: {
        type: 'object',
        description: 'Information about the active tab',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the active tab',
          },
          url: {
            type: 'string',
            description: 'The URL of the active tab',
          },
          title: {
            type: 'string',
            description: 'The title of the active tab',
          },
        },
      },
    },
    {
      name: 'WebToolkit_getPageText',
      description: 'Get the HTML or text content of the current page',
      parameters: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            description: 'The format of the page text (html or text)',
          },
        },
      },
      returns: {
        type: 'object',
        description: 'Source code from the page',
        properties: {
          content: {
            type: 'string',
            description: 'The text content of the page',
          },
        },
      },
    },
    {
      name: 'WebToolkit_screenshot',
      description: 'Take a screenshot of the current page',
      parameters: {
        type: 'object',
        properties: {
          fullPage: {
            type: 'boolean',
            description: 'Whether to capture the full page or just the viewport',
          },
        },
      },
      returns: {
        type: 'object',
        description: 'Screenshot data',
        properties: {
          dataUrl: {
            type: 'string',
            description:
              'Base64 encoded data of the screenshot or image. If the screenshot is not available, the dataUrl will be an empty string.',
          },
          success: {
            type: 'boolean',
            description: 'Whether the screenshot was successfully taken',
          },
        },
      },
    },
    {
      name: 'WebToolkit_inputElement',
      description:
        "Types text into a specified input element on the page. If the element is not found or not interactable, use listElements to find the correct selector. The selector can be a simple tag name (e.g., 'input'), a class name (e.g., '.username'), an ID (e.g., '#email'), or a combination of these with attributes (e.g., 'input[type=\"text\"]'). Optionally, can clear the input first, add typing delay, and/or press Enter after inputting (to submit forms or trigger search).",
      parameters: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description:
              "CSS selector for the target input element. Examples:\n- 'input' - any input\n- '.username' - input with class 'username'\n- '#email' - input with ID 'email'\n- 'input[type=\"text\"]' - text input\n- 'textarea' - any textarea\nIf the selector fails, use listElements to find the correct selector.",
          },
          value: {
            type: 'string',
            description: 'The text to input into the element',
          },
          options: {
            type: 'object',
            description: 'Optional configuration for input behavior',
            properties: {
              clearFirst: {
                type: 'boolean',
                description: 'If true, clears existing content before inputting. Default: true',
              },
              delay: {
                type: 'number',
                description: 'Delay (in milliseconds) between keystrokes. Default: 100',
              },
              pressEnterAfterInput: {
                type: 'boolean',
                description:
                  'If true, simulates pressing the Enter key after inputting the value. Useful for submitting search forms or triggering actions. Default: false',
              },
            },
          },
        },
        required: ['selector', 'value'],
      },
      returns: {
        type: 'object',
        description:
          'The result of the input action. If unsuccessful, use listElements to find the correct selector.',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates whether the text was successfully input',
          },
          error: {
            type: 'string',
            description:
              "Error message if the input failed. Common errors include: 'Element not found', 'Element is not visible', 'Element is not interactable'. If the selector is incorrect, use listElements to find the correct selector.",
          },
          data: {
            type: 'object',
            description: 'Additional information about the input operation',
            properties: {
              text: {
                type: 'string',
                description: 'Text content of the element',
              },
              value: {
                type: 'string',
                description: 'Value of the input element',
              },
              html: {
                type: 'string',
                description: 'HTML content of the element',
              },
            },
          },
        },
      },
    },
    {
      name: 'WebToolkit_clickElement',
      description:
        'Click an element on the page. The element must be visible and clickable. Always use listElements first to find the correct selector.',
      parameters: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
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
        required: ['selector'],
      },
      returns: {
        type: 'object',
        description: 'Result of the click operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the click was successful',
          },
          error: {
            type: 'string',
            description:
              'Error details if click failed, including why the element was not clickable',
          },
          data: {
            type: 'object',
            description: 'Information about the clicked element',
            properties: {
              text: {
                type: 'string',
                description: "Element's text content",
              },
              html: {
                type: 'string',
                description: "Element's HTML structure",
              },
              clicked: {
                type: 'boolean',
                description: 'Whether click was performed',
              },
              position: {
                type: 'object',
                description: 'Click coordinates',
                properties: {
                  x: { type: 'number' },
                  y: { type: 'number' },
                },
              },
              elementState: {
                type: 'object',
                description: 'Element state when clicked',
                properties: {
                  isVisible: { type: 'boolean' },
                  isEnabled: { type: 'boolean' },
                  attributes: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
    {
      name: 'WebToolkit_scrollToElement',
      description: 'Scroll the page to bring an element into view',
      parameters: {
        type: 'object',
        properties: {
          selector: {
            type: 'string',
            description: 'CSS selector for the element to scroll to',
          },
          options: {
            type: 'object',
            description: 'Scroll options',
            properties: {
              behavior: {
                type: 'string',
                description: 'Scroll behavior (smooth or auto)',
                enum: ['smooth', 'auto'],
              },
              block: {
                type: 'string',
                description: 'Vertical alignment (start, center, end, nearest)',
                enum: ['start', 'center', 'end', 'nearest'],
              },
            },
          },
        },
        required: ['selector'],
      },
      returns: {
        type: 'object',
        description: 'Result of the scroll operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the page was successfully scrolled',
          },
        },
      },
    },
    {
      name: 'WebToolkit_refreshPage',
      description:
        "Refresh the current page based on the user's context. This will reload the current page and wait for it to be fully loaded. The page to refresh is determined by the user's current context and cannot be specified directly.",
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description:
              "The URL of the page to refresh. Default: determined by the user's current context",
          },
          waitForLoad: {
            type: 'boolean',
            description:
              'Whether to wait for the page to be fully loaded after refresh. Default: true',
          },
          timeout: {
            type: 'number',
            description: 'Maximum time to wait for page load in milliseconds. Default: 5000',
          },
        },
      },
      returns: {
        type: 'object',
        description: 'Result of the refresh operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the page was successfully refreshed and loaded',
          },
          error: {
            type: 'string',
            description:
              "Error message if the refresh failed. Common errors include: 'Page load timeout', 'Navigation failed', 'No active page to refresh'",
          },
          data: {
            type: 'object',
            description: 'Additional information about the refresh operation',
            properties: {
              url: {
                type: 'string',
                description: 'The URL of the refreshed page',
              },
              loadTime: {
                type: 'number',
                description: 'Time taken for the page to load in milliseconds',
              },
              status: {
                type: 'string',
                description: 'Final status of the page after refresh (complete, loading, error)',
              },
            },
          },
        },
      },
    },
    //     {
    //       name: 'WebToolkit_listElements',
    //       description:
    //         'List elements on the page that match the given selector. Use this tool first to find the correct selector before attempting to click or input. Returns detailed information about matching elements including their attributes, text content, and role.',
    //       parameters: {
    //         type: 'object',
    //         properties: {
    //           selectors: {
    //             type: 'string',
    //             description: `CSS selector to find elements. Common selector patterns:
    // 1. Basic selectors:
    //    - tag: 'button', 'input', 'a'
    //    - class: '.classname'
    //    - id: '#elementId'
    //    - attribute: '[attr="value"]'

    // 2. Attribute selectors:
    //    - '[role="button"]' - elements with role attribute
    //    - '[aria-label="Submit"]' - elements with aria-label
    //    - '[data-testid="submitButton"]' - elements with data-testid
    //    - '[type="submit"]' - input/button type

    // 3. Combining selectors:
    //    - 'button.primary' - button with class
    //    - 'button[type="submit"]' - button with type
    //    - '.container button' - button inside container

    // 4. Multiple elements:
    //    - 'button, [role="button"]' - buttons and button-like elements
    //    - 'input[type="text"], textarea' - text inputs

    // Always use listElements first to find the correct selector before clicking or inputting.`,
    //           },
    //         },
    //       },
    //       returns: {
    //         type: 'object',
    //         description: 'List of matching elements with their properties',
    //         properties: {
    //           success: {
    //             type: 'boolean',
    //             description: 'Whether elements were found',
    //           },
    //           data: {
    //             type: 'object',
    //             properties: {
    //               elements: {
    //                 type: 'array',
    //                 items: {
    //                   type: 'object',
    //                   properties: {
    //                     selector: {
    //                       type: 'string',
    //                       description: 'Unique selector for this element',
    //                     },
    //                     text: {
    //                       type: 'string',
    //                       description: 'Text content of the element',
    //                     },
    //                     type: {
    //                       type: 'string',
    //                       description: 'Element type (button, input, link, etc)',
    //                     },
    //                     attributes: {
    //                       type: 'object',
    //                       description: 'Element attributes (role, aria-label, data-testid, etc)',
    //                     },
    //                     isVisible: {
    //                       type: 'boolean',
    //                       description: 'Whether the element is visible',
    //                     },
    //                     isInteractive: {
    //                       type: 'boolean',
    //                       description: 'Whether the element can be interacted with',
    //                     },
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    {
      name: 'WebToolkit_getPageText',
      description: 'Get the text content of the current page, format as markdown',
      parameters: {
        type: 'object',
        properties: {},
      },
      returns: {
        type: 'object',
        description: 'Text content of the current page',
        properties: {
          text: { type: 'string' },
          success: { type: 'boolean' },
          error: { type: 'string' },
        },
      },
    },
    {
      name: 'WebToolkit_analyzePage',
      description:
        'Analyze the current page to extract actionable parts for AI agent understanding. This provides semantic segments and interactive elements with highlight indices, allowing for better page understanding without sending full HTML. This is the PREFERRED method over listElements for getting page structure.',
      parameters: {
        type: 'object',
        properties: {},
      },
      returns: {
        type: 'object',
        description: 'Analysis result with semantic segments and interactive elements',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the analysis was successful',
          },
          error: {
            type: 'string',
            description: 'Error message if analysis failed',
          },
          data: {
            type: 'object',
            description: 'Analysis results',
            properties: {
              segments: {
                type: 'array',
                description: 'Semantic page segments (header, nav, main, etc.)',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      description:
                        'Segment type: header, nav, main, section, article, aside, footer, container',
                    },
                    selector: {
                      type: 'string',
                      description: 'CSS selector for the segment',
                    },
                    textContent: {
                      type: 'string',
                      description: 'Text content of the segment',
                    },
                    depth: {
                      type: 'number',
                      description: 'Depth level in DOM tree',
                    },
                  },
                },
              },
              highlightedElements: {
                type: 'array',
                description: 'Interactive elements with highlight indices for clickElementByIndex',
                items: {
                  type: 'object',
                  properties: {
                    highlight_index: {
                      type: 'number',
                      description: 'Unique index for this element (use with clickElementByIndex)',
                    },
                    tagName: {
                      type: 'string',
                      description: 'HTML tag name',
                    },
                    type: {
                      type: 'string',
                      description: 'Element type with attributes',
                    },
                    interactionType: {
                      type: 'string',
                      description: 'Type of interaction: click, input, select, submit, navigate',
                    },
                    selector: {
                      type: 'string',
                      description: 'CSS selector for the element',
                    },
                    textContent: {
                      type: 'string',
                      description: 'Visible text content',
                    },
                    ariaLabel: {
                      type: 'string',
                      description: 'ARIA label for accessibility',
                    },
                    disabled: {
                      type: 'boolean',
                      description: 'Whether element is disabled',
                    },
                    attributes: {
                      type: 'object',
                      description: 'Element attributes',
                    },
                  },
                },
              },
              totalElements: {
                type: 'number',
                description: 'Total number of interactive elements found',
              },
              clickableElementsString: {
                type: 'string',
                description:
                  'AI-friendly string representation of all interactive elements: [index]<tag>text</tag>',
              },
            },
          },
        },
      },
    },
    {
      name: 'WebToolkit_clickElementByIndex',
      description:
        'Click an element using its highlight index from analyzePage results. This is more reliable than using CSS selectors as it uses the exact element mapping from the page analysis. Always run analyzePage first to get the highlight indices.',
      parameters: {
        type: 'object',
        properties: {
          highlightIndex: {
            type: 'number',
            description:
              'The highlight index of the element to click (obtained from analyzePage results)',
          },
        },
        required: ['highlightIndex'],
      },
      returns: {
        type: 'object',
        description: 'Result of the click operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the click was successful',
          },
          error: {
            type: 'string',
            description: 'Error message if click failed',
          },
          data: {
            type: 'object',
            description: 'Click operation details',
            properties: {
              clicked: {
                type: 'boolean',
                description: 'Whether the click action was performed',
              },
              elementFound: {
                type: 'boolean',
                description: 'Whether the element was found in analysis data',
              },
              elementStillExists: {
                type: 'boolean',
                description: 'Whether the element still exists on the page',
              },
              elementInfo: {
                type: 'object',
                description: 'Information about the clicked element',
                properties: {
                  tagName: {
                    type: 'string',
                    description: 'Tag name of the element',
                  },
                  textContent: {
                    type: 'string',
                    description: 'Text content of the element',
                  },
                  attributes: {
                    type: 'object',
                    description: 'Element attributes',
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
