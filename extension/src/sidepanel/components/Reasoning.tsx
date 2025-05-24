import React, { useState, useEffect } from 'react';
import ThinkIcon from '~/assets/icons/think.svg';
import ArrowIcon from '~/assets/icons/arrow.svg';
import MarkdownRenderer from './MarkdownRenderer';

interface ReasoningProps {
  reasoning?: string;
  finished: boolean;
}

const Reasoning: React.FC<ReasoningProps> = ({ reasoning = '', finished }) => {
  const hasReasoning = !!reasoning;
  // 默认展开
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (finished) {
      setCollapsed(true);
    }
  }, [finished]);

  return (
    <div>
      {/* Header 1/3宽度靠左 */}
      <div
        style={{
          maxWidth: '33%',
          minWidth: 180,
          marginLeft: 0,
          display: 'flex',
          alignItems: 'center',
          background: '#f3f4f6',
          borderRadius: 8,
          padding: '6px 10px',
          cursor: hasReasoning ? 'pointer' : 'default',
          userSelect: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
        onClick={() => hasReasoning && setCollapsed(c => !c)}
      >
        <img
          src={ThinkIcon}
          alt="thinking"
          style={{ width: 18, height: 18, marginRight: 7, opacity: 0.8 }}
        />
        <span style={{ fontWeight: 500, fontSize: 13, color: '#333' }}>
          {finished ? 'Have thought' : 'In thinking...'}
        </span>
        <div style={{ flex: 1 }} />
        {hasReasoning && (
          <img
            src={ArrowIcon}
            alt="toggle"
            style={{
              width: 14,
              height: 14,
              marginLeft: 6,
              transition: 'transform 0.2s',
              transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              opacity: 0.7,
            }}
          />
        )}
      </div>
      {/* Reasoning */}
      {hasReasoning && !collapsed && (
        <div
          style={{
            width: '100%',
            marginTop: 6,
            padding: 0,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <blockquote
            style={{
              width: '100%',
              background: '#f7f7fa',
              borderLeft: '2px solid #d1d5db',
              margin: 0,
              padding: '0px 10px',
              fontSize: 13,
              color: '#444',
              textAlign: 'left',
              fontStyle: 'normal',
              boxSizing: 'border-box',
            }}
          >
            <MarkdownRenderer content={reasoning} />
          </blockquote>
        </div>
      )}
    </div>
  );
};

export default Reasoning;
