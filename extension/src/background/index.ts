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

// Process messages from the sidepanel and popup
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  // Handle process-request messages from sidepanel
  if (message.name === "process-request") {
    const { apiKey, request } = message.body;

    try {
      // Create an instance of the agent
      const agent = new TinyAgent();

      // Capture the current state as an observation
      const observation = agent.observe();

      // Create a plan based on the user request
      const userRequestObs = {
        type: "userRequest",
        payload: request,
      };

      // Try to get a response from the agent
      try {
        const task = agent.plan(userRequestObs);

        // Act on the plan
        agent.act(task);

        // Return the task description as the response
        sendResponse({
          result: task.description,
        });
      } catch (error) {
        console.error("Agent error:", error);
        // Return a user-friendly error message
        sendResponse({
          error: "An error occurred while processing your request.",
        });
      }
    } catch (error) {
      console.error("System error:", error);
      sendResponse({
        error: "An error occurred while processing your request.",
      });
    }

    return true; // Required for async response
  }

  // Handle call-agent messages from popup
  if (message.name === "call-agent") {
    const { prompt } = message.body;

    try {
      // Create an instance of the agent
      const agent = new TinyAgent();

      // Create a plan based on the user request
      const userRequestObs = {
        type: "userRequest",
        payload: prompt,
      };

      // Try to get a response from the agent
      try {
        const task = agent.plan(userRequestObs);

        // Act on the plan
        agent.act(task);

        // Return the task description as the response
        sendResponse({
          result: task.description,
        });
      } catch (error) {
        console.error("Agent error:", error);
        sendResponse({
          error: "An error occurred while processing your request.",
        });
      }
    } catch (error) {
      console.error("System error:", error);
      sendResponse({
        error: "An error occurred while processing your request.",
      });
    }

    return true; // Required for async response
  }
});

// Create a context menu item when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
