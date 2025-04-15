import { TinyAgent } from "../agent/tiny-agent";

// Setup panel behavior

chrome.runtime.onInstalled.addListener(() => {
  // Set the panel to open when the action button is clicked
  if (chrome.sidePanel) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error("Error setting panel behavior:", error));
  }
});

// Add click handler as a backup
chrome.action.onClicked.addListener((tab) => {
  // Force open sidepanel when extension icon is clicked
  try {
    if (chrome.sidePanel) {
      // Check if we can open the sidepanel for this window
      if (tab.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
      }
    }
  } catch (error) {
    console.error("Error opening sidepanel:", error);
  }
});

// Store agent instance and state
let agent: TinyAgent | null = null;

// Process messages from the sidepanel
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  // Handle process-request messages from sidepanel
  if (message.name === "process-request") {
    const { apiKey, request } = message.body;

    // Create agent instance if not exists
    if (!agent) {
      agent = new TinyAgent();
    }

    // Process request through agent
    (async () => {
      try {
        // Create a plan based on the user request
        const userRequestObs = {
          type: "userRequest",
          payload: request,
        };

        // Get agent's plan
        const task = await agent.plan(userRequestObs);

        // Execute the plan
        await agent.act(task);

        // Return the task description and any results
        sendResponse({
          result: task.description,
          actions: task.payload,
        });
      } catch (error) {
        console.error("Agent error:", error);
        sendResponse({
          error: "An error occurred while processing your request.",
        });
      }
    })();

    return true; // Required for async response
  }

  // Handle toolkit execution requests from content script
  if (message.name === "EXECUTE_TOOLKIT") {
    const { method, args } = message;

    // Forward to content script of active tab
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
          error: "An error occurred while executing toolkit method.",
        });
      }
    })();

    return true; // Required for async response
  }
});

// Create a context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
