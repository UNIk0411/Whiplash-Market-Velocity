import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WHIPLASH — Market Velocity & Anomaly Detective',
  description: 'Smart market awareness and change detective tracking market velocity, volatility shocks, and attention queues.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#090d16] text-slate-100">{children}</body>
    </html>
  );
}
