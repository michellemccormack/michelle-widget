/**
 * Message input for freeform questions.
 */

import { useState, useCallback, FormEvent } from 'react';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_LENGTH = 500;

export default function InputBar({
  onSend,
  disabled,
  placeholder = 'Type your question...',
}: InputBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = value.trim();
      if (!trimmed || disabled) return;
      onSend(trimmed);
      setValue('');
    },
    [value, disabled, onSend]
  );

  return (
    <form onSubmit={handleSubmit} className="ai-widget-input-bar">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, MAX_LENGTH))}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={MAX_LENGTH}
        className="ai-widget-input"
        aria-label="Your question"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="ai-widget-send-btn"
        aria-label="Send"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  );
}
