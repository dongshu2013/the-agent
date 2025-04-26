import type { FC } from '../../../lib/teact/teact';
import React, {
  memo, useEffect, useMemo, useRef, useState,
} from '../../../lib/teact/teact';
import { getActions, getGlobal, withGlobal } from '../../../global';

import type { GlobalState } from '../../../global/types';
import type { ISettings } from '../../../types';
import { LeftColumnContent, SettingsScreens } from '../../../types';
import type { ApiChat, ApiMessage } from '../../../api/types';

// Type declaration to access the selectedChats from Chat.tsx
// This is already declared in Chat.tsx

import {
  APP_NAME,
  DEBUG,
  IS_BETA,
} from '../../../config';
import {
  selectCanSetPasscode,
  selectCurrentMessageList,
  selectIsCurrentUserPremium,
  selectTabState,
  selectTheme,
} from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';
import captureEscKeyListener from '../../../util/captureEscKeyListener';
import { formatDateToString } from '../../../util/dates/dateFormat';
import { IS_APP, IS_ELECTRON, IS_MAC_OS } from '../../../util/windowEnvironment';
import { getSelectedChats, clearSelectedChats, selectAllChats } from '../../../util/chatSelection';

import useAppLayout from '../../../hooks/useAppLayout';
import useConnectionStatus from '../../../hooks/useConnectionStatus';
import useElectronDrag from '../../../hooks/useElectronDrag';
import useFlag from '../../../hooks/useFlag';
import { useHotkeys } from '../../../hooks/useHotkeys';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';
import useOldLang from '../../../hooks/useOldLang';
import { useFullscreenStatus } from '../../../hooks/window/useFullscreen';
import useForceUpdate from '../../../hooks/useForceUpdate';
import useLeftHeaderButtonRtlForumTransition from './hooks/useLeftHeaderButtonRtlForumTransition';

import Icon from '../../common/icons/Icon';
import PeerChip from '../../common/PeerChip';
import StoryToggler from '../../story/StoryToggler';
import Button from '../../ui/Button';
import DropdownMenu from '../../ui/DropdownMenu';
import SearchInput from '../../ui/SearchInput';
import ShowTransition from '../../ui/ShowTransition';
import ConnectionStatusOverlay from '../ConnectionStatusOverlay';
import LeftSideMenuItems from './LeftSideMenuItems';
import StatusButton from './StatusButton';

import './LeftMainHeader.scss';

// Add styles for header buttons
const styleElement = document.createElement('style');
styleElement.textContent = `
  .selection-controls {
    display: flex;
    align-items: center;
  }
  
  .import-selected-button,
  .select-all-button,
  .clear-selection-button {
    margin-right: 0.5rem;
  }
`;
document.head.appendChild(styleElement);

type OwnProps = {
  shouldHideSearch?: boolean;
  content: LeftColumnContent;
  contactsFilter: string;
  isClosingSearch?: boolean;
  shouldSkipTransition?: boolean;
  onSearchQuery: (query: string) => void;
  onSelectSettings: NoneToVoidFunction;
  onSelectContacts: NoneToVoidFunction;
  onSelectArchived: NoneToVoidFunction;
  onReset: NoneToVoidFunction;
};

type StateProps =
  {
    searchQuery?: string;
    isLoading: boolean;
    globalSearchChatId?: string;
    searchDate?: number;
    theme: ISettings['theme'];
    isMessageListOpen: boolean;
    isCurrentUserPremium?: boolean;
    isConnectionStatusMinimized: ISettings['isConnectionStatusMinimized'];
    areChatsLoaded?: boolean;
    hasPasscode?: boolean;
    canSetPasscode?: boolean;
  }
  & Pick<GlobalState, 'connectionState' | 'isSyncing' | 'isFetchingDifference'>;

const CLEAR_DATE_SEARCH_PARAM = { date: undefined };
const CLEAR_CHAT_SEARCH_PARAM = { id: undefined };

// const TARGET_URL = 'http://localhost:3000/api/tg';
const TARGET_URL = 'https://the-agent-production.up.railway.app/api/tg';

// Add API functions for importing chats and messages
const importGroups = async (chats: Record<string, ApiChat>) => {
  try {
    const apiKey = localStorage.getItem('apiKey');
    const { showNotification } = getActions();
    
    const response = await fetch(`${TARGET_URL}/import_chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      },
      body: JSON.stringify({
        "chats": Object.values(chats).map(chat => ({
          "chat_id": chat.id,
          "chat_type": chat.type,
          "chat_title": chat.title
        }))
      }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      showNotification({
        message: `Error importing groups: ${response.statusText || result.error || 'Unknown error'}`,
      });
      throw new Error(`Error importing groups: ${response.statusText}`);
    }
    
    showNotification({
      message: result.message || 'Groups imported successfully',
    });
    
    return result;
  } catch (error) {
    console.error('Failed to import groups:', error);
    getActions().showNotification({
      message: `Failed to import groups: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    throw error;
  }
};

const importMessages = async (chats: Record<string, ApiChat>) => {
  try {
    const chatIds = Object.keys(chats);
    const apiKey = localStorage.getItem('apiKey');
    const global = getGlobal();
    const { showNotification } = getActions();
    
    // Prepare messages in the required format
    const formattedMessages = [];
    
    for (const chatId of chatIds) {
      const chatMessages = global.messages.byChatId[chatId]?.byId;
      
      if (chatMessages) {
        // Get message IDs and sort them in descending order (newest first)
        const messageIds = Object.keys(chatMessages)
          .map(Number)
          .sort((a, b) => b - a)
          .slice(0, 500); // Take only the 500 most recent messages
        
        // Format each message according to the required structure
        for (const id of messageIds) {
          const message = chatMessages[id];
          if (message && message.content.text) {
            formattedMessages.push({
              chat_id: message.chatId,
              message_id: message.id.toString(),
              message_text: message.content.text.text,
              message_timestamp: message.date,
              sender_id: message.senderId,
              is_pinned: message.isPinned
            });
          }
        }
      }
    }
    
    // Send the messages to the API with the correct format
    const response = await fetch(`${TARGET_URL}/import_messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey || ''}`
      },
      body: JSON.stringify({ messages: formattedMessages }),
    });
    
    if (!response.ok) {
      const errorText = `Error importing messages: ${response.statusText}`;
      showNotification({
        message: errorText,
      });
      throw new Error(errorText);
    }
    
    const result = await response.json();
    showNotification({
      message: result.message || 'Messages imported successfully',
    });
    
    return result;
  } catch (error) {
    console.error('Failed to import messages:', error);
    getActions().showNotification({
      message: `Failed to import messages: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
    throw error;
  }
};

const LeftMainHeader: FC<OwnProps & StateProps> = ({
  shouldHideSearch,
  content,
  contactsFilter,
  isClosingSearch,
  searchQuery,
  isLoading,
  isCurrentUserPremium,
  shouldSkipTransition,
  globalSearchChatId,
  searchDate,
  theme,
  connectionState,
  isSyncing,
  isFetchingDifference,
  isMessageListOpen,
  isConnectionStatusMinimized,
  areChatsLoaded,
  hasPasscode,
  canSetPasscode,
  onSearchQuery,
  onSelectSettings,
  onSelectContacts,
  onSelectArchived,
  onReset,
}) => {
  const {
    setGlobalSearchDate,
    setSettingOption,
    setGlobalSearchChatId,
    lockScreen,
    requestNextSettingsScreen,
  } = getActions();

  const oldLang = useOldLang();
  const lang = useLang();
  const { isMobile } = useAppLayout();

  const [isBotMenuOpen, markBotMenuOpen, unmarkBotMenuOpen] = useFlag();
  const [isImporting, markIsImporting, unmarkIsImporting] = useFlag();
  const forceUpdate = useForceUpdate();

  const areContactsVisible = content === LeftColumnContent.Contacts;
  const hasMenu = content === LeftColumnContent.ChatList;
  
  // State to track selected chats count
  const [selectedChatsCount, setSelectedChatsCount] = useState(0);
  
  // Update selected chats count when it changes
  useEffect(() => {
    const handleSelectedChatsChange = () => {
      const selectedChats = getSelectedChats();
      setSelectedChatsCount(Object.keys(selectedChats).length);
    };

    document.addEventListener('selectedChatsChange', handleSelectedChatsChange);
    return () => {
      document.removeEventListener('selectedChatsChange', handleSelectedChatsChange);
    };
  }, []);
  
  // Function to prompt user for API key
  const promptForApiKey = useLastCallback(() => {
    return new Promise<string | null>((resolve) => {
      const apiKey = prompt('Please enter your API key:');
      if (apiKey) {
        localStorage.setItem('apiKey', apiKey);
        resolve(apiKey);
      } else {
        resolve(null);
      }
    });
  });

  const handleImportSelected = useLastCallback(async () => {
    const selectedChats = getSelectedChats();
    if (Object.keys(selectedChats).length > 0) {
      try {
        // Check if API key exists in localStorage
        let apiKey = localStorage.getItem('apiKey');
        
        // If API key doesn't exist, prompt user to enter it
        if (!apiKey) {
          apiKey = await promptForApiKey();
          if (!apiKey) {
            // User canceled the prompt
            return;
          }
        }
        
        markIsImporting();
        
        // Call the API endpoints
        await importGroups(selectedChats);
        await importMessages(selectedChats);
        
        // Clear selection after successful import
        document.dispatchEvent(new CustomEvent('clearSelectedChats'));
        
        forceUpdate();
      } catch (error) {
        console.error('Import failed:', error);
      } finally {
        unmarkIsImporting();
      }
    }
  });
  
  // Simplified approach for select all
  const handleSelectAll = useLastCallback(() => {
    // We'll create a custom event that our Chat components will listen to
    document.dispatchEvent(new CustomEvent('selectAllChats'));
  });
  
  const handleClearSelection = useLastCallback(() => {
    clearSelectedChats();
  });

  const selectedSearchDate = useMemo(() => {
    return searchDate
      ? formatDateToString(new Date(searchDate * 1000))
      : undefined;
  }, [searchDate]);

  const { connectionStatus, connectionStatusText, connectionStatusPosition } = useConnectionStatus(
    oldLang,
    connectionState,
    isSyncing || isFetchingDifference,
    isMessageListOpen,
    isConnectionStatusMinimized,
    !areChatsLoaded,
  );

  const handleLockScreenHotkey = useLastCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasPasscode) {
      lockScreen();
    } else {
      requestNextSettingsScreen({ screen: SettingsScreens.PasscodeDisabled });
    }
  });

  useHotkeys(useMemo(() => (canSetPasscode ? {
    'Ctrl+Shift+L': handleLockScreenHotkey,
    'Alt+Shift+L': handleLockScreenHotkey,
    'Meta+Shift+L': handleLockScreenHotkey,
    ...(IS_APP && { 'Mod+L': handleLockScreenHotkey }),
  } : undefined), [canSetPasscode]));

  const MainButton: FC<{ onTrigger: () => void; isOpen?: boolean }> = useMemo(() => {
    return ({ onTrigger, isOpen }) => (
      <Button
        round
        ripple={hasMenu && !isMobile}
        size="smaller"
        color="translucent"
        className={isOpen ? 'active' : ''}
        // eslint-disable-next-line react/jsx-no-bind
        onClick={hasMenu ? onTrigger : () => onReset()}
        ariaLabel={hasMenu ? oldLang('AccDescrOpenMenu2') : 'Return to chat list'}
      >
        <div className={buildClassName(
          'animated-menu-icon',
          !hasMenu && 'state-back',
          shouldSkipTransition && 'no-animation',
        )}
        />
      </Button>
    );
  }, [hasMenu, isMobile, oldLang, onReset, shouldSkipTransition]);

  const handleSearchFocus = useLastCallback(() => {
    if (!searchQuery) {
      onSearchQuery('');
    }
  });

  const toggleConnectionStatus = useLastCallback(() => {
    setSettingOption({ isConnectionStatusMinimized: !isConnectionStatusMinimized });
  });

  const handleLockScreen = useLastCallback(() => {
    lockScreen();
  });

  const isSearchRelevant = Boolean(globalSearchChatId)
    || content === LeftColumnContent.GlobalSearch
    || content === LeftColumnContent.Contacts;

  const isSearchFocused = isMobile ? !isMessageListOpen && isSearchRelevant : isSearchRelevant;

  useEffect(() => (isSearchFocused ? captureEscKeyListener(() => onReset()) : undefined), [isSearchFocused, onReset]);

  const searchInputPlaceholder = content === LeftColumnContent.Contacts
    ? lang('SearchFriends')
    : lang('Search');

  const versionString = IS_BETA ? `${APP_VERSION} Beta (${APP_REVISION})` : (DEBUG ? APP_REVISION : APP_VERSION);

  const isFullscreen = useFullscreenStatus();

  // Disable dropdown menu RTL animation for resize
  const {
    shouldDisableDropdownMenuTransitionRef,
    handleDropdownMenuTransitionEnd,
  } = useLeftHeaderButtonRtlForumTransition(shouldHideSearch);

  // eslint-disable-next-line no-null/no-null
  const headerRef = useRef<HTMLDivElement>(null);
  useElectronDrag(headerRef);

  const withStoryToggler = !isSearchFocused
    && !selectedSearchDate && !globalSearchChatId && !areContactsVisible;

  const searchContent = useMemo(() => {
    return (
      <>
        {selectedSearchDate && (
          <PeerChip
            icon="calendar"
            title={selectedSearchDate}
            canClose
            isMinimized={Boolean(globalSearchChatId)}
            className="left-search-picker-item"
            onClick={setGlobalSearchDate}
            isCloseNonDestructive
            clickArg={CLEAR_DATE_SEARCH_PARAM}
          />
        )}
        {globalSearchChatId && (
          <PeerChip
            className="left-search-picker-item"
            peerId={globalSearchChatId}
            onClick={setGlobalSearchChatId}
            canClose
            isMinimized
            clickArg={CLEAR_CHAT_SEARCH_PARAM}
          />
        )}
      </>
    );
  }, [globalSearchChatId, selectedSearchDate]);

  return (
    <div className="LeftMainHeader">
      <div id="LeftMainHeader" className="left-header" ref={headerRef}>
        {oldLang.isRtl && <div className="DropdownMenuFiller" />}
        <DropdownMenu
          trigger={MainButton}
          footer={`${APP_NAME} ${versionString}`}
          className={buildClassName(
            'main-menu',
            oldLang.isRtl && 'rtl',
            shouldHideSearch && oldLang.isRtl && 'right-aligned',
            shouldDisableDropdownMenuTransitionRef.current && oldLang.isRtl && 'disable-transition',
          )}
          forceOpen={isBotMenuOpen}
          positionX={shouldHideSearch && oldLang.isRtl ? 'right' : 'left'}
          transformOriginX={IS_ELECTRON && IS_MAC_OS && !isFullscreen ? 90 : undefined}
          onTransitionEnd={oldLang.isRtl ? handleDropdownMenuTransitionEnd : undefined}
        >
          <LeftSideMenuItems
            onSelectArchived={onSelectArchived}
            onSelectContacts={onSelectContacts}
            onSelectSettings={onSelectSettings}
            onBotMenuOpened={markBotMenuOpen}
            onBotMenuClosed={unmarkBotMenuOpen}
          />
        </DropdownMenu>
        <SearchInput
          inputId="telegram-search-input"
          resultsItemSelector=".LeftSearch .ListItem-button"
          className={buildClassName(
            (globalSearchChatId || searchDate) ? 'with-picker-item' : undefined,
            shouldHideSearch && 'SearchInput--hidden',
          )}
          value={isClosingSearch ? undefined : (contactsFilter || searchQuery)}
          focused={isSearchFocused}
          isLoading={isLoading || connectionStatusPosition === 'minimized'}
          spinnerColor={connectionStatusPosition === 'minimized' ? 'yellow' : undefined}
          spinnerBackgroundColor={connectionStatusPosition === 'minimized' && theme === 'light' ? 'light' : undefined}
          placeholder={searchInputPlaceholder}
          autoComplete="off"
          canClose={Boolean(globalSearchChatId || searchDate)}
          onChange={onSearchQuery}
          onReset={onReset}
          onFocus={handleSearchFocus}
          onSpinnerClick={connectionStatusPosition === 'minimized' ? toggleConnectionStatus : undefined}
        >
          {searchContent}
          <StoryToggler
            canShow={withStoryToggler}
          />
        </SearchInput>
        {content === LeftColumnContent.ChatList && (
          <div className="selection-controls">
            {selectedChatsCount > 0 && (
              <Button
                round
                ripple={!isMobile}
                size="smaller"
                color="translucent"
                className="clear-selection-button"
                ariaLabel="Clear Selection"
                onClick={handleClearSelection}
              >
                <Icon name="close" />
              </Button>
            )}
            <Button
              round
              ripple={!isMobile}
              size="smaller"
              color="translucent"
              className="select-all-button"
              ariaLabel="Select All"
              onClick={handleSelectAll}
            >
              <Icon name="select" />
            </Button>
            <Button
              round
              ripple={!isMobile}
              size="smaller"
              color="translucent"
              className="import-selected-button"
              ariaLabel="Import Selected"
              onClick={handleImportSelected}
              disabled={selectedChatsCount === 0}
            >
              <Icon name="download" />
            </Button>
          </div>
        )}
        {isCurrentUserPremium && <StatusButton />}
        {hasPasscode && (
          <Button
            round
            ripple={!isMobile}
            size="smaller"
            color="translucent"
            ariaLabel={`${oldLang('ShortcutsController.Others.LockByPasscode')} (Ctrl+Shift+L)`}
            onClick={handleLockScreen}
            className={buildClassName(!isCurrentUserPremium && 'extra-spacing')}
          >
            <Icon name="lock" />
          </Button>
        )}
        <ShowTransition
          isOpen={connectionStatusPosition === 'overlay'}
          isCustom
          className="connection-state-wrapper"
        >
          <ConnectionStatusOverlay
            connectionStatus={connectionStatus}
            connectionStatusText={connectionStatusText!}
            onClick={toggleConnectionStatus}
          />
        </ShowTransition>
      </div>
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global): StateProps => {
    const tabState = selectTabState(global);
    const {
      query: searchQuery, fetchingStatus, chatId, minDate,
    } = tabState.globalSearch;
    const {
      connectionState, isSyncing, isFetchingDifference,
    } = global;
    const { isConnectionStatusMinimized } = global.settings.byKey;

    return {
      searchQuery,
      isLoading: fetchingStatus ? Boolean(fetchingStatus.chats || fetchingStatus.messages) : false,
      globalSearchChatId: chatId,
      searchDate: minDate,
      theme: selectTheme(global),
      connectionState,
      isSyncing,
      isFetchingDifference,
      isMessageListOpen: Boolean(selectCurrentMessageList(global)),
      isConnectionStatusMinimized,
      isCurrentUserPremium: selectIsCurrentUserPremium(global),
      areChatsLoaded: Boolean(global.chats.listIds.active),
      hasPasscode: Boolean(global.passcode.hasPasscode),
      canSetPasscode: selectCanSetPasscode(global),
    };
  },
)(LeftMainHeader));
