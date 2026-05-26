import type { MarketSentiment } from '@/lib/types';

const config: Record<MarketSentiment, { label: string; className: string; dot: string }> = {
  bullish: {
    label: '강세 (Bullish)',
    className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  bearish: {
    label: '약세 (Bearish)',
    className: 'bg-red-500/10 text-red-400 border border-red-500/20',
    dot: 'bg-red-400',
  },
  neutral: {
    label: '중립 (Neutral)',
    className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-400',
  },
};

export default function SentimentBadge({ sentiment }: { sentiment: MarketSentiment }) {
  const { label, className, dot } = config[sentiment];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
