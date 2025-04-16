// agent/tinyAgent.ts
import { Agent, Observation, Task, AgentMemory } from "./types";

export class TinyAgent implements Agent {
  private memory: AgentMemory = {
    logs: [],
    knowledge: {},
  };

  async observe(): Promise<Observation> {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab || !tab.id) {
        throw new Error("No active tab found");
      }

      // Get page title and URL
      const pageContext = {
        title: tab.title || "Unknown page",
        url: tab.url || "Unknown URL",
      };

      // Get page content through content script
      const contentResult = await chrome.tabs.sendMessage(tab.id, {
        type: "EXECUTE_TOOLKIT",
        method: "getPageContent",
        args: ["body"],
      });

      return {
        type: "pageContext",
        payload: {
          ...pageContext,
          content: contentResult?.result || "No content available",
        },
      };
    } catch (error) {
      console.error("Error in observe method:", error);
      return { type: "error", payload: "Could not observe current context" };
    }
  }

  async plan(observation: Observation): Promise<Task> {
    try {
      // Handle user requests
      if (observation.type === "userRequest") {
        const userInput = observation.payload;
        const pageContext = await this.observe();

        // Call remote agent with user input and page context
        const response = await this.callRemoteAgent({
          prompt: userInput,
          context: pageContext.payload,
        });

        return {
          description: response.message || "No response from agent",
          payload: response.actions || [],
        };
      }

      if (observation.type === "error") {
        return {
          description:
            "I encountered an error while trying to process your request. Please try again.",
        };
      }

      return { description: "I'm not sure how to handle that request." };
    } catch (error) {
      console.error("Error in plan method:", error);
      return {
        description: "An error occurred while processing your request.",
      };
    }
  }

  async act(task: Task): Promise<void> {
    try {
      console.log("Agent Acting:", task.description);
      this.remember(task.description);

      // If there are actions to perform
      if (task.payload && Array.isArray(task.payload)) {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (!tab || !tab.id) {
          throw new Error("No active tab found");
        }

        // Execute each action in sequence
        for (const action of task.payload) {
          await chrome.tabs.sendMessage(tab.id, {
            type: "EXECUTE_TOOLKIT",
            method: action.type,
            args: action.args,
          });
        }
      }
    } catch (error) {
      console.error("Error in act method:", error);
      this.remember("Error while trying to act on task");
    }
  }

  remember(log: string): void {
    try {
      this.memory.logs.push(log);
      // Limit memory size to prevent memory leaks
      if (this.memory.logs.length > 100) {
        this.memory.logs = this.memory.logs.slice(-100);
      }
    } catch (error) {
      console.error("Error in remember method:", error);
    }
  }

  private async callRemoteAgent(request: {
    prompt: string;
    context: any;
  }): Promise<any> {
    try {
      // Format request for Mastra/Camel
      const formattedRequest = {
        messages: [
          {
            role: "system",
            content: `You are a helpful web assistant that can understand web pages and help users interact with them. 
Current page context:
Title: ${request.context.title}
URL: ${request.context.url}
Content: ${request.context.content.substring(0, 1000)}... (truncated)

You can perform the following actions:
- clickElement(selector): Click an element on the page
- fillInput(selector, value): Fill a form input
- extractText(selector): Extract text from an element
- scrollToElement(selector): Scroll to make an element visible
- waitForElement(selector): Wait for an element to appear

Respond in the following JSON format:
{
  "message": "Your response message to the user",
  "actions": [
    {
      "type": "actionName",
      "args": ["arg1", "arg2"]
    }
  ]
}`,
          },
          {
            role: "user",
            content: request.prompt,
          },
        ],
        stream: false,
      };

      // Call Mastra/Camel API
      const response = await fetch(
        "http://localhost:8000/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedRequest),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Parse Mastra/Camel response
      try {
        const content = data.choices[0].message.content;
        const parsedContent = JSON.parse(content);
        return {
          message: parsedContent.message,
          actions: parsedContent.actions || [],
        };
      } catch (parseError) {
        console.error("Error parsing agent response:", parseError);
        return {
          message: data.choices[0].message.content,
          actions: [],
        };
      }
    } catch (error) {
      console.error("Error calling remote agent:", error);
      throw error;
    }
  }
}
