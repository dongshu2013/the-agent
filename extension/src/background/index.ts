import { Storage } from '@plasmohq/storage';
import { TabToolkit } from '../tools/tab-toolkit';
import { TgToolkit } from '../tools/tg-toolkit';
import { InputElementParams, WebToolkit } from '../tools/web-toolkit';
import { RuntimeMessage, RuntimeResponse } from '../types/messages';
import { WebInteractionResult } from '~/types/tools';

const storage = new Storage();
const webToolkit = new WebToolkit();

async function openSidePanel(tab: chrome.tabs.Tab) {
  if (!tab?.id) {
    console.error('Invalid tab id');
    return;
  }

  try {
    await chrome.sidePanel.setOptions({
      tabId: tab.id,
      enabled: true,
      path: 'sidepanel.html',
    });
    // Do NOT call chrome.sidePanel.open here!
  } catch (error) {
    console.error('Failed to enable side panel:', error);
  }
}

if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  // Ensure clicking the extension icon opens the side panel
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
}

if (typeof chrome !== 'undefined' && chrome.action) {
  chrome.action.onClicked.addListener(async tab => {
    await openSidePanel(tab);
  });
} else {
  console.error('chrome.action API is not available');
}

type TabToolKitArguments = { url: string } | { tabId: number };

type WebToolKitArguments =
  | { format: string }
  | {
      selector: string;
    }
  | { selectors: string }
  | { highlightIndex: number }
  | InputElementParams;

type GetDialogsArguments = {
  limit?: number;
  offset?: number;
  chatTitle?: string;
  isPublic?: boolean;
  isFree?: boolean;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
};

type GetMessagesArguments = {
  chatId: string;
  limit?: number;
  offset?: number;
  messageText?: string;
  senderId?: string;
  startTimestamp?: number;
  endTimestamp?: number;
  sortBy?: string;
  sortOrder?: string;
};

type SearchMessagesArguments = {
  query: string;
  chatId?: string;
  topK?: number;
  messageRange?: number;
  threshold?: number;
  isPublic?: boolean;
  isFree?: boolean;
};

type TgToolKitArguments = GetDialogsArguments | GetMessagesArguments | SearchMessagesArguments;

chrome.runtime.onMessage.addListener(
  (
    message: RuntimeMessage,
    _sender,
    sendResponse: (response: WebInteractionResult<unknown> | RuntimeResponse) => void
  ) => {
    if (message.name === 'ping') {
      sendResponse({ success: true, message: 'ping' });
    }

    if (message.name === 'execute-tool') {
      const { name, arguments: params } =
        (message.body as {
          name: string;
          arguments: TabToolKitArguments | WebToolKitArguments | TgToolKitArguments;
        }) || {};
      if (!name || !params) {
        sendResponse({ success: false, error: 'Invalid tool execution request' });
        return true;
      }

      (async () => {
        try {
          if (!chrome?.tabs) {
            throw new Error('chrome.tabs API is not available');
          }
          if (name.startsWith('WebToolkit_')) {
            const toolName = name.replace('WebToolkit_', '');
            const args = params as WebToolKitArguments;
            let result;
            switch (toolName) {
              case 'getPageText':
                result = await webToolkit.getPageText((args as { format: string }).format);
                break;
              case 'screenshot':
                result = await webToolkit.screenshot();
                break;
              case 'inputElement':
                result = await webToolkit.inputElement(args as InputElementParams);
                break;
              case 'clickElement':
                result = await webToolkit.clickElement((args as { selector: string }).selector);
                break;
              case 'scrollToElement':
                result = await webToolkit.scrollToElement((args as { selector: string }).selector);
                break;
              case 'refreshPage':
                result = await webToolkit.refreshPage();
                break;
              case 'listElements':
                result = await webToolkit.listElements((args as { selectors: string }).selectors);
                break;
              case 'analyzePage':
                result = await webToolkit.analyzePage();
                break;
              case 'clickElementByIndex':
                result = await webToolkit.clickElementByIndex(
                  (args as { highlightIndex: number }).highlightIndex
                );
                break;
              default:
                throw new Error(`Unknown WebToolkit operation: ${toolName}`);
            }

            sendResponse(result as WebInteractionResult<unknown>);
            return true;
          }

          if (name.startsWith('TabToolkit_')) {
            const toolNoolName = name.replace('TabToolkit_', '');
            const args = params as TabToolKitArguments;
            switch (toolNoolName) {
              case 'openTab':
                const result = await TabToolkit.openTab((args as { url: string }).url);
                sendResponse(result);
                return true;
              case 'listTabs':
                const listResult = await TabToolkit.listTabs();
                sendResponse(listResult);
                return true;
              case 'closeTab':
                const closeResult = await TabToolkit.closeTab((args as { tabId: number }).tabId);
                sendResponse(closeResult);
                return true;
              case 'switchToTab':
                const switchResult = await TabToolkit.switchToTab(
                  (args as { tabId: number }).tabId
                );
                sendResponse(switchResult);
                return true;
              case 'waitForTabLoad':
                const waitForResult = await TabToolkit.waitForTabLoad(
                  (args as { tabId: number }).tabId
                );
                sendResponse(waitForResult);
                return true;
              case 'getCurrentActiveTab':
                const getCurrentActiveTabResult = await TabToolkit.getCurrentActiveTab();
                sendResponse(getCurrentActiveTabResult);
                return true;
              default:
                sendResponse({
                  success: false,
                  error: `Tool ${name} not implemented in background script`,
                });
            }
            return true;
          }

          if (name.startsWith('TgToolkit_')) {
            const toolName = name.replace('TgToolkit_', '');
            let result;
            let args;
            switch (toolName) {
              case 'getDialogs':
                args = params as GetDialogsArguments;
                result = await TgToolkit.getDialogs(
                  args.limit,
                  args.offset,
                  args.chatTitle,
                  args.isPublic,
                  args.isFree,
                  args.status,
                  args.sortBy,
                  args.sortOrder
                );
                break;
              case 'getMessages':
                args = params as GetMessagesArguments;
                result = await TgToolkit.getMessages(
                  args.chatId,
                  args.limit,
                  args.offset,
                  args.messageText,
                  args.senderId,
                  args.startTimestamp,
                  args.endTimestamp,
                  args.sortBy,
                  args.sortOrder
                );
                break;
              case 'searchMessages':
                args = params as SearchMessagesArguments;
                result = await TgToolkit.searchMessages(
                  args.query,
                  args.chatId,
                  args.topK,
                  args.messageRange,
                  args.threshold,
                  args.isPublic,
                  args.isFree
                );
                break;
              default:
                throw new Error(`Unknown TgToolkit operation: ${toolName}`);
            }

            sendResponse({ success: true, data: result });
            return true;
          }
        } catch (error: unknown) {
          console.error('Error executing tool in background:', error);
          const message = error instanceof Error ? error.message : JSON.stringify(error);
          sendResponse({ success: false, error: message });
        }
      })();

      return true;
    }

    if (message.name === 'update-config') {
      (async () => {
        try {
          const { key, value } = message.body as { key: string; value: string };
          await storage.set(key, value);
          sendResponse({ success: true });
        } catch (error: unknown) {
          console.error('Error updating config:', error);
          const message = error instanceof Error ? error.message : JSON.stringify(error);
          sendResponse({
            success: false,
            error: message,
          });
        }
      })();

      return true;
    }
  }
);
