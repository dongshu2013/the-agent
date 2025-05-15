import { Message } from "../types/messages";

/**
 * Format markdown table correctly
 * @param content The content containing markdown table
 * @returns Formatted content with proper markdown table syntax
 */
export const formatMarkdownTable = (content: string): string => {
  const lines: string[] = content.split("\n");
  let formattedLines: string[] = [];
  let isInTable = false;
  let columnCount = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // 检测表格开始（以 | 开头的行）
    if (line.startsWith("|") && !isInTable) {
      isInTable = true;
      // 计算列数
      columnCount = (line.match(/\|/g) || []).length - 1;
      // 格式化表头
      const headers = line
        .split("|")
        .filter((cell) => cell.trim())
        .map((cell) => cell.trim());

      // 添加格式化后的表头
      formattedLines.push("| " + headers.join(" | ") + " |");

      // 添加分隔行
      formattedLines.push(
        "|" + Array(columnCount).fill(" --- ").join("|") + "|"
      );
      continue;
    }

    // 处理表格行
    if (isInTable && line.startsWith("|")) {
      const cells = line
        .split("|")
        .filter((cell) => cell.trim())
        .map((cell) => cell.trim());

      // 添加格式化后的行
      formattedLines.push("| " + cells.join(" | ") + " |");
    } else {
      // 如果不是表格行，结束表格处理
      if (isInTable) {
        isInTable = false;
      }
      formattedLines.push(line);
    }
  }

  return formattedLines.join("\n");
};

/**
 * Process AI response message
 * @param message The AI response message to process
 * @returns Processed message with markdown content
 */
export const processAIMessage = (message: Message): Message => {
  // 确保返回一个有效的消息对象
  return {
    ...message,
    content: message.content || "",
    role: message.role || "assistant",
    id: message.id || crypto.randomUUID(),
    created_at: message.created_at || new Date().toISOString(),
    conversation_id: message.conversation_id || "",
  };
};

/**
 * Check if a message is from AI
 * @param message The message to check
 * @returns boolean indicating if the message is from AI
 */
export const isAIMessage = (message: Message): boolean => {
  return message?.role === "assistant";
};

/**
 * Check if a message is from user
 * @param message The message to check
 * @returns boolean indicating if the message is from user
 */
export const isUserMessage = (message: Message): boolean => {
  return message?.role === "user";
};

/**
 * Check if a message is an error message
 * @param message The message to check
 * @returns boolean indicating if the message is an error message
 */
export const isErrorMessage = (message: Message): boolean => {
  return message?.status === "error";
};
