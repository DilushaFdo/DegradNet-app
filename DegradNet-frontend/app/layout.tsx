import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: 'DegradNet — AI Infrastructure Degradation Analysis',
  description: 'AI-powered structural health monitoring for detecting degradation in concrete, metal, and wood infrastructure',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={poppins.className}>{children}</body>
    </html>
  );
}
