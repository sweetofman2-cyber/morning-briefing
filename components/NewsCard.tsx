import type { NewsArticle } from '@/lib/types';

export default function NewsCard({ article, index }: { article: NewsArticle; index: number }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-all hover:border-blue-500/40 hover:bg-slate-800/60"
    >
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-xs font-bold text-blue-400">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {article.source}
            </span>
            {article.published_at && (
              <span className="text-xs text-slate-600">
                {new Date(article.published_at).toLocaleDateString('ko-KR')}
              </span>
            )}
          </div>
          <h3 className="mb-1 font-semibold text-slate-200 group-hover:text-blue-300 transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2">{article.summary}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>원문 보기</span>
            <span>↗</span>
          </div>
        </div>
      </div>
    </a>
  );
}
