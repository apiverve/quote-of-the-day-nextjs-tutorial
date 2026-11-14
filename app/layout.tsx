import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, Manrope } from 'next/font/google';
import './globals.css';

const serif = DM_Serif_Display({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], variable: '--font-serif' });
const sans = Manrope({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Quote of the Day | APIVerve Template',
  description: 'A new quote every day, more on demand, and a collection of the ones you love. An APIVerve template.'
};

export const viewport: Viewport = {
  themeColor: '#1b1530'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
