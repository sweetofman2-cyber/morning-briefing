import { supabase } from '@/lib/supabase';
import type { DailyBriefing, NewsArticle, InvestorQuote } from '@/lib/types';
import SearchBar from '@/components/SearchBar';
import SearchResults from '@/components/SearchResults';

export const dynamic = 'force-dynamic';

interface SearchResult {
  briefings: DailyBriefing[];
  articles: (NewsArticle & { briefing_date: string; briefing_title: string })[];
  quotes: (InvestorQuote & { briefing_date: string })[];
}

async function search(query: string): Promise<SearchResult> {
  if (!query.trim()) return { briefings: [], articles: [], quotes: [] };

  const [briefingsRes, articlesRes, quotesRes] = await Promise.all([
    supabase
      .from('daily_briefings')
      .select('id, date, title, summary, market_sentiment, investment_direction, created_at')
      .or(`title.ilike.%${query}%,summary.ilike.%${query}%,investment_direction.ilike.%${query}%`)
      .order('date', { ascending: false })
      .limit(10),

    supabase
      .from('news_articles')
      .select(`
        *,
        daily_briefings!inner(date, title)
      `)
      .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10),

    supabase
      .from('investor_quotes')
      .select(`
        *,
        daily_briefings!inner(date)
      `)
      .or(`investor_name.ilike.%${query}%,quote.ilike.%${query}%,context.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const articles = (articlesRes.data ?? []).map((a) => ({
    ...a,
    briefing_date: a.daily_briefings?.date ?? '',
    briefing_title: a.daily_briefings?.title ?? '',
  }));

  const quotes = (quotesRes.data ?? []).map((q) => ({
    ...q,
    briefing_date: q.daily_briefings?.date ?? '',
  }));

  return {
    briefings: (briefingsRes.data ?? []) as DailyBriefing[],
    articles,
    quotes,
  };
}

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = await search(query);

  const totalCount =
    results.briefings.length + results.articles.length + results.quotes.length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">검색</h1>
        <p className="mt-2 text-slate-400">
          브리핑 제목·내용, 뉴스 기사, 투자 대가 이름으로 검색합니다.
        </p>
      </div>

      <SearchBar initialQuery={query} />

      {query && (
        <div className="mt-8">
          <p className="mb-6 text-sm text-slate-400">
            <span className="font-semibold text-slate-200">&ldquo;{query}&rdquo;</span> 검색 결과{' '}
            {totalCount > 0 ? `— 총 ${totalCount}건` : '— 결과 없음'}
          </p>
          <SearchResults results={results} query={query} />
        </div>
      )}
    </div>
  );
}
