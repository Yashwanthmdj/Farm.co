import React from 'react';
import { motion } from 'framer-motion';

const DEFAULT_PROMPTS = [
  'What crops grow best in sandy soil?',
  'How can I improve my soil pH naturally?',
  'What is the ideal irrigation schedule for wheat?',
  'How do I protect tomatoes from common pests?',
];

export default function SuggestedPrompts({ prompts = DEFAULT_PROMPTS, onSelect }) {
  return (
    <div
      className="page-grid"
      style={{ gap: 10, marginTop: 10 }}
    >
      {prompts.map((prompt, i) => (
        <motion.button
          key={prompt}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          whileHover={{ y: -2, borderColor: 'var(--primary)' }}
          onClick={() => onSelect(prompt)}
          style={{
            textAlign: 'left',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: 13.5,
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          {prompt}
        </motion.button>
      ))}
    </div>
  );
}
