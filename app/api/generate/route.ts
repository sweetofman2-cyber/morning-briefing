import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase (서비스 롤)
// ---------------------------------------------------------------------------
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

// ---------------------------------------------------------------------------
// RSS 피드
// ---------------------------------------------------------------------------
const RSS_FEEDS = [
  { url: 'https://www.yna.co.kr/rss/economy.xml',           source: '연합뉴스' },
  { url: 'https://rss.hankyung.com/economy.xml',             source: '한국경제' },
  { url: 'https://www.mk.co.kr/rss/40300001/',               source: '매일경제' },
  { url: 'https://rss.edaily.co.kr/rss/section/economy.xml', source: '이데일리' },
  { url: 'https://feeds.reuters.com/reuters/businessNews',   source: 'Reuters' },
];

const ECO_KEYWORDS = [
  '금리', '주가', '코스피', '코스닥', '나스닥', 'S&P', '환율', '달러', '원화',
  '인플레이션', '물가', 'GDP', '성장률', '기준금리', '연준', 'Fed', '한국은행',
  '증시', '주식', '채권', '원자재', '유가', '금값', '부동산', '수출', '무역',
  '실업', '고용', '경기', '반도체', '수익', '실적', '흑자', '적자',
  'economy', 'market', 'stock', 'rate', 'inflation', 'gdp', 'trade', 'dollar',
];

const BULLISH_KW = [
  '상승', '급등', '호조', '강세', '회복', '성장', '증가', '개선', '흑자',
  '상향', '최고', '확장', '반등', 'rally', 'surge', 'gain', 'rise', 'growth', 'high',
];
const BEARISH_KW = [
  '하락', '급락', '부진', '약세', '침체', '위기', '감소', '악화', '적자',
  '하향', '최저', '우려', '불안', 'fall', 'drop', 'decline', 'loss', 'recession', 'risk',
];

type Sentiment = 'bullish' | 'bearish' | 'neutral';

interface Quote { investor_name: string; quote: string; context: string; }

const QUOTE_POOL: Record<Sentiment, Quote[]> = {
  bullish: [
    { investor_name: '워런 버핏', quote: '공포가 지배할 때 욕심을 내고, 욕심이 지배할 때 두려워하라.', context: '시장 강세장에서 과열을 경계하고 신중한 판단을 유지해야 할 시점입니다.' },
    { investor_name: '피터 린치', quote: '주식시장은 단기적으로 인기투표이지만, 장기적으로는 체중계다.', context: '상승장에서도 기업의 실질 가치를 냉철하게 평가하는 것이 중요합니다.' },
    { investor_name: '레이 달리오', quote: '분산투자는 유일한 공짜 점심이다.', context: '강세 국면에서도 포트폴리오 분산으로 리스크를 관리하는 것이 현명합니다.' },
  ],
  bearish: [
    { investor_name: '워런 버핏', quote: '남들이 탐욕스러울 때 두려워하고, 남들이 두려워할 때 탐욕스러워져라.', context: '시장 하락 국면은 우량 자산을 저가에 매수할 수 있는 기회이기도 합니다.' },
    { investor_name: '벤저민 그레이엄', quote: '안전마진은 투자의 핵심 개념이다. 충분히 싼 가격에 사면 실수할 여지가 줄어든다.', context: '하락장에서 내재가치 대비 충분한 할인이 발생한 종목을 탐색해볼 시점입니다.' },
    { investor_name: '조지 소로스', quote: '시장은 항상 틀릴 준비가 되어 있다. 중요한 것은 그것을 인식하고 이용하는 것이다.', context: '시장의 비합리적 하락은 역발상 투자자에게 기회를 제공할 수 있습니다.' },
  ],
  neutral: [
    { investor_name: '워런 버핏', quote: '주식을 10년 보유할 생각이 없다면, 10분도 보유하지 마라.', context: '불확실한 시장에서는 장기적 관점의 투자 원칙이 더욱 빛을 발합니다.' },
    { investor_name: '피터 린치', quote: '자신이 무엇을 소유하고 있는지, 그리고 왜 소유하는지 알아야 한다.', context: '중립적 시장 환경에서는 보유 자산의 펀더멘털을 재점검할 좋은 기회입니다.' },
    { investor_name: '레이 달리오', quote: '원칙적인 접근 없이는 좋은 성과를 지속하기 어렵다.', context: '방향성이 불명확한 시장일수록 명확한 투자 원칙을 지키는 것이 중요합니다.' },
  ],
};

// ---------------------------------------------------------------------------
// 핵심 로직 (scripts/generate-briefing.ts 와 동일)
// ---------------------------------------------------------------------------
const xmlParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

async function fetchRss(url: string, source: string) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EcoBriefing/1.0)' } });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = xmlParser.parse(xml);
    const items: unknown[] = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? [];
    if (!Array.isArray(items)) return [];
    return items.slice(0, 8).map((item: unknown) => {
      const i = item as Record<string, unknown>;
      return {
        title: String(i.title ?? '').replace(/<[^>]+>/g, '').trim(),
        description: String(i.description ?? i.summary ?? '').replace(/<[^>]+>/g, '').trim(),
        link: String(i.link ?? ''),
        pubDate: String(i.pubDate ?? i.published ?? ''),
        source,
      };
    }).filter((i) => i.title && i.link);
  } catch { return []; }
}

function isEconomicNews(item: { title: string; description: string }) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  return ECO_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

function analyzeSentiment(items: { title: string; description: string }[]): Sentiment {
  let b = 0, r = 0;
  for (const item of items) {
    const text = `${item.title} ${item.description}`.toLowerCase();
    b += BULLISH_KW.filter((kw) => text.includes(kw.toLowerCase())).length;
    r += BEARISH_KW.filter((kw) => text.includes(kw.toLowerCase())).length;
  }
  if (b > r * 1.3) return 'bullish';
  if (r > b * 1.3) return 'bearish';
  return 'neutral';
}

function pickQuotes(sentiment: Sentiment): Quote[] {
  return [...QUOTE_POOL[sentiment]].sort(() => Math.random() - 0.5).slice(0, 2);
}

// ---------------------------------------------------------------------------
// API Route
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  // Vercel Cron 보안: Authorization 헤더 확인
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    // 1. RSS 수집
    const feedResults = await Promise.all(RSS_FEEDS.map((f) => fetchRss(f.url, f.source)));
    const allItems = feedResults.flat();
    const ecoItems = allItems.filter(isEconomicNews);

    if (ecoItems.length === 0) {
      return NextResponse.json({ error: 'No economic news found' }, { status: 500 });
    }

    // 중복 제거
    const seen = new Set<string>();
    const unique = ecoItems.filter((item) => {
      const key = item.title.slice(0, 20);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 7);

    // 2. 분석
    const sentiment = analyzeSentiment(unique);
    const sentimentLabel = sentiment === 'bullish' ? '강세' : sentiment === 'bearish' ? '약세' : '혼조';
    const mainTitle = unique[0]?.title ?? '오늘의 경제 브리핑';
    const title = (mainTitle.length > 28 ? mainTitle.slice(0, 28) + '…' : mainTitle) +
      (sentiment === 'bullish' ? ' 강세' : sentiment === 'bearish' ? ' 약세' : '');

    const headlines = unique.slice(0, 4).map((i) => i.title).join(', ');
    const summary = `오늘 국내외 경제 시장은 전반적으로 ${sentimentLabel} 흐름을 보였습니다. 주요 이슈로는 ${headlines} 등이 부각되었습니다. 글로벌 금리 환경과 주요 경제지표 발표에 따라 시장 변동성이 지속되고 있으며, 투자자들은 각국 중앙은행의 통화정책 방향에 주목하고 있습니다.`;

    const investmentDirections: Record<Sentiment, string> = {
      bullish: '현재 시장은 상승 모멘텀이 우세합니다. 다만 고점 매수 리스크에 유의하며, 펀더멘털이 탄탄한 종목 중심의 선별적 접근을 권장합니다.',
      bearish: '시장 하방 압력이 증가하는 구간입니다. 현금 비중을 높이고 방어적 자산을 늘리는 전략이 유효합니다. 낙폭 과대 우량주 중심의 분할 매수 기회를 탐색하세요.',
      neutral: '방향성이 불명확한 시장입니다. 성급한 베팅보다는 분산투자와 리스크 관리에 집중하고, 주요 경제지표 발표 이후 추세를 확인하세요.',
    };

    const quotes = pickQuotes(sentiment);
    const today = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().split('T')[0];
    const supabase = getServiceClient();

    // 3. Supabase 저장
    const { data: briefing, error: briefingError } = await supabase
      .from('daily_briefings')
      .upsert(
        { date: today, title, summary, investment_direction: investmentDirections[sentiment], market_sentiment: sentiment },
        { onConflict: 'date' },
      )
      .select('id')
      .single();

    if (briefingError || !briefing) throw new Error(briefingError?.message);

    const briefingId: string = briefing.id;
    await supabase.from('news_articles').delete().eq('briefing_id', briefingId);
    await supabase.from('investor_quotes').delete().eq('briefing_id', briefingId);

    await supabase.from('news_articles').insert(
      unique.map((n) => ({
        briefing_id: briefingId,
        title: n.title,
        summary: n.description?.slice(0, 200) || n.title,
        url: n.link,
        source: n.source,
        published_at: n.pubDate ? new Date(n.pubDate).toISOString() : null,
      })),
    );

    await supabase.from('investor_quotes').insert(
      quotes.map((q) => ({ briefing_id: briefingId, ...q })),
    );

    return NextResponse.json({ ok: true, date: today, sentiment, newsCount: unique.length });
  } catch (err) {
    console.error('[generate]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Vercel Cron은 GET으로 호출
export async function GET(req: Request) {
  return POST(req);
}
