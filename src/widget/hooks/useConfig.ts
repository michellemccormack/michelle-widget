/**
 * Config loading + caching.
 * Fetches from API, caches in localStorage (2 min TTL).
 */

import { useState, useEffect, useCallback } from 'react';
import type { WidgetConfig } from '../types';

const CONFIG_CACHE_KEY = 'ai_widget_config';
const CACHE_TTL_MS = 2 * 60 * 1000;

function getApiUrl(): string {
  if (typeof window === 'undefined') return '';
  const globalUrl = (window as { __AI_WIDGET_API_URL__?: string }).__AI_WIDGET_API_URL__;
  if (globalUrl) return globalUrl.replace(/\/$/, '');
  return window.location.origin + '/api';
}

interface CachedConfig {
  config: WidgetConfig;
  cachedAt: number;
}

function getCachedConfig(): WidgetConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_CACHE_KEY);
    if (!raw) return null;
    const { config, cachedAt }: CachedConfig = JSON.parse(raw);
    if (Date.now() - cachedAt > CACHE_TTL_MS) return null;
    return config;
  } catch {
    return null;
  }
}

function setCachedConfig(config: WidgetConfig): void {
  try {
    localStorage.setItem(
      CONFIG_CACHE_KEY,
      JSON.stringify({ config, cachedAt: Date.now() })
    );
  } catch {
    // ignore
  }
}

export function useConfig() {
  const [config, setConfig] = useState<WidgetConfig | null>(getCachedConfig());
  const [loading, setLoading] = useState(!config);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    const cached = getCachedConfig();
    if (cached) {
      setConfig(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const apiUrl = getApiUrl();

    try {
      const res = await fetch(`${apiUrl}/config`);
      if (!res.ok) throw new Error('Failed to load config');
      const data = await res.json();
      const widgetConfig: WidgetConfig = {
        brand_name: data.brand_name || 'Support',
        welcome_message: data.welcome_message || 'Hi! How can I help you today?',
        quick_buttons: data.quick_buttons || [],
        theme: data.theme,
        fallback_message:
          data.fallback_message || "I'm not sure about that. Would you like to speak with someone?",
        contact_cta_label: data.contact_cta_label || 'Contact Us',
        contact_cta_url: data.contact_cta_url,
        require_email_to_chat: data.require_email_to_chat === true,
      };
      setCachedConfig(widgetConfig);
      setConfig(widgetConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setConfig({
        brand_name: 'Support',
        welcome_message: 'Hi! How can I help you today?',
        quick_buttons: [],
        fallback_message: "I'm not sure about that. Would you like to speak with someone?",
        contact_cta_label: 'Contact Us',
        require_email_to_chat: false,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, loading, error, refetch: fetchConfig };
}
