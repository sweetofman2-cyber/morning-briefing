import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: '경제 브리핑 | 오늘의 시장 분석',
  description: 'AI가 분석한 오늘의 주요 경제 뉴스와 투자 방향',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0f1e] text-slate-200 antialiased">
        <NavBar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
          <p>© 2025 경제 브리핑 &middot; Powered by Claude AI</p>
        </footer>
      </body>
    </html>
  );
}
