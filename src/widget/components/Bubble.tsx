import React, { useState } from 'react';

const AVATAR_PATH = '/michelle-avatar.png';

function getAvatarUrl(): string {
  if (typeof window === 'undefined') return AVATAR_PATH;
  const apiUrl = (window as { __AI_WIDGET_API_URL__?: string }).__AI_WIDGET_API_URL__ || '';
  const assetBase = apiUrl ? apiUrl.replace(/\/api\/?$/, '').replace(/\/$/, '') : '';
  return assetBase ? `${assetBase}${AVATAR_PATH}` : AVATAR_PATH;
}

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width={28} height={28}>
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
  </svg>
);

interface BubbleProps {
  onClick: () => void;
  isOpen: boolean;
  primaryColor?: string;
}

export default function Bubble({ onClick, isOpen, primaryColor = '#DC143C' }: BubbleProps) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = getAvatarUrl();

  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
      className="ai-widget-bubble"
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      {isOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" width={24} height={24}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : imgError ? (
        <ChatIcon />
      ) : (
        <img
          src={avatarUrl}
          alt="Chat"
          className="ai-widget-bubble-photo"
          onError={() => setImgError(true)}
        />
      )}
    </button>
  );
}
