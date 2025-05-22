import React from 'react';
import { useState, useEffect } from 'react';

import { processMarkdown } from '../../utils/markdown-processor';
import { ScreenshotResult } from '~/tools/web-toolkit';
import { VersionedMessage } from '~/utils/db';

interface Props {
  message: VersionedMessage;
  isLatestResponse?: boolean;
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
  const [isLatest, setIsLatest] = useState(isLatestResponse);

  useEffect(() => {
    setIsLatest(isLatestResponse);
  }, [isLatestResponse]);

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

    return isLatest || (isHovered && isUser);
  };

  const renderToolMessage = () => {
    if (message.role !== 'tool') return null;

    return (
      <div
        key={message.id}
        style={{
          border: '1px solid #ccc',
          borderRadius: '6px',
          padding: '6px 8px',
          margin: '4px 0',
          fontSize: '12px',
          lineHeight: '1.4',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <svg
          style={{ marginRight: '6px' }}
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" />
          <path d="M17.64 15 22 10.64" />
          <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
        </svg>
        Executed tool call{' '}
        <span
          style={{
            display: 'inline-block',
            backgroundColor: '#f7f7f7',
            color: '#999',
            border: '1px solid #ccc',
            padding: '1px 6px',
            borderRadius: '4px',
            marginLeft: '6px',
            fontSize: '11px',
          }}
        >
          {message.name?.replace('TabToolkit_', '').replace('WebToolkit_', '')}
        </span>
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
        marginBottom: isUser || isLatest ? '30px' : '0',
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
