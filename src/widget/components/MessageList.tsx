/**
 * Message display with CTA buttons.
 */

import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  onCtaClick: (cta: Message['cta']) => void;
  primaryColor?: string;
}

export default function MessageList({ messages, onCtaClick, primaryColor = '#2563eb' }: MessageListProps) {
  return (
    <div className="ai-widget-messages">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`ai-widget-msg ai-widget-msg--${msg.role}`}
        >
          {msg.isLoading ? (
            <div className="ai-widget-typing">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <>
              <p className="ai-widget-msg-content">{msg.content}</p>
              {msg.cta && !msg.isLoading && (
                <button
                  type="button"
                  className="ai-widget-cta"
                  onClick={() => onCtaClick(msg.cta)}
                  style={{ backgroundColor: primaryColor }}
                >
                  {msg.cta.label}
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
