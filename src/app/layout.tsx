import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Midnight Lofi · 밤의 작은 거실',
  description:
    '빈티지 TV, 낮은 조명, 좋아하는 음악. 당신의 속도로 쉬고 집중하는 밤의 작은 거실.',
  applicationName: 'Midnight Lofi',
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0804',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
