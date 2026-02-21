/**
 * Main widget component - orchestrates bubble, panel, config, state.
 */

import { useState, useCallback, useEffect } from 'react';
import Bubble from './components/Bubble';
import ChatPanel from './components/ChatPanel';
import { useConfig } from './hooks/useConfig';
import { useWidget } from './hooks/useWidget';
import type { Message } from './types';

export default function Widget() {
  const { config, ready, error: configError } = useConfig();
  const {
    messages,
    showLeadForm,
    leadFormCta,
    askQuestion,
    submitLead,
    openLeadForm,
    closeLeadForm,
    logEvent,
  } = useWidget();

  if (!ready) return null;

  const handleQuickButton = useCallback(
    (category: string) => {
      logEvent('button_click', { category }).catch(() => {});
      askQuestion(`Tell me about ${category}`, category);
    },
    [askQuestion, logEvent]
  );

  const handleCtaClick = useCallback(
    (cta?: Message['cta']) => {
      if (!cta) return;
      if (cta.action === 'lead_capture') {
        openLeadForm(cta);
      } else if (cta.action === 'external_link' && cta.url) {
        window.open(cta.url, '_blank', 'noopener,noreferrer');
        logEvent('cta_clicked', { label: cta.label, url: cta.url }).catch(() => {});
      }
    },
    [openLeadForm, logEvent]
  );

  const [isOpen, setIsOpen] = useState(false);

  // Close panel when user clicks outside (on the main website)
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const panel = document.querySelector('.ai-widget-panel-wrapper');
      const bubble = document.querySelector('.ai-widget-bubble');
      if (panel?.contains(target) || bubble?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleOpen = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) {
      logEvent('widget_open').catch(() => {});
    }
  }, [isOpen, logEvent]);

  return (
    <div className="ai-widget-root">
      {isOpen && (
        <div className="ai-widget-panel-wrapper">
          <ChatPanel
            config={config}
            configError={configError}
            messages={messages}
            showLeadForm={showLeadForm}
            leadFormCta={leadFormCta}
            onAskQuestion={askQuestion}
            onQuickButtonClick={handleQuickButton}
            onCtaClick={handleCtaClick}
            onSubmitLead={submitLead}
            onCloseLeadForm={closeLeadForm}
          />
        </div>
      )}
      <Bubble
        onClick={toggleOpen}
        isOpen={isOpen}
        primaryColor={config.theme?.primary_color}
      />
    </div>
  );
}
