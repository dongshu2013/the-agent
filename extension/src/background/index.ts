import { Storage } from '@plasmohq/storage';
import { TabToolkit, WebInteractionResult } from '../tools/tab-toolkit';
import { TgToolkit } from '../tools/tg-toolkit';
import { WebToolkit } from '../tools/web-toolkit';
import { RuntimeMessage, RuntimeResponse } from '../types/messages';

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
    // @ts-expect-error - sidePanel.open is available in Chrome 114+
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (error) {
    console.error('Failed to open side panel:', error);
  }
}

if (typeof chrome !== 'undefined' && chrome.action) {
  chrome.action.onClicked.addListener(async tab => {
    await openSidePanel(tab);
  });
} else {
  console.error('chrome.action API is not available');
}

chrome.runtime.onMessage.addListener(
  (
    message: RuntimeMessage,
    _sender,
    sendResponse: (response: WebInteractionResult | RuntimeResponse) => void
  ) => {
    if (message.name === 'ping') {
      sendResponse({ success: true, message: 'ping' });
    }

    if (message.name === 'execute-tool') {
      const { name, arguments: params } = (message.body as { name: string; arguments: any }) || {};
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
            let result;
            switch (toolName) {
              case 'getPageText':
                result = await webToolkit.getPageText(params.format);
                break;
              case 'screenshot':
                result = await webToolkit.screenshot();
                break;
              case 'inputElement':
                result = await webToolkit.inputElement(params);
                break;
              case 'clickElement':
                result = await webToolkit.clickElement(params.selector);
                break;
              case 'scrollToElement':
                result = await webToolkit.scrollToElement(params.selector);
                break;
              case 'refreshPage':
                result = await webToolkit.refreshPage();
                break;
              case 'listElements':
                result = await webToolkit.listElements(params.selectors);
                break;
              default:
                throw new Error(`Unknown WebToolkit operation: ${toolName}`);
            }

            sendResponse(result as WebInteractionResult);
            return true;
          }

          if (name.startsWith('TabToolkit_')) {
            const toolNoolName = name.replace('TabToolkit_', '');

            switch (toolNoolName) {
              case 'openTab':
                const result = await TabToolkit.openTab(params.url);
                sendResponse(result);
                return true;
              case 'listTabs':
                const listResult = await TabToolkit.listTabs();
                sendResponse(listResult);
                return true;
              case 'closeTab':
                const closeResult = await TabToolkit.closeTab(params.tabId);
                sendResponse(closeResult);
                return true;
              case 'switchToTab':
                const switchResult = await TabToolkit.switchToTab(params.tabId);
                sendResponse(switchResult);
                return true;
              case 'waitForTabLoad':
                const waitForResult = await TabToolkit.waitForTabLoad(params.tabId);
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

            switch (toolName) {
              case 'getDialogs':
                result = await TgToolkit.getDialogs(
                  params.limit,
                  params.offset,
                  params.chatTitle,
                  params.isPublic,
                  params.isFree,
                  params.status,
                  params.sortBy,
                  params.sortOrder
                );
                break;
              case 'getMessages':
                result = await TgToolkit.getMessages(
                  params.chatId,
                  params.limit,
                  params.offset,
                  params.messageText,
                  params.senderId,
                  params.startTimestamp,
                  params.endTimestamp,
                  params.sortBy,
                  params.sortOrder
                );
                break;
              case 'searchMessages':
                result = await TgToolkit.searchMessages(
                  params.query,
                  params.chatId,
                  params.topK,
                  params.messageRange,
                  params.threshold,
                  params.isPublic,
                  params.isFree
                );
                break;
              default:
                throw new Error(`Unknown TgToolkit operation: ${toolName}`);
            }

            sendResponse({ success: true, data: result });
            return true;
          }
        } catch (error: any) {
          console.error('Error executing tool in background:', error);
          sendResponse({ success: false, error: error.message || String(error) });
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
        } catch (error) {
          console.error('Error updating config:', error);
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      })();

      return true;
    }
  }
);
