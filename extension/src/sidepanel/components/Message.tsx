import React from 'react';
import { useState } from 'react';

import { processMarkdown } from '../../utils/markdown-processor';
import { ScreenshotResult } from '~/tools/web-toolkit';
import { VersionedMessage } from '~/utils/db';
import RunIcon from '~/assets/icons/run.svg';
import DoneIcon from '~/assets/icons/done.svg';
import ErrorIcon from '~/assets/icons/error.svg';
import Reasoning from './Reasoning';

interface Props {
  message: VersionedMessage;
  isLatestResponse?: boolean;
}

interface ToolMessageContent {
  success: boolean;
  data?: unknown;
  error?: string;
}

function areEqual(prevProps: Props, nextProps: Props) {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.message.version === nextProps.message.version &&
    prevProps.message.reasoning === nextProps.message.reasoning
  );
}

const MessageComponent = React.memo(function MessageComponent({
  message,
  isLatestResponse,
}: Props) {
  const isUser = message?.role === 'user';
  const isError = message?.role === 'error';
  const isTool = message?.role === 'tool';

  const [copySuccess, setCopySuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (!message) {
    console.warn('Message component received null or undefined message');
    return null;
  }

  const handleCopy = () => {
    if (!message.content) return;

    navigator.clipboard
      .writeText(message.content)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  const shouldShowCopyButton = () => {
    if (isError) return false;
    if (!message.content) return false;
    if (message.role === 'tool') return false;

    return isLatestResponse || (isHovered && isUser);
  };

  const renderToolMessage = () => {
    if (message.role !== 'tool') return null;

    let status: 'running' | 'success' | 'error' = 'running';
    let parsedContent: ToolMessageContent | null = null;

    if (!message.content) {
      status = 'running';
    } else {
      try {
        parsedContent = JSON.parse(message.content) as ToolMessageContent;
        if (typeof parsedContent.success === 'boolean') {
          status = parsedContent.success ? 'success' : 'error';
        }
      } catch (e) {
        status = 'error';
        console.warn('Failed to parse message.content as JSON:', e);
      }
    }

    let icon = (
      <img
        src={RunIcon}
        alt="running"
        style={{
          marginRight: 8,
          width: 18,
          height: 18,
          verticalAlign: 'middle',
          animation: 'spin 1s linear infinite',
        }}
      />
    );
    let tip = 'Executing';
    let border = '1px solid #ccc';
    let bg = '#fff';

    if (status === 'success') {
      icon = (
        <img
          src={DoneIcon}
          alt="done"
          style={{ marginRight: 8, width: 18, height: 18, verticalAlign: 'middle' }}
        />
      );
      tip = 'Executed';
      border = '1.5px solid #55B610';
      bg = '#f3faed';
    } else if (status === 'error') {
      icon = (
        <img
          src={ErrorIcon}
          alt="error"
          style={{ marginRight: 8, width: 18, height: 18, verticalAlign: 'middle' }}
        />
      );
      tip = 'Error';
      border = '1.5px solid #D20D0D';
      bg = '#fef2f2';
    }

    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '4px 0' }}>
        <div
          style={{
            border,
            borderRadius: '6px',
            padding: '5px 10px',
            fontSize: '13px',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'center',
            background: bg,
            fontWeight: 500,
            minWidth: 0,
            maxWidth: 320,
          }}
        >
          {icon}
          <span style={{ fontWeight: 500 }}>{tip}</span>
          <span
            style={{
              display: 'inline-block',
              backgroundColor: '#fff',
              color: '#999',
              border: '1px solid #ccc',
              padding: '1px 6px',
              borderRadius: '4px',
              marginLeft: '10px',
              fontSize: '12px',
              maxWidth: 120,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {message.name?.replace('TabToolkit_', '').replace('WebToolkit_', '') || ''}
          </span>
          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  };

  const renderReasoning = () => {
    if (!message.reasoning) return null;
    return (
      <div style={{ marginBottom: 8 }}>
        <Reasoning reasoning={message.reasoning} isStreaming={!!isLatestResponse} />
      </div>
    );
  };

  const renderContent = () => {
    if (isUser || isError) {
      return <div style={{ whiteSpace: 'pre-wrap' }}>{message.content || ''}</div>;
    }

    const content = message.content || '';
    const htmlContent = processMarkdown(content);

    const screenshotResult = message.tool_calls?.find(
      tool => tool.function.name === 'WebToolkit_screenshot'
    )?.result;
    const screenshotUrl = (screenshotResult?.data as ScreenshotResult)?.url || null;

    const toolCallHint =
      message.role === 'tool' ? <div style={{ marginTop: 8 }}>{renderToolMessage()}</div> : null;

    return (
      <>
        {renderReasoning()}
        <div
          style={{ width: '100%', overflow: 'auto' }}
          dangerouslySetInnerHTML={{
            __html: isTool ? content : htmlContent,
          }}
        />
        {toolCallHint}
        {screenshotUrl && (
          <div style={{ marginTop: '12px' }}>
            <img
              src={screenshotUrl}
              alt="Screenshot"
              style={{
                maxWidth: '100%',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              }}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div
      style={{
        marginBottom: isUser || isLatestResponse ? '30px' : '0',
        marginTop: isUser || isError ? '30px' : '0',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginLeft: isUser ? '15%' : '0',
          marginRight: !isUser ? '15%' : '0',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isUser ? 'flex-end' : 'flex-start',
            maxWidth: '100%',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              maxWidth: '100%',
              padding: isUser || isError ? '10px 16px' : '3px 16px 3px 0',
              textAlign: 'left',
              fontSize: '14px',
              lineHeight: '1.5',
              backgroundColor: isUser ? '#f2f2f2' : isError ? '#fee2e2' : 'transparent',
              borderRadius: '12px',
              boxShadow: isUser ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
              color: isError ? '#b91c1c' : '#333333',
              wordBreak: 'break-word',
            }}
          >
            {message.role === 'tool' ? renderToolMessage() : renderContent()}
          </div>

          {shouldShowCopyButton() && (
            <button
              onClick={handleCopy}
              style={{
                position: 'absolute',
                bottom: '-30px',
                left: isUser ? 'auto' : '0',
                right: isUser ? '0' : 'auto',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                backgroundColor: 'transparent',
                padding: 0,
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s',
                opacity: !isUser ? 1 : isHovered ? 1 : 0,
                pointerEvents: !isUser ? 'auto' : isHovered ? 'auto' : 'none',
              }}
              title="Copy to clipboard"
            >
              {copySuccess ? (
                <svg
                  style={{
                    width: '16px',
                    height: '16px',
                    color: '#059669',
                  }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  style={{
                    width: '16px',
                    height: '16px',
                    color: '#6b7280',
                  }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}, areEqual);

export default MessageComponent;
