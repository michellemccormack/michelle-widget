/**
 * Chat bubble button in bottom-right corner.
 */

interface BubbleProps {
  onClick: () => void;
  isOpen: boolean;
  primaryColor?: string;
}

export default function Bubble({ onClick, isOpen, primaryColor = '#2563eb' }: BubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      className="ai-widget-bubble"
      style={
        {
          '--ai-primary': primaryColor,
        } as React.CSSProperties
      }
    >
      {isOpen ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
    </button>
  );
}
