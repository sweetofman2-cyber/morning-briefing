import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { DailyBriefing } from '@/lib/types';
import SentimentBadge from '@/components/SentimentBadge';
import EmptyState from '@/components/EmptyState';

export const dynamic = 'force-dynamic';

async function getAllBriefings(): Promise<DailyBriefing[]> {
  const { data, error } = await supabase
    .from('daily_briefings')
    .select('id, date, title, summary, market_sentiment, investment_direction, created_at')
    .order('date', { ascending: false })
    .limit(60);

  if (error || !data) return [];
  return data as DailyBriefing[];
}

function groupByMonth(briefings: DailyBriefing[]) {
  const groups: Record<string, DailyBriefing[]> = {};
  for (const b of briefings) {
    const key = b.date.slice(0, 7); // YYYY-MM
    if (!groups[key]) groups[key] = [];
    groups[key].push(b);
  }
  return groups;
}

function formatMonthLabel(yyyyMM: string) {
  const [y, m] = yyyyMM.split('-');
  return `${y}년 ${parseInt(m)}월`;
}

function formatDayLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export default async function ArchivePage() {
  const briefings = await getAllBriefings();
  const groups = groupByMonth(briefings);
  const months = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-100">브리핑 아카이브</h1>
        <p className="mt-2 text-slate-400">
          날짜별 과거 경제 브리핑 목록입니다.
        </p>
      </div>

      {briefings.length === 0 ? (
        <EmptyState
          title="저장된 브리핑이 없습니다"
          description="아직 생성된 브리핑이 없습니다. npm run generate를 실행해 보세요."
        />
      ) : (
        <div className="space-y-10">
          {months.map((month) => (
            <section key={month}>
              <h2 className="mb-4 flex items-center gap-3 text-sm font-semibold text-slate-400">
                <span>{formatMonthLabel(month)}</span>
                <span className="h-px flex-1 bg-slate-800" />
                <span className="text-slate-600">{groups[month].length}건</span>
              </h2>
              <div className="space-y-2">
                {groups[month].map((b) => (
                  <Link
                    key={b.id}
                    href={`/archive/${b.date}`}
                    className="group flex items-start gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:border-blue-500/40 hover:bg-slate-800/60"
                  >
                    <div className="w-28 shrink-0">
                      <p className="text-xs text-slate-500">{formatDayLabel(b.date)}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <SentimentBadge sentiment={b.market_sentiment} />
                      </div>
                      <h3 className="font-semibold text-slate-200 group-hover:text-blue-300 transition-colors line-clamp-1">
                        {b.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 line-clamp-2">{b.summary}</p>
                    </div>
                    <span className="shrink-0 text-slate-600 group-hover:text-blue-400 transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
