/**
 * Tools Service - Handles execution of tools and functions
 */

interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * Get weather information for a specific time
 * This is a mock implementation that returns fake weather data
 */
export const getWeather = async (args: {
  time: string;
}): Promise<ToolResult> => {
  try {
    // In a real implementation, this would call a weather API
    const { time } = args;

    // Mock data for demonstration purposes
    const weatherData = {
      time,
      temperature: 24,
      condition: "Sunny",
      humidity: 45,
      wind: "5 km/h",
    };

    return {
      success: true,
      result: weatherData,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get weather data",
    };
  }
};

/**
 * Execute a tool based on its name and arguments
 */
export const executeTool = async (
  toolName: string,
  args: any
): Promise<ToolResult> => {
  try {
    // Map tool names to their implementation functions
    const toolMap: Record<string, (args: any) => Promise<ToolResult>> = {
      getWeather,
    };

    // Check if the tool exists
    if (!toolMap[toolName]) {
      return {
        success: false,
        error: `Tool '${toolName}' not found`,
      };
    }

    // Execute the tool
    return await toolMap[toolName](args);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error executing tool",
    };
  }
};
