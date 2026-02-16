/**
 * Widget state management.
 * Handles messages, chat API calls, logging, lead capture.
 */

import { useState, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import type { Message } from '../types';

function getApiUrl(): string {
  if (typeof window === 'undefined') return '';
  const globalUrl = (window as { __AI_WIDGET_API_URL__?: string }).__AI_WIDGET_API_URL__;
  if (globalUrl) return globalUrl.replace(/\/$/, '');
  return window.location.origin + '/api';
}

export function useWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId] = useState(() => nanoid());
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormCta, setLeadFormCta] = useState<Message['cta']>();
  const sessionStartRef = useRef(Date.now());

  const apiUrl = getApiUrl();

  const logEvent = useCallback(
    async (eventName: string, payload: Record<string, unknown> = {}) => {
      try {
        await fetch(`${apiUrl}/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_name: eventName,
            session_id: sessionId,
            payload,
          }),
        });
      } catch {
        // ignore
      }
    },
    [apiUrl, sessionId]
  );

  const askQuestion = useCallback(
    async (message: string, category?: string) => {
      const userMsg: Message = {
        id: nanoid(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);

      const loadingMsg: Message = {
        id: nanoid(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true,
      };
      setMessages((prev) => [...prev, loadingMsg]);

      logEvent('question_asked', { message, category }).catch(() => {});

      try {
        const res = await fetch(`${apiUrl}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            session_id: sessionId,
            context: category ? { previous_category: category } : undefined,
          }),
        });

        const data = await res.json();

        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingMsg.id
              ? {
                  ...m,
                  content: data.answer || 'Something went wrong. Please try again.',
                  cta: data.cta
                    ? {
                        ...data.cta,
                        source_question_id: data.faq_id,
                        source_category: data.category,
                      }
                    : undefined,
                  isLoading: false,
                }
              : m
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingMsg.id
              ? {
                  ...m,
                  content: 'Something went wrong. Please try again.',
                  isLoading: false,
                }
              : m
          )
        );
      }
    },
    [apiUrl, sessionId, logEvent]
  );

  const submitLead = useCallback(
    async (email: string, zip?: string, name?: string, sourceCategory?: string, sourceQuestionId?: string) => {
      try {
        const res = await fetch(`${apiUrl}/lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            zip: zip || undefined,
            name: name || undefined,
            session_id: sessionId,
            source_category: sourceCategory,
            source_question_id: sourceQuestionId,
          }),
        });

        if (!res.ok) throw new Error('Failed to submit');
        setHasSubmittedLead(true);
        setShowLeadForm(false);
        return true;
      } catch {
        return false;
      }
    },
    [apiUrl, sessionId]
  );

  const openLeadForm = useCallback((cta?: Message['cta']) => {
    setLeadFormCta(cta);
    setShowLeadForm(true);
  }, []);

  const closeLeadForm = useCallback(() => {
    setShowLeadForm(false);
    setLeadFormCta(undefined);
  }, []);

  const getSessionDuration = useCallback(() => {
    return Math.floor((Date.now() - sessionStartRef.current) / 1000);
  }, []);

  const getQuestionsAskedCount = useCallback(() => {
    return messages.filter((m) => m.role === 'user').length;
  }, [messages]);

  return {
    messages,
    sessionId,
    hasSubmittedLead,
    showLeadForm,
    leadFormCta,
    askQuestion,
    submitLead,
    openLeadForm,
    closeLeadForm,
    logEvent,
    getSessionDuration,
    getQuestionsAskedCount,
  };
}
