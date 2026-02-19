/**
 * Widget-specific types.
 * Re-exports and extends shared types.
 */

export interface MessageCta {
  label: string;
  url?: string;
  action?: 'lead_capture' | 'external_link';
  source_question_id?: string;
  source_category?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  /** Single CTA (legacy). Use ctas when multiple. */
  cta?: MessageCta;
  /** Multiple CTAs. When present, overrides cta. */
  ctas?: MessageCta[];
  longAnswer?: string;
  isLoading?: boolean;
}

export interface WidgetConfig {
  brand_name: string;
  welcome_message: string;
  quick_buttons: Array<{ label: string; category: string }>;
  theme?: {
    primary_color?: string;
    font_family?: string;
  };
  fallback_message: string;
  contact_cta_label: string;
  contact_cta_url?: string;
  require_email_to_chat?: boolean;
}

export interface WidgetState {
  isOpen: boolean;
  messages: Message[];
  sessionId: string;
  hasSubmittedLead: boolean;
  showLeadForm: boolean;
  leadFormCta?: Message['cta'];
}
