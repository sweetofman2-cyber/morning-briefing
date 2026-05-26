import { createClient } from '@supabase/supabase-js';
import { XMLParser } from 'fast-xml-parser';

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY 가 없습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ---------------------------------------------------------------------------
// RSS 피드 목록 (무료, API 키 불필요)
// ---------------------------------------------------------------------------
const RSS_FEEDS = [
  { url: 'https://www.yna.co.kr/rss/economy.xml',           source: '연합뉴스' },
  { url: 'https://rss.hankyung.com/economy.xml',             source: '한국경제' },
  { url: 'https://www.mk.co.kr/rss/40300001/',               source: '매일경제' },
  { url: 'https://rss.edaily.co.kr/rss/section/economy.xml', source: '이데일리' },
  { url: 'https://feeds.reuters.com/reuters/businessNews',   source: 'Reuters' },
];

// ---------------------------------------------------------------------------
// 시장 심리 판단 키워드
// ---------------------------------------------------------------------------
const BULLISH_KW = [
  '상승', '급등', '호조', '강세', '회복', '성장', '증가', '개선', '흑자',
  '상향', '최고', '확장', '반등', '돌파', 'rally', 'surge', 'gain', 'rise',
  'growth', 'record', 'high', 'boost',
];
const BEARISH_KW = [
  '하락', '급락', '부진', '약세', '침체', '위기', '감소', '악화', '적자',
  '하향', '최저', '우려', '불안', '충격', 'fall', 'drop', 'decline', 'crash',
  'loss', 'recession', 'risk', 'fear', 'concern', 'low',
];

// ---------------------------------------------------------------------------
// 투자 대가 명언 풀 (시장 심리별)
// ---------------------------------------------------------------------------
type Sentiment = 'bullish' | 'bearish' | 'neutral';

interface Quote {
  investor_name: string;
  quote: string;
  context: string;
}

const QUOTE_POOL: Record<Sentiment, Quote[]> = {
  bullish: [
    {
      investor_name: '워런 버핏',
      quote: '공포가 지배할 때 욕심을 내고, 욕심이 지배할 때 두려워하라.',
      context: '시장 강세장에서 과열을 경계하고 신중한 판단을 유지해야 할 시점입니다.',
    },
    {
      investor_name: '피터 린치',
      quote: '주식시장은 단기적으로 인기투표이지만, 장기적으로는 체중계다.',
      context: '상승장에서도 기업의 실질 가치를 냉철하게 평가하는 것이 중요합니다.',
    },
    {
      investor_name: '레이 달리오',
      quote: '분산투자는 유일한 공짜 점심이다.',
      context: '강세 국면에서도 포트폴리오 분산으로 리스크를 관리하는 것이 현명합니다.',
    },
    {
      investor_name: '피터 린치',
      quote: '내가 가장 좋아하는 종목은 내가 이미 보유한 종목이다.',
      context: '상승 모멘텀이 확인된 종목을 꾸준히 보유하는 전략이 유효한 국면입니다.',
    },
  ],
  bearish: [
    {
      investor_name: '워런 버핏',
      quote: '남들이 탐욕스러울 때 두려워하고, 남들이 두려워할 때 탐욕스러워져라.',
      context: '시장 하락 국면은 우량 자산을 저가에 매수할 수 있는 기회이기도 합니다.',
    },
    {
      investor_name: '벤저민 그레이엄',
      quote: '안전마진은 투자의 핵심 개념이다. 충분히 싼 가격에 사면 실수할 여지가 줄어든다.',
      context: '하락장에서 내재가치 대비 충분한 할인이 발생한 종목을 탐색해볼 시점입니다.',
    },
    {
      investor_name: '레이 달리오',
      quote: '경제는 단순한 기계다. 우리가 이해하지 못하는 것이 아니라, 우리가 원칙을 따르지 않기 때문에 어렵다.',
      context: '하락 국면에서 감정을 배제하고 원칙에 기반한 매매 규칙을 지키는 것이 중요합니다.',
    },
    {
      investor_name: '조지 소로스',
      quote: '시장은 항상 틀릴 준비가 되어 있다. 중요한 것은 그것을 인식하고 이용하는 것이다.',
      context: '시장의 비합리적 하락은 역발상 투자자에게 기회를 제공할 수 있습니다.',
    },
  ],
  neutral: [
    {
      investor_name: '워런 버핏',
      quote: '주식을 10년 보유할 생각이 없다면, 10분도 보유하지 마라.',
      context: '불확실한 시장에서는 장기적 관점의 투자 원칙이 더욱 빛을 발합니다.',
    },
    {
      investor_name: '피터 린치',
      quote: '자신이 무엇을 소유하고 있는지, 그리고 왜 소유하는지 알아야 한다.',
      context: '중립적 시장 환경에서는 보유 자산의 펀더멘털을 재점검할 좋은 기회입니다.',
    },
    {
      investor_name: '레이 달리오',
      quote: '원칙적인 접근 없이는 좋은 성과를 지속하기 어렵다.',
      context: '방향성이 불명확한 시장일수록 명확한 투자 원칙을 지키는 것이 중요합니다.',
    },
    {
      investor_name: '벤저민 그레이엄',
      quote: '투자는 철저한 분석을 통해 원금 보전과 적정 수익을 확보하는 것이다.',
      context: '변동성이 높은 시기에는 보수적 접근으로 자산을 지키는 것이 우선입니다.',
    },
  ],
};

// ---------------------------------------------------------------------------
// 타입
// ---------------------------------------------------------------------------
interface RssItem {
  title: string;
  description?: string;
  link: string;
  pubDate?: string;
  source: string;
}

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string | null;
}

// ---------------------------------------------------------------------------
// RSS 파싱
// ---------------------------------------------------------------------------
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

async function fetchRss(url: string, source: string): Promise<RssItem[]> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EcoBriefing/1.0)' },
    });
    if (!res.ok) return [];

    const xml = await res.text();
    const parsed = parser.parse(xml);
    const items: unknown[] = parsed?.rss?.channel?.item ?? parsed?.feed?.entry ?? [];
    if (!Array.isArray(items)) return [];

    return items.slice(0, 8).map((item: unknown) => {
      const i = item as Record<string, unknown>;
      return {
        title: String(i.title ?? '').replace(/<[^>]+>/g, '').trim(),
        description: String(i.description ?? i.summary ?? '').replace(/<[^>]+>/g, '').trim(),
        link: String(i.link ?? (typeof i.link === 'object' ? (i.link as Record<string, unknown>)?.['@_href'] : '') ?? ''),
        pubDate: String(i.pubDate ?? i.published ?? i.updated ?? ''),
        source,
      };
    }).filter((i) => i.title && i.link);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// 경제 관련 키워드 필터
// ---------------------------------------------------------------------------
const ECO_KEYWORDS = [
  '금리', '주가', '코스피', '코스닥', '나스닥', 'S&P', '환율', '달러', '원화',
  '인플레이션', '물가', 'GDP', '성장률', '기준금리', '연준', 'Fed', '한국은행',
  '증시', '주식', '채권', '원자재', '유가', '금값', '부동산', '수출', '무역',
  '실업', '고용', '경기', '불황', '호황', '반도체', '수익', '실적', '흑자', '적자',
  'economy', 'market', 'stock', 'rate', 'inflation', 'gdp', 'trade', 'dollar',
];

function isEconomicNews(item: RssItem): boolean {
  const text = `${item.title} ${item.description ?? ''}`.toLowerCase();
  return ECO_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
}

// ---------------------------------------------------------------------------
// 시장 심리 판단
// ---------------------------------------------------------------------------
function analyzeSentiment(items: RssItem[]): Sentiment {
  let bullish = 0;
  let bearish = 0;
  for (const item of items) {
    const text = `${item.title} ${item.description ?? ''}`.toLowerCase();
    bullish += BULLISH_KW.filter((kw) => text.includes(kw.toLowerCase())).length;
    bearish += BEARISH_KW.filter((kw) => text.includes(kw.toLowerCase())).length;
  }
  if (bullish > bearish * 1.3) return 'bullish';
  if (bearish > bullish * 1.3) return 'bearish';
  return 'neutral';
}

// ---------------------------------------------------------------------------
// 브리핑 제목·요약·투자방향 생성
// ---------------------------------------------------------------------------
function generateTitle(items: RssItem[], sentiment: Sentiment): string {
  const main = items[0]?.title ?? '오늘의 경제 브리핑';
  // 30자 이내로 자르기
  const trimmed = main.length > 30 ? main.slice(0, 28) + '…' : main;
  const suffix = sentiment === 'bullish' ? ' 강세' : sentiment === 'bearish' ? ' 약세' : '';
  return trimmed + suffix;
}

function generateSummary(items: RssItem[], sentiment: Sentiment): string {
  const sentimentLabel =
    sentiment === 'bullish' ? '강세' : sentiment === 'bearish' ? '약세' : '혼조';
  const headlines = items
    .slice(0, 4)
    .map((i) => i.title)
    .join(', ');

  return (
    `오늘 국내외 경제 시장은 전반적으로 ${sentimentLabel} 흐름을 보였습니다. ` +
    `주요 이슈로는 ${headlines} 등이 부각되었습니다. ` +
    `글로벌 금리 환경과 주요 경제지표 발표에 따라 시장 변동성이 지속되고 있으며, ` +
    `투자자들은 각국 중앙은행의 통화정책 방향에 주목하고 있습니다.`
  );
}

function generateInvestmentDirection(sentiment: Sentiment): string {
  const directions: Record<Sentiment, string> = {
    bullish:
      '현재 시장은 상승 모멘텀이 우세합니다. 다만 고점 매수 리스크에 유의하며, ' +
      '펀더멘털이 탄탄한 종목 중심의 선별적 접근을 권장합니다. ' +
      '포트폴리오 내 수익 실현과 리밸런싱도 고려해 볼 시점입니다.',
    bearish:
      '시장 하방 압력이 증가하는 구간입니다. 현금 비중을 높이고 방어적 자산을 늘리는 전략이 유효합니다. ' +
      '낙폭 과대 우량주 중심의 분할 매수 기회를 탐색하되, 손절 원칙을 철저히 지키세요.',
    neutral:
      '방향성이 불명확한 시장입니다. 성급한 방향성 베팅보다는 분산투자와 리스크 관리에 집중하세요. ' +
      '주요 경제지표 발표 이후 추세를 확인한 뒤 포지션을 조정하는 것이 안전합니다.',
  };
  return directions[sentiment];
}

// ---------------------------------------------------------------------------
// 명언 선택 (감정에 맞게 2-3개)
// ---------------------------------------------------------------------------
function pickQuotes(sentiment: Sentiment): Quote[] {
  const pool = QUOTE_POOL[sentiment];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

// ---------------------------------------------------------------------------
// Supabase 저장
// ---------------------------------------------------------------------------
async function saveBriefing(
  sentiment: Sentiment,
  title: string,
  summary: string,
  investmentDirection: string,
  news: NewsItem[],
  quotes: Quote[],
): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  console.log('💾 Supabase에 저장 중...');

  const { data: briefing, error: briefingError } = await supabase
    .from('daily_briefings')
    .upsert(
      { date: today, title, summary, investment_direction: investmentDirection, market_sentiment: sentiment },
      { onConflict: 'date' },
    )
    .select('id')
    .single();

  if (briefingError || !briefing) {
    throw new Error(`브리핑 저장 실패: ${briefingError?.message}`);
  }

  const briefingId: string = briefing.id;

  // 기존 연관 데이터 삭제 후 재삽입 (재실행 시 중복 방지)
  await supabase.from('news_articles').delete().eq('briefing_id', briefingId);
  await supabase.from('investor_quotes').delete().eq('briefing_id', briefingId);

  if (news.length > 0) {
    const { error } = await supabase.from('news_articles').insert(
      news.map((n) => ({ briefing_id: briefingId, ...n })),
    );
    if (error) throw new Error(`뉴스 저장 실패: ${error.message}`);
    console.log(`  ↳ 뉴스 ${news.length}건 저장`);
  }

  if (quotes.length > 0) {
    const { error } = await supabase.from('investor_quotes').insert(
      quotes.map((q) => ({ briefing_id: briefingId, ...q })),
    );
    if (error) throw new Error(`명언 저장 실패: ${error.message}`);
    console.log(`  ↳ 명언 ${quotes.length}건 저장`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('\n🚀 경제 브리핑 생성 시작 (무료 RSS 방식)\n');
  const start = Date.now();

  // 1. 모든 RSS 피드 병렬 수집
  console.log('📡 RSS 피드 수집 중...');
  const feedResults = await Promise.all(
    RSS_FEEDS.map((f) => fetchRss(f.url, f.source)),
  );
  const allItems = feedResults.flat();
  console.log(`  ↳ 원본 ${allItems.length}건 수집`);

  // 2. 경제 뉴스만 필터링
  const ecoItems = allItems.filter(isEconomicNews);
  console.log(`  ↳ 경제 관련 ${ecoItems.length}건 필터링`);

  if (ecoItems.length === 0) {
    console.error('❌ 경제 뉴스를 수집하지 못했습니다. RSS 피드를 확인하세요.');
    process.exit(1);
  }

  // 3. 중복 제목 제거 후 최대 7개
  const seen = new Set<string>();
  const unique = ecoItems.filter((item) => {
    const key = item.title.slice(0, 20);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 7);

  // 4. 분석
  const sentiment = analyzeSentiment(unique);
  const title = generateTitle(unique, sentiment);
  const summary = generateSummary(unique, sentiment);
  const investmentDirection = generateInvestmentDirection(sentiment);
  const quotes = pickQuotes(sentiment);

  const news: NewsItem[] = unique.map((item) => ({
    title: item.title,
    summary: item.description?.slice(0, 200) || item.title,
    url: item.link,
    source: item.source,
    published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
  }));

  console.log(`\n📊 분석 결과`);
  console.log(`  제목: ${title}`);
  console.log(`  시장 심리: ${sentiment}`);
  console.log(`  뉴스: ${news.length}건 / 명언: ${quotes.length}건`);

  // 5. Supabase 저장
  await saveBriefing(sentiment, title, summary, investmentDirection, news, quotes);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✨ 완료! (${elapsed}s)`);
}

main().catch((err) => {
  console.error('❌ 오류:', err);
  process.exit(1);
});
