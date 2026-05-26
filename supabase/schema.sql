-- ============================================================
-- Economic Briefing App — Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Daily briefings
create table if not exists public.daily_briefings (
  id                  uuid primary key default gen_random_uuid(),
  date                date not null unique,
  title               text not null,
  summary             text not null,
  investment_direction text not null,
  market_sentiment    text not null check (market_sentiment in ('bullish', 'bearish', 'neutral')),
  created_at          timestamptz not null default now()
);

-- 2. News articles (child of daily_briefings)
create table if not exists public.news_articles (
  id           uuid primary key default gen_random_uuid(),
  briefing_id  uuid not null references public.daily_briefings(id) on delete cascade,
  title        text not null,
  summary      text not null,
  url          text not null,
  source       text not null,
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

-- 3. Investor quotes (child of daily_briefings)
create table if not exists public.investor_quotes (
  id            uuid primary key default gen_random_uuid(),
  briefing_id   uuid not null references public.daily_briefings(id) on delete cascade,
  investor_name text not null,
  quote         text not null,
  context       text not null default '',
  created_at    timestamptz not null default now()
);

-- Indexes for common query patterns
create index if not exists daily_briefings_date_idx   on public.daily_briefings(date desc);
create index if not exists news_articles_briefing_idx  on public.news_articles(briefing_id);
create index if not exists investor_quotes_briefing_idx on public.investor_quotes(briefing_id);

-- Full-text search indexes
create index if not exists daily_briefings_fts_idx on public.daily_briefings
  using gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(investment_direction, '')));

create index if not exists news_articles_fts_idx on public.news_articles
  using gin(to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(summary, '')));

-- Row Level Security — public read, no anonymous write
alter table public.daily_briefings  enable row level security;
alter table public.news_articles     enable row level security;
alter table public.investor_quotes   enable row level security;

create policy "public read daily_briefings"  on public.daily_briefings  for select using (true);
create policy "public read news_articles"     on public.news_articles     for select using (true);
create policy "public read investor_quotes"   on public.investor_quotes   for select using (true);

-- Service role can do everything (used by generate-briefing.ts)
create policy "service write daily_briefings" on public.daily_briefings
  for all using (auth.role() = 'service_role');
create policy "service write news_articles" on public.news_articles
  for all using (auth.role() = 'service_role');
create policy "service write investor_quotes" on public.investor_quotes
  for all using (auth.role() = 'service_role');
