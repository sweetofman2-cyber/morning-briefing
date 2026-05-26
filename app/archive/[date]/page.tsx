import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { DailyBriefing } from '@/lib/types';
import SentimentBadge from '@/components/SentimentBadge';
import NewsCard from '@/components/NewsCard';
import QuoteCard from '@/components/QuoteCard';

export const dynamic = 'force-dynamic';

async function getBriefingByDate(date: string): Promise<DailyBriefing | null> {
  const { data, error } = await supabase
    .from('daily_briefings')
    .select(`*, news_articles (*), investor_quotes (*)`)
    .eq('date', date)
    .single();

  if (error || !data) return null;
  return data as DailyBriefing;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

interface Props {
  params: Promise<{ date: string }>;
}

export default async function ArchiveDetailPage({ params }: Props) {
  const { date } = await params;
  const briefing = await getBriefingByDate(date);

  if (!briefing) notFound();

  const news = briefing.news_articles ?? [];
  const quotes = briefing.investor_quotes ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Link
          href="/archive"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← 아카이브 목록
        </Link>
      </div>

      <div className="mb-10">
        <p className="text-sm font-medium text-slate-500">{formatDate(briefing.date)}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-100 sm:text-4xl">
          {briefing.title}
        </h1>
        <div className="mt-3">
          <SentimentBadge sentiment={briefing.market_sentiment} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              시장 요약
            </h2>
            <p className="text-base leading-relaxed text-slate-300">{briefing.summary}</p>
          </section>

          <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">
              투자 방향
            </h2>
            <p className="text-base leading-relaxed text-slate-200">
              {briefing.investment_direction}
            </p>
          </section>

          {quotes.length > 0 && (
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
                투자 대가의 한마디
              </h2>
              <div className="space-y-4">
                {quotes.map((q) => (
                  <QuoteCard key={q.id} quote={q} />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
            주요 뉴스 {news.length > 0 && `(${news.length}건)`}
          </h2>
          <div className="space-y-3">
            {news.map((article, i) => (
              <NewsCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
