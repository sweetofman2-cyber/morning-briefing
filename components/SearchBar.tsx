'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function SearchBar({ initialQuery }: { initialQuery: string }) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    startTransition(() => {
      router.push(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="제목, 내용, 또는 투자 대가 이름 검색..."
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 pr-14 text-slate-200 placeholder-slate-500 outline-none ring-blue-500/50 transition focus:border-blue-500/50 focus:ring-2"
        autoFocus
      />
      <button
        type="submit"
        disabled={isPending}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
      >
        {isPending ? '...' : '검색'}
      </button>
    </form>
  );
}
