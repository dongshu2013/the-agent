import type { FC } from '../../../lib/teact/teact';
import React, { memo, useEffect, useMemo, useState, useRef } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import type {
  ApiChat,
  ApiDraft,
  ApiMessage,
  ApiMessageOutgoingStatus,
  ApiPeer,
  ApiTopic,
  ApiTypeStory,
  ApiTypingStatus,
  ApiUser,
  ApiUserStatus,
} from '../../../api/types';
import type { GlobalState } from '../../../global/types';
import type { ObserveFn } from '../../../hooks/useIntersectionObserver';
import type { ChatAnimationTypes } from './hooks';
import { MAIN_THREAD_ID } from '../../../api/types';
import { StoryViewerOrigin } from '../../../types';

import {
  groupStatefulContent,
  isUserId,
  isUserOnline,
} from '../../../global/helpers';
import { getIsChatMuted } from '../../../global/helpers/notifications';
import {
  selectCanAnimateInterface,
  selectChat,
  selectChatLastMessage,
  selectChatLastMessageId,
  selectChatMessage,
  selectCurrentMessageList,
  selectDraft,
  selectIsForumPanelClosed,
  selectIsForumPanelOpen,
  selectNotifyDefaults,
  selectNotifyException,
  selectOutgoingStatus,
  selectPeer,
  selectPeerStory,
  selectSender,
  selectTabState,
  selectThreadParam,
  selectTopicFromMessage,
  selectTopicsInfo,
  selectUser,
  selectUserStatus,
} from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';
import { toggleChatSelection, isChatSelected } from '../../../util/chatSelection';
import { createLocationHash } from '../../../util/routing';

import { IS_OPEN_IN_NEW_TAB_SUPPORTED } from '../../../util/windowEnvironment';

import useSelectorSignal from '../../../hooks/data/useSelectorSignal';
import useAppLayout from '../../../hooks/useAppLayout';
import useChatContextActions from '../../../hooks/useChatContextActions';
import useEnsureMessage from '../../../hooks/useEnsureMessage';
import useFlag from '../../../hooks/useFlag';
import useForceUpdate from '../../../hooks/useForceUpdate';
import { useIsIntersecting } from '../../../hooks/useIntersectionObserver';
import useLastCallback from '../../../hooks/useLastCallback';
import useShowTransitionDeprecated from '../../../hooks/useShowTransitionDeprecated';
import useChatListEntry from './hooks/useChatListEntry';

import Avatar from '../../common/Avatar';
import DeleteChatModal from '../../common/DeleteChatModal';
import FullNameTitle from '../../common/FullNameTitle';
import Icon from '../../common/icons/Icon';
import StarIcon from '../../common/icons/StarIcon';
import LastMessageMeta from '../../common/LastMessageMeta';
import ListItem from '../../ui/ListItem';
import ChatFolderModal from '../ChatFolderModal.async';
import MuteChatModal from '../MuteChatModal.async';
import ChatBadge from './ChatBadge';
import ChatCallStatus from './ChatCallStatus';
import Checkbox from '../../ui/Checkbox';

import './Chat.scss';

// Add styles for checkbox and selected state
const styleElement = document.createElement('style');
styleElement.textContent = `
  .chat-checkbox {
    margin-right: 0.5rem;
    margin-left: 0.5rem;
  }
  
  .ListItem.chat-item .chat-checkbox {
    opacity: 0.7;
  }
  
  .ListItem.chat-item:hover .chat-checkbox {
    opacity: 1;
  }

  .ListItem.chat-item.selected-chat {
    background-color: var(--color-chat-active);
  }
`;
document.head.appendChild(styleElement);

type OwnProps = {
  chatId: string;
  folderId?: number;
  orderDiff: number;
  animationType: ChatAnimationTypes;
  isPinned?: boolean;
  offsetTop?: number;
  isSavedDialog?: boolean;
  isPreview?: boolean;
  previewMessageId?: number;
  className?: string;
  observeIntersection?: ObserveFn;
  onDragEnter?: (chatId: string) => void;
};

type StateProps = {
  chat?: ApiChat;
  lastMessageStory?: ApiTypeStory;
  listedTopicIds?: number[];
  topics?: Record<number, ApiTopic>;
  isMuted?: boolean;
  user?: ApiUser;
  userStatus?: ApiUserStatus;
  lastMessageSender?: ApiPeer;
  lastMessageOutgoingStatus?: ApiMessageOutgoingStatus;
  draft?: ApiDraft;
  isSelected?: boolean;
  isSelectedForum?: boolean;
  isForumPanelOpen?: boolean;
  canScrollDown?: boolean;
  canChangeFolder?: boolean;
  lastMessageTopic?: ApiTopic;
  typingStatus?: ApiTypingStatus;
  withInterfaceAnimations?: boolean;
  lastMessageId?: number;
  lastMessage?: ApiMessage;
  currentUserId: string;
  isSynced?: boolean;
};

const Chat: FC<OwnProps & StateProps> = ({
  chatId,
  folderId,
  orderDiff,
  animationType,
  isPinned,
  listedTopicIds,
  topics,
  observeIntersection,
  chat,
  lastMessageStory,
  isMuted,
  user,
  userStatus,
  lastMessageSender,
  lastMessageOutgoingStatus,
  offsetTop,
  draft,
  withInterfaceAnimations,
  isSelected,
  isSelectedForum,
  isForumPanelOpen,
  canScrollDown,
  canChangeFolder,
  lastMessageTopic,
  typingStatus,
  lastMessageId,
  lastMessage,
  isSavedDialog,
  currentUserId,
  isPreview,
  previewMessageId,
  className,
  isSynced,
  onDragEnter,
}) => {
  const {
    openChat,
    openSavedDialog,
    toggleChatInfo,
    focusLastMessage,
    focusMessage,
    loadTopics,
    openForumPanel,
    closeForumPanel,
    setShouldCloseRightColumn,
    reportMessages,
  } = getActions();

  const { isMobile } = useAppLayout();
  const [isDeleteModalOpen, openDeleteModal, closeDeleteModal] = useFlag();
  const [isMuteModalOpen, openMuteModal, closeMuteModal] = useFlag();
  const [isChatFolderModalOpen, openChatFolderModal, closeChatFolderModal] = useFlag();
  const [shouldRenderDeleteModal, markRenderDeleteModal, unmarkRenderDeleteModal] = useFlag();
  const [shouldRenderMuteModal, markRenderMuteModal, unmarkRenderMuteModal] = useFlag();
  const [shouldRenderChatFolderModal, markRenderChatFolderModal, unmarkRenderChatFolderModal] = useFlag();
  const [isMultiSelected, setIsMultiSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update multi-selection state when selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      setIsMultiSelected(isChatSelected(chatId));
    };
    
    // Handle the selectAllChats event for this chat
    const handleSelectAll = () => {
      if (chat) {
        toggleChatSelection(chatId, chat);
      }
    };
    
    handleSelectionChange(); // Initialize state
    document.addEventListener('selectedChatsChange', handleSelectionChange);
    document.addEventListener('selectAllChats', handleSelectAll);
    
    return () => {
      document.removeEventListener('selectedChatsChange', handleSelectionChange);
      document.removeEventListener('selectAllChats', handleSelectAll);
    };
  }, [chatId, chat]);

  const handleClick = useLastCallback((e: React.MouseEvent<HTMLElement>) => {
    // 阻止事件冒泡和默认行为
    e.preventDefault();
    e.stopPropagation();
    
    // 直接触发切换选中状态 - 这确保了点击和再次点击能够正确切换
    toggleChatSelection(chatId, chat);
  });

  const handleDragEnter = useLastCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (onDragEnter) {
      onDragEnter(chatId);
    }
  });

  const handleDelete = useLastCallback(() => {
    openDeleteModal();
  });

  const handleMute = useLastCallback(() => {
    openMuteModal();
  });

  const handleChatFolderChange = useLastCallback(() => {
    openChatFolderModal();
  });

  const handleReport = useLastCallback(() => {
    if (!chat) return;
    reportMessages({ chatId: chat.id, messageIds: [] });
  });

  const contextActions = useChatContextActions({
    chat,
    user,
    canChangeFolder,
    handleDelete: openDeleteModal,
    handleMute: openMuteModal,
    handleChatFolderChange: openChatFolderModal,
    folderId,
    isPinned,
    isMuted,
    isSavedDialog,
  });

  const isIntersecting = useIsIntersecting(containerRef, chat ? observeIntersection : undefined);

  // Load the forum topics to display unread count badge
  useEffect(() => {
    if (isIntersecting && chat?.isForum && isSynced && listedTopicIds === undefined) {
      loadTopics({ chatId });
    }
  }, [chatId, listedTopicIds, isSynced, chat?.isForum, isIntersecting]);

  // 处理在线状态和界面转换
  const isOnline = user && userStatus && isUserOnline(user, userStatus);
  const { hasShownClass: isAvatarOnlineShown } = useShowTransitionDeprecated(isOnline);
  
  // 修复类型比较问题 - animationType可能是'none'或其他值
  const hasAnimation = Boolean(animationType) && String(animationType) !== 'none';
  const { transitionClassNames } = useShowTransitionDeprecated(hasAnimation, undefined, undefined, false);
  const getIsForumPanelClosed = useSelectorSignal(selectIsForumPanelClosed);

  const href = useMemo(() => {
    if (!IS_OPEN_IN_NEW_TAB_SUPPORTED) return undefined;

    if (isSavedDialog) {
      return `#${createLocationHash(currentUserId, 'thread', chatId)}`;
    }

    return `#${createLocationHash(chatId, 'thread', MAIN_THREAD_ID)}`;
  }, [chatId, currentUserId, isSavedDialog]);

  if (!chat) {
    return undefined;
  }

  const peer = user || chat;

  const chatClassName = buildClassName(
    'Chat chat-item-clickable',
    isMuted && 'chat-item-muted',
    isSelected && 'selected',
    isMultiSelected && 'selected-chat',
    isSavedDialog && 'saved-dialog',
    isPreview && 'chat-item-preview',
    chat?.hasUnreadMark && 'has-unread-mark',
    user && isUserOnline(user, userStatus) && 'online',
    className,
  );

  // Function to render the checkbox
  const renderCheckbox = () => (
    <div className="chat-checkbox">
      <Checkbox
        checked={isMultiSelected}
        onChange={(e) => {
          // 阻止事件冒泡，防止触发两次选择事件
          e.stopPropagation();
          toggleChatSelection(chatId, chat);
        }}
      />
    </div>
  );

  return (
    <ListItem
      ref={containerRef}
      className={chatClassName}
      style={`top: ${offsetTop}px`}
      ripple={!(chat?.isForum) && !isMobile}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      leftElement={renderCheckbox()}
      selected={isMultiSelected}
    >
      <div className={buildClassName('status', 'status-clickable')}>
        <Avatar
          peer={peer}
          isSavedMessages={user?.isSelf}
          isSavedDialog={isSavedDialog}
          size={isPreview ? 'medium' : 'large'}
          withStory={!user?.isSelf}
          withStoryGap={isAvatarOnlineShown || Boolean(chat.subscriptionUntil)}
          storyViewerOrigin={StoryViewerOrigin.ChatList}
          storyViewerMode="single-peer"
        />
        <div className="avatar-badge-wrapper">
          <div
            className={buildClassName('avatar-online', 'avatar-badge', isAvatarOnlineShown && 'avatar-online-shown')}
          />
          {!isAvatarOnlineShown && Boolean(chat.subscriptionUntil) && (
            <StarIcon type="gold" className="avatar-badge avatar-subscription" size="adaptive" />
          )}
          <ChatBadge
            chat={chat}
            isMuted={isMuted}
            shouldShowOnlyMostImportant
            forceHidden={getIsForumPanelClosed}
            topics={topics}
            isSelected={isSelected}
          />
        </div>
        {chat.isCallActive && chat.isCallNotEmpty && (
          <ChatCallStatus isMobile={isMobile} isSelected={isSelected} isActive={withInterfaceAnimations} />
        )}
      </div>
      <div className="info">
        <div className="info-row">
          <FullNameTitle
            peer={peer}
            withEmojiStatus
            isSavedMessages={chatId === user?.id && user?.isSelf}
            isSavedDialog={isSavedDialog}
            observeIntersection={observeIntersection}
          />
          {isMuted && !isSavedDialog && <Icon name="muted" />}
          <div className="separator" />
          {lastMessage && (
            <LastMessageMeta
              message={lastMessage}
              outgoingStatus={!isSavedDialog ? lastMessageOutgoingStatus : undefined}
              draftDate={draft?.date}
            />
          )}
        </div>
        <div className="subtitle">
          {/* 使用lastMessage的内容或显示默认文本 */}
          <div className="last-message">
            {lastMessage?.content.text?.text || '无消息'}
          </div>
          {!isPreview && chat && (
            <ChatBadge
              chat={chat}
              isPinned={isPinned}
              isMuted={isMuted}
              isSavedDialog={isSavedDialog}
              hasMiniApp={user?.hasMainMiniApp}
              topics={topics}
              isSelected={isSelected}
            />
          )}
        </div>
      </div>
      {shouldRenderDeleteModal && (
        <DeleteChatModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onCloseAnimationEnd={unmarkRenderDeleteModal}
          chat={chat}
          isSavedDialog={isSavedDialog}
        />
      )}
      {shouldRenderMuteModal && (
        <MuteChatModal
          isOpen={isMuteModalOpen}
          onClose={closeMuteModal}
          onCloseAnimationEnd={unmarkRenderMuteModal}
          chatId={chatId}
        />
      )}
      {shouldRenderChatFolderModal && (
        <ChatFolderModal
          isOpen={isChatFolderModalOpen}
          onClose={closeChatFolderModal}
          onCloseAnimationEnd={unmarkRenderChatFolderModal}
          chatId={chatId}
        />
      )}
    </ListItem>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, {
    chatId, isSavedDialog, isPreview, previewMessageId,
  }): StateProps => {
    const chat = selectChat(global, chatId);
    const user = selectUser(global, chatId);
    if (!chat) {
      return {
        currentUserId: global.currentUserId!,
      };
    }

    const lastMessageId = previewMessageId || selectChatLastMessageId(global, chatId, isSavedDialog ? 'saved' : 'all');
    const lastMessage = previewMessageId
      ? selectChatMessage(global, chatId, previewMessageId)
      : selectChatLastMessage(global, chatId, isSavedDialog ? 'saved' : 'all');
    const { isOutgoing, forwardInfo } = lastMessage || {};
    const savedDialogSender = isSavedDialog && forwardInfo?.fromId ? selectPeer(global, forwardInfo.fromId) : undefined;
    const messageSender = lastMessage ? selectSender(global, lastMessage) : undefined;
    const lastMessageSender = savedDialogSender || messageSender;

    const {
      chatId: currentChatId,
      threadId: currentThreadId,
      type: messageListType,
    } = selectCurrentMessageList(global) || {};
    const isSelected = !isPreview && chatId === currentChatId && (isSavedDialog
      ? chatId === currentThreadId : currentThreadId === MAIN_THREAD_ID);
    const isSelectedForum = (chat.isForum && chatId === currentChatId)
      || chatId === selectTabState(global).forumPanelChatId;

    const userStatus = selectUserStatus(global, chatId);
    const lastMessageTopic = lastMessage && selectTopicFromMessage(global, lastMessage);

    const typingStatus = selectThreadParam(global, chatId, MAIN_THREAD_ID, 'typingStatus');

    const topicsInfo = selectTopicsInfo(global, chatId);

    const storyData = lastMessage?.content.storyData;
    const lastMessageStory = storyData && selectPeerStory(global, storyData.peerId, storyData.id);

    return {
      chat,
      isMuted: getIsChatMuted(chat, selectNotifyDefaults(global), selectNotifyException(global, chat.id)),
      lastMessageSender,
      draft: selectDraft(global, chatId, MAIN_THREAD_ID),
      isSelected,
      isSelectedForum,
      isForumPanelOpen: selectIsForumPanelOpen(global),
      canScrollDown: isSelected && messageListType === 'thread',
      canChangeFolder: (global.chatFolders.orderedIds?.length || 0) > 1,
      ...(isOutgoing && lastMessage && {
        lastMessageOutgoingStatus: selectOutgoingStatus(global, lastMessage),
      }),
      user,
      userStatus,
      lastMessageTopic,
      typingStatus,
      withInterfaceAnimations: selectCanAnimateInterface(global),
      lastMessage,
      lastMessageId,
      currentUserId: global.currentUserId!,
      listedTopicIds: topicsInfo?.listedTopicIds,
      topics: topicsInfo?.topicsById,
      isSynced: global.isSynced,
      lastMessageStory,
    };
  },
)(Chat));
