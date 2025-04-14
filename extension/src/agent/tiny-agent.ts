// agent/tinyAgent.ts
import { Agent, Observation, Task, AgentMemory } from "./types";

export class TinyAgent implements Agent {
  private memory: AgentMemory = {
    logs: [],
    knowledge: {},
  };

  observe(): Observation {
    try {
      // Example: scrape document title
      const title = document.title || "Unknown page";
      return { type: "pageTitle", payload: title };
    } catch (error) {
      console.error("Error in observe method:", error);
      return { type: "error", payload: "Could not observe current context" };
    }
  }

  plan(observation: Observation): Task {
    try {
      // Handle user requests specifically
      if (observation.type === "userRequest") {
        const userInput = observation.payload;

        // Check for valid input
        if (!userInput || typeof userInput !== "string") {
          return {
            description:
              "I received an empty or invalid request. Please try again with a clear question or command.",
          };
        }

        // Simple pattern matching for various types of requests
        if (
          userInput.toLowerCase().includes("hello") ||
          userInput.toLowerCase().includes("hi")
        ) {
          return {
            description:
              "Hello! I'm your AI assistant. How can I help you today?",
          };
        } else if (userInput.toLowerCase().includes("help")) {
          return {
            description:
              "I can help you navigate web pages, answer questions, and perform simple tasks. Just ask me what you need!",
          };
        } else if (
          userInput.toLowerCase().includes("current page") ||
          userInput.toLowerCase().includes("what page")
        ) {
          try {
            const currentPage = document.title || "Unknown page";
            return {
              description: `You're currently on: ${currentPage}`,
            };
          } catch (error) {
            return {
              description:
                "I couldn't determine what page you're on. My browser access might be limited.",
            };
          }
        } else {
          // Generic response for other inputs
          return {
            description: `I received your request: "${userInput}". I'm a simple agent, but I'm learning to handle more complex tasks.`,
          };
        }
      }

      // Original code for pageTitle observations
      if (observation.type === "pageTitle") {
        return { description: `Log the page title: ${observation.payload}` };
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

  act(task: Task): void {
    try {
      console.log("Agent Acting:", task.description);
      this.remember(task.description);
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
}
