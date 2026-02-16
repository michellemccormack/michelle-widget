'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import '@/widget/styles.css';

const Widget = dynamic(() => import('@/widget/Widget'), { ssr: false });

export default function WidgetWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    (window as { __AI_WIDGET_API_URL__?: string }).__AI_WIDGET_API_URL__ =
      window.location.origin + '/api';
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(<Widget />, document.body);
}
