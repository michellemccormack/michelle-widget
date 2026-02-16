/**
 * Widget entry point.
 * Renders the widget into a container div.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import Widget from './Widget';
import './styles.css';

const CONTAINER_ID = 'ai-engagement-widget-root';

function init() {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    document.body.appendChild(container);
  }

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Widget />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
