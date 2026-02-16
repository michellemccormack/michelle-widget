/**
 * Main chat panel: welcome message, quick buttons, messages, input.
 */

import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import QuickButtons from './QuickButtons';
import MessageList from './MessageList';
import InputBar from './InputBar';
import LeadCaptureForm from './LeadCaptureForm';
import type { Message, WidgetConfig } from '../types';

interface ChatPanelProps {
  config: WidgetConfig;
  messages: Message[];
  showLeadForm: boolean;
  leadFormCta?: Message['cta'];
  onAskQuestion: (message: string, category?: string) => void;
  onQuickButtonClick?: (category: string, label: string) => void;
  onCtaClick: (cta: Message['cta']) => void;
  onSubmitLead: (
    email: string,
    zip?: string,
    name?: string,
    sourceCategory?: string,
    sourceQuestionId?: string
  ) => Promise<boolean>;
  onCloseLeadForm: () => void;
}

export default function ChatPanel({
  config,
  messages,
  showLeadForm,
  leadFormCta,
  onAskQuestion,
  onQuickButtonClick,
  onCtaClick,
  onSubmitLead,
  onCloseLeadForm,
}: ChatPanelProps) {
  const primaryColor = config.theme?.primary_color || '#2563eb';

  if (showLeadForm) {
    return (
      <LeadCaptureForm
        onSubmit={onSubmitLead}
        onClose={onCloseLeadForm}
        sourceCategory={leadFormCta?.source_category}
        sourceQuestionId={leadFormCta?.source_question_id}
        ctaLabel={leadFormCta?.label}
      />
    );
  }

  const hasMessages = messages.length > 0;
  const welcomeMessage = config.welcome_message;
  const quickButtons = config.quick_buttons;

  return (
    <div className="ai-widget-panel">
      <div className="ai-widget-header">
        <h2>{config.brand_name}</h2>
        <span className="ai-widget-badge">Automated assistant</span>
      </div>

      <div className="ai-widget-body">
        {!hasMessages ? (
          <>
            <div className="ai-widget-welcome">
              <p>{welcomeMessage}</p>
            </div>
            <QuickButtons
              buttons={quickButtons}
              onSelect={(category, label) => {
                onQuickButtonClick?.(category, label);
                onAskQuestion(label, category);
              }}
            />
          </>
        ) : (
          <MessageList
            messages={messages}
            onCtaClick={onCtaClick}
            primaryColor={primaryColor}
          />
        )}
      </div>

      <div className="ai-widget-footer">
        <InputBar onSend={(msg) => onAskQuestion(msg)} placeholder="Type your question..." />
      </div>
    </div>
  );
}
