'use client';

/**
 * Demo page - shows the widget in action.
 * The widget is loaded via the embed script.
 */

import { useEffect, useState } from 'react';

export default function DemoPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      (window as { __AI_WIDGET_API_URL__?: string }).__AI_WIDGET_API_URL__ =
        window.location.origin + '/api';

      const root = document.getElementById('ai-engagement-widget-root');
      if (!root) {
        const div = document.createElement('div');
        div.id = 'ai-engagement-widget-root';
        document.body.appendChild(div);
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/widget-bundle.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = '/widget-bundle.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        AI Engagement Widget
      </h1>
      <p className="text-gray-600 mb-6">
        This is the demo page. The chat bubble should appear in the bottom-right
        corner. Click it to open the widget and try asking a question.
      </p>
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Embed snippet</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add this to any website to embed the widget:
        </p>
        <pre className="text-xs bg-gray-800 text-gray-100 p-4 rounded overflow-x-auto">
          {`<script
  src="https://your-domain.vercel.app/widget.js"
  data-api-url="https://your-domain.vercel.app/api"
  async
></script>`}
        </pre>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Make sure to run <code className="bg-gray-100 px-1 rounded">npm run build:widget</code> before
        deploying to generate the widget bundle.
      </p>
    </main>
  );
}
