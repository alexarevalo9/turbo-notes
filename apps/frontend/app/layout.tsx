import type { Metadata } from 'next';
import { Geist, Geist_Mono, Inria_Serif } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const inriaSerif = Inria_Serif({
  variable: '--font-inria-serif',
  subsets: ['latin'],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Turbo Notes',
  description: 'Keep your notes organized in an aesthetic way',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inriaSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
