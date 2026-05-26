import Link from 'next/link';
import type { DailyBriefing, NewsArticle, InvestorQuote } from '@/lib/types';
import SentimentBadge from '@/components/SentimentBadge';

interface SearchResultsProps {
  results: {
    briefings: DailyBriefing[];
    articles: (NewsArticle & { briefing_date: string; briefing_title: string })[];
    quotes: (InvestorQuote & { briefing_date: string })[];
  };
  query: string;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-400/20 text-yellow-300 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function SearchResults({ results, query }: SearchResultsProps) {
  const { briefings, articles, quotes } = results;

  if (briefings.length === 0 && articles.length === 0 && quotes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 py-16 text-center">
        <p className="text-slate-400">검색 결과가 없습니다.</p>
        <p className="mt-1 text-sm text-slate-600">다른 키워드로 검색해 보세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {briefings.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            브리핑 ({briefings.length})
          </h2>
          <div className="space-y-2">
            {briefings.map((b) => (
              <Link
                key={b.id}
                href={`/archive/${b.date}`}
                className="group block rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:border-blue-500/40 hover:bg-slate-800/60"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    {new Date(b.date).toLocaleDateString('ko-KR')}
                  </span>
                  <SentimentBadge sentiment={b.market_sentiment} />
                </div>
                <h3 className="font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">
                  <Highlight text={b.title} query={query} />
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  <Highlight text={b.summary} query={query} />
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            뉴스 기사 ({articles.length})
          </h2>
          <div className="space-y-2">
            {articles.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                    {a.source}
                  </span>
                  <Link
                    href={`/archive/${a.briefing_date}`}
                    className="text-xs text-blue-400 hover:underline"
                  >
                    {new Date(a.briefing_date).toLocaleDateString('ko-KR')} 브리핑
                  </Link>
                </div>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-200 hover:text-blue-300 transition-colors"
                >
                  <Highlight text={a.title} query={query} />
                </a>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  <Highlight text={a.summary} query={query} />
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {quotes.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            투자 대가 명언 ({quotes.length})
          </h2>
          <div className="space-y-2">
            {quotes.map((q) => (
              <Link
                key={q.id}
                href={`/archive/${q.briefing_date}`}
                className="group block rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:border-blue-500/40 hover:bg-slate-800/60"
              >
                <div className="mb-1">
                  <span className="text-xs font-semibold text-amber-400">
                    <Highlight text={q.investor_name} query={query} />
                  </span>
                  <span className="ml-2 text-xs text-slate-600">
                    {new Date(q.briefing_date).toLocaleDateString('ko-KR')} 브리핑
                  </span>
                </div>
                <blockquote className="text-slate-300">
                  &ldquo;<Highlight text={q.quote} query={query} />&rdquo;
                </blockquote>
                {q.context && (
                  <p className="mt-1 text-sm text-slate-500 italic">
                    <Highlight text={q.context} query={query} />
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
