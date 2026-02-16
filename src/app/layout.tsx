import type { Metadata } from 'next';
import './globals.css';
import WidgetWrapper from './WidgetWrapper';

export const metadata: Metadata = {
  title: 'AI Engagement Widget',
  description: 'Embeddable AI-powered engagement and segmentation widget',
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
