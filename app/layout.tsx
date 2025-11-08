import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'MultiBagger Agent (India)',
  description: 'Shiksha uddeshya ke liye AI adharit multi-bagger shodh',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="hi">
      <body>
        {children}
      </body>
    </html>
  );
}
