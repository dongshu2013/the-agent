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
      name: 'TabToolkit.openTab',
      description: 'Open a new browser tab with a specific URL',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to open in the new tab'
          }
        },
        required: ['url']
      },
      returns: {
        type: 'object',
        description: 'Information about the newly opened tab',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the newly opened tab'
          },
          success: {
            type: 'boolean',
            description: 'Whether the tab was successfully opened'
          }
        }
      }
    },
    {
      name: 'TabToolkit.closeTab',
      description: 'Close a specific browser tab',
      parameters: {
        type: 'object',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the tab to close'
          }
        },
        required: ['tabId']
      },
      returns: {
        type: 'object',
        description: 'Result of the close operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the tab was successfully closed'
          }
        }
      }
    },
    {
      name: 'TabToolkit.findTab',
      description: 'Find tabs by URL or title',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'Exact URL to match'
          },
          title: {
            type: 'string',
            description: 'Exact title to match'
          }
        }
      },
      returns: {
        type: 'array',
        description: 'List of matching tabs',
        properties: {
          items: {
            type: 'object',
            properties: {
              tabId: {
                type: 'number',
                description: 'The ID of the tab'
              },
              url: {
                type: 'string',
                description: 'The URL of the tab'
              },
              title: {
                type: 'string',
                description: 'The title of the tab'
              }
            }
          }
        }
      }
    },
    {
      name: 'TabToolkit.switchToTab',
      description: 'Switch to a specific tab by its ID',
      parameters: {
        type: 'object',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the tab to switch to'
          }
        },
        required: ['tabId']
      },
      returns: {
        type: 'object',
        description: 'Result of the switch operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the switch was successful'
          }
        }
      }
    },
    {
      name: 'TabToolkit.waitForTabLoad',
      description: 'Wait for a specific tab to finish loading',
      parameters: {
        type: 'object',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the tab to wait for'
          },
          timeout: {
            type: 'number',
            description: 'Maximum wait time in milliseconds (default: 10000)'
          }
        },
        required: ['tabId']
      },
      returns: {
        type: 'object',
        description: 'Result of the wait operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the tab loaded successfully within the timeout'
          },
          status: {
            type: 'string',
            description: 'The status of the tab (complete, loading, error)'
          }
        }
      }
    },
    {
      name: 'TabToolkit.getCurrentActiveTab',
      description: 'Get the currently active tab in the current window',
      parameters: {
        type: 'object',
        properties: {}
      },
      returns: {
        type: 'object',
        description: 'Information about the active tab',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the active tab'
          },
          url: {
            type: 'string',
            description: 'The URL of the active tab'
          },
          title: {
            type: 'string',
            description: 'The title of the active tab'
          }
        }
      }
    },
    
    // Web Toolkit Tools
    {
      name: 'WebToolkit.getPageContent',
      description: 'Get the content of the current page',
      parameters: {
        type: 'object',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the tab to get content from'
          },
          selector: {
            type: 'string',
            description: 'CSS selector to get specific content (optional)'
          }
        },
        required: ['tabId']
      },
      returns: {
        type: 'object',
        description: 'Content from the page',
        properties: {
          content: {
            type: 'string',
            description: 'The HTML or text content of the page or selected element'
          },
          success: {
            type: 'boolean',
            description: 'Whether the content was successfully retrieved'
          }
        }
      }
    },
    {
      name: 'WebToolkit.clickElement',
      description: 'Click an element on the page',
      parameters: {
        type: 'object',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the tab to click in'
          },
          selector: {
            type: 'string',
            description: 'CSS selector for the element to click'
          }
        },
        required: ['tabId', 'selector']
      },
      returns: {
        type: 'object',
        description: 'Result of the click operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the element was successfully clicked'
          },
          error: {
            type: 'string',
            description: 'Error message if the click failed'
          }
        }
      }
    },
    {
      name: 'WebToolkit.fillForm',
      description: 'Fill a form field on the page',
      parameters: {
        type: 'object',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the tab with the form'
          },
          selector: {
            type: 'string',
            description: 'CSS selector for the form field'
          },
          value: {
            type: 'string',
            description: 'Value to fill in the form field'
          }
        },
        required: ['tabId', 'selector', 'value']
      },
      returns: {
        type: 'object',
        description: 'Result of the form fill operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the form field was successfully filled'
          },
          error: {
            type: 'string',
            description: 'Error message if the operation failed'
          }
        }
      }
    },
    {
      name: 'WebToolkit.scrollPage',
      description: 'Scroll the page',
      parameters: {
        type: 'object',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the tab to scroll'
          },
          direction: {
            type: 'string',
            description: 'Direction to scroll (up, down, left, right)',
            enum: ['up', 'down', 'left', 'right']
          },
          amount: {
            type: 'number',
            description: 'Amount to scroll in pixels'
          }
        },
        required: ['tabId', 'direction']
      },
      returns: {
        type: 'object',
        description: 'Result of the scroll operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the page was successfully scrolled'
          },
          newPosition: {
            type: 'object',
            description: 'New scroll position',
            properties: {
              x: {
                type: 'number',
                description: 'Horizontal scroll position'
              },
              y: {
                type: 'number',
                description: 'Vertical scroll position'
              }
            }
          }
        }
      }
    },
    {
      name: 'WebToolkit.takeScreenshot',
      description: 'Take a screenshot of the current page',
      parameters: {
        type: 'object',
        properties: {
          tabId: {
            type: 'number',
            description: 'The ID of the tab to screenshot'
          },
          fullPage: {
            type: 'boolean',
            description: 'Whether to capture the full page or just the viewport'
          }
        },
        required: ['tabId']
      },
      returns: {
        type: 'object',
        description: 'Result of the screenshot operation',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the screenshot was successfully taken'
          },
          dataUrl: {
            type: 'string',
            description: 'Base64 encoded data URL of the screenshot image'
          }
        }
      }
    }
  ];
};
