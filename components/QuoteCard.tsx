import type { InvestorQuote } from '@/lib/types';

interface InvestorStyle {
  border: string;
  bg: string;
  label: string;
}

const investorStyles: Record<string, InvestorStyle> = {
  '워런 버핏': {
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
    label: 'text-amber-400',
  },
  '피터 린치': {
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    label: 'text-emerald-400',
  },
  '레이 달리오': {
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    label: 'text-blue-400',
  },
  '조지 소로스': {
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    label: 'text-purple-400',
  },
  '벤저민 그레이엄': {
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
    label: 'text-cyan-400',
  },
};

const defaultStyle: InvestorStyle = {
  border: 'border-slate-500/20',
  bg: 'bg-slate-500/5',
  label: 'text-slate-400',
};

export default function QuoteCard({ quote }: { quote: InvestorQuote }) {
  const style = investorStyles[quote.investor_name] ?? defaultStyle;

  return (
    <div className={`rounded-xl border p-5 ${style.border} ${style.bg}`}>
      <div className="mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wider ${style.label}`}>
          {quote.investor_name}
        </span>
      </div>
      <blockquote className="mb-2 text-base font-medium leading-relaxed text-slate-100">
        &ldquo;{quote.quote}&rdquo;
      </blockquote>
      {quote.context && (
        <p className="mt-3 text-sm text-slate-400 italic">{quote.context}</p>
      )}
    </div>
  );
}
