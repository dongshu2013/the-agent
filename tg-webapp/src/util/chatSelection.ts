import type { ApiChat } from '../api/types';

// Module-level variable to store selected chats
const selectedChats: Record<string, ApiChat> = {};

// Toggle selection of a chat
export function toggleChatSelection(chatId: string, chat?: ApiChat): void {
  if (!chat) return;
  
  if (selectedChats[chatId]) {
    delete selectedChats[chatId];
  } else {
    selectedChats[chatId] = chat;
  }
  
  document.dispatchEvent(new CustomEvent('selectedChatsChange'));
}

// Check if a chat is selected
export function isChatSelected(chatId: string): boolean {
  return Boolean(selectedChats[chatId]);
}

// Get all selected chats
export function getSelectedChats(): Record<string, ApiChat> {
  return selectedChats;
}

// Select all chats
export function selectAllChats(chats: ApiChat[]): void {
  chats.forEach(chat => {
    if (chat.id) {
      selectedChats[chat.id] = chat;
    }
  });
  document.dispatchEvent(new CustomEvent('selectedChatsChange'));
}

// Clear all selected chats
export function clearSelectedChats(): void {
  Object.keys(selectedChats).forEach(key => delete selectedChats[key]);
  document.dispatchEvent(new CustomEvent('selectedChatsChange'));
}

// Initialize global access to these functions
declare global {
  interface Window {
    getSelectedChats: typeof getSelectedChats;
    toggleChatSelection: typeof toggleChatSelection;
    selectAllChats: typeof selectAllChats;
    clearSelectedChats: typeof clearSelectedChats;
  }
}

// Expose methods to window object
window.getSelectedChats = getSelectedChats;
window.toggleChatSelection = toggleChatSelection;
window.selectAllChats = selectAllChats;
window.clearSelectedChats = clearSelectedChats;
