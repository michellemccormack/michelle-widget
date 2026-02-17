/**
 * Email gate - collect email before allowing chat.
 * Shown when require_email_to_chat is enabled.
 */

import { useState, FormEvent } from 'react';

interface EmailGateProps {
  onSubmit: (email: string) => Promise<boolean>;
  brandName?: string;
}

export default function EmailGate({ onSubmit, brandName }: EmailGateProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    const success = await onSubmit(email.trim());
    setLoading(false);

    if (!success) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="ai-widget-lead-form">
      <div className="ai-widget-lead-header">
        <h3>Get started</h3>
      </div>
      <p className="ai-widget-email-gate-text">
        {brandName
          ? `Enter your email to chat with ${brandName}.`
          : 'Enter your email to continue.'}
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="ai-widget-email-gate">Email *</label>
        <input
          id="ai-widget-email-gate"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loading}
          className="ai-widget-lead-input"
        />
        {error && <p className="ai-widget-lead-error">{error}</p>}
        <button type="submit" disabled={loading} className="ai-widget-lead-submit">
          {loading ? 'Submitting...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
