import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TikTok KOL 采集工具',
  description: '全品类 TikTok 红人建联助手',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
