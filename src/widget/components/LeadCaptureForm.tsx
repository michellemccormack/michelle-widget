/**
 * Email/zip lead capture form.
 */

import { useState, FormEvent } from 'react';

interface LeadCaptureFormProps {
  onSubmit: (
    email: string,
    zip?: string,
    name?: string,
    sourceCategory?: string,
    sourceQuestionId?: string
  ) => Promise<boolean>;
  onClose: () => void;
  sourceCategory?: string;
  sourceQuestionId?: string;
  ctaLabel?: string;
}

export default function LeadCaptureForm({
  onSubmit,
  onClose,
  sourceCategory,
  sourceQuestionId,
  ctaLabel,
}: LeadCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [zip, setZip] = useState('');
  const [name, setName] = useState('');
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
    const success = await onSubmit(
      email.trim(),
      zip.trim() || undefined,
      name.trim() || undefined,
      sourceCategory,
      sourceQuestionId
    );
    setLoading(false);

    if (!success) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="ai-widget-lead-form">
      <div className="ai-widget-lead-header">
        <h3>Get in touch</h3>
        <button type="button" onClick={onClose} className="ai-widget-lead-close" aria-label="Close">
          ×
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="ai-widget-email">Email *</label>
        <input
          id="ai-widget-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={loading}
          className="ai-widget-lead-input"
        />
        <label htmlFor="ai-widget-zip">Zip code (optional)</label>
        <input
          id="ai-widget-zip"
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
          placeholder="12345"
          maxLength={5}
          disabled={loading}
          className="ai-widget-lead-input"
        />
        <label htmlFor="ai-widget-name">Name (optional)</label>
        <input
          id="ai-widget-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          disabled={loading}
          className="ai-widget-lead-input"
        />
        {error && <p className="ai-widget-lead-error">{error}</p>}
        <button type="submit" disabled={loading} className="ai-widget-lead-submit">
          {loading ? 'Submitting...' : ctaLabel || 'Submit'}
        </button>
      </form>
    </div>
  );
}
