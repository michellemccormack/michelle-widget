/**
 * Quick action buttons from FAQ categories.
 */

interface QuickButtonsProps {
  buttons: Array<{ label: string; category: string }>;
  onSelect: (category: string, label: string) => void;
  disabled?: boolean;
}

export default function QuickButtons({ buttons, onSelect, disabled }: QuickButtonsProps) {
  if (buttons.length === 0) return null;

  return (
    <div className="ai-widget-quick-buttons">
      {buttons.map((btn) => (
        <button
          key={`${btn.category}-${btn.label}`}
          type="button"
          onClick={() => onSelect(btn.category, btn.label)}
          disabled={disabled}
          className="ai-widget-quick-btn"
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
