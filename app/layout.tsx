import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Canny Carrot Admin',
  description: 'Admin console for Canny Carrot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
