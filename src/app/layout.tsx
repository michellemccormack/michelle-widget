import type { Metadata, Viewport } from 'next';
import './globals.css';
import WidgetWrapper from './WidgetWrapper';

export const metadata: Metadata = {
  title: 'AI Engagement Widget',
  description: 'Embeddable AI-powered engagement and segmentation widget',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <WidgetWrapper />
      </body>
    </html>
  );
}
