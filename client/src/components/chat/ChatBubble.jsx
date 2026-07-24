import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RotateCcw, User, Sprout } from 'lucide-react';

export default function ChatBubble({ role, content, onCopy, onRegenerate, isLast }) {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';

  const handleCopy = () => {
    navigator.clipboard?.writeText(content).then(() => {
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        gap: 12,
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        marginBottom: 18,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isUser
            ? 'var(--surface)'
            : 'linear-gradient(135deg, var(--primary), var(--secondary))',
          border: isUser ? '1px solid var(--border)' : 'none',
          color: isUser ? 'var(--text)' : '#fff',
        }}
      >
        {isUser ? <User size={15} /> : <Sprout size={15} />}
      </div>

      <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          className={isUser ? '' : 'markdown-body'}
          style={{
            background: isUser
              ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
              : 'var(--card)',
            color: isUser ? '#fff' : 'var(--text)',
            padding: '12px 16px',
            borderRadius: isUser
              ? 'var(--radius-md) var(--radius-md) 4px var(--radius-md)'
              : 'var(--radius-md) var(--radius-md) var(--radius-md) 4px',
            border: isUser ? 'none' : '1px solid var(--border)',
            fontSize: 14.5,
          }}
        >
          {isUser ? content : <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>}
        </div>

        {!isUser && content && (
          <div style={{ display: 'flex', gap: 6, paddingLeft: 4 }}>
            <button
              aria-label="Copy message"
              onClick={handleCopy}
              style={iconBtnStyle}
              title="Copy"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            {isLast && onRegenerate && (
              <button
                aria-label="Regenerate response"
                onClick={onRegenerate}
                style={iconBtnStyle}
                title="Regenerate"
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

const iconBtnStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  width: 26,
  height: 26,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--muted)',
};
