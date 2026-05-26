export type MarketSentiment = 'bullish' | 'bearish' | 'neutral';

export interface DailyBriefing {
  id: string;
  date: string;
  title: string;
  summary: string;
  investment_direction: string;
  market_sentiment: MarketSentiment;
  created_at: string;
  news_articles?: NewsArticle[];
  investor_quotes?: InvestorQuote[];
}

export interface NewsArticle {
  id: string;
  briefing_id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  published_at: string | null;
  created_at: string;
}

export interface InvestorQuote {
  id: string;
  briefing_id: string;
  investor_name: string;
  quote: string;
  context: string;
  created_at: string;
}
