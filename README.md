# 경제 브리핑 — AI 기반 경제 뉴스 분석 웹앱

Next.js 14 + TypeScript + Tailwind CSS + Claude AI + Supabase로 만든 일일 경제 뉴스 브리핑 서비스입니다.

## 기능

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 오늘의 브리핑 | `/` | 당일 시장 요약, 투자 방향, 주요 뉴스, 투자 대가 명언 |
| 아카이브 | `/archive` | 날짜별 과거 브리핑 목록 (월별 그룹) |
| 상세 | `/archive/[date]` | 특정 날짜 브리핑 전체 내용 |
| 검색 | `/search` | 제목·내용·투자 대가 이름으로 검색 |

## 빠른 시작

### 1. 환경변수 설정

```bash
cp .env.local.example .env.local
# .env.local 파일을 열어 실제 값으로 채우세요
```

### 2. Supabase 테이블 생성

Supabase 대시보드 → SQL Editor에서 `supabase/schema.sql` 내용을 실행하세요.

### 3. 개발 서버 실행

```bash
npm install
npm run dev
```

### 4. 브리핑 생성 (Claude AI)

```bash
npm run generate
```

매일 1회 실행하거나 cron으로 자동화하면 됩니다.

## 환경변수

| 변수 | 설명 |
|------|------|
| `ANTHROPIC_API_KEY` | Claude API 키 (generate 스크립트용) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 (읽기 전용) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (쓰기용, 서버/스크립트 전용) |

## 프로젝트 구조

```
├── app/
│   ├── page.tsx               # 오늘의 브리핑 (메인)
│   ├── archive/
│   │   ├── page.tsx           # 아카이브 목록
│   │   └── [date]/page.tsx    # 날짜별 상세
│   └── search/page.tsx        # 검색
├── components/                # 재사용 UI 컴포넌트
├── lib/
│   ├── supabase.ts            # Supabase 클라이언트
│   └── types.ts               # TypeScript 타입 정의
├── scripts/
│   └── generate-briefing.ts  # Claude API 뉴스 수집·저장 스크립트
└── supabase/
    └── schema.sql             # DB 스키마
```

## 자동화 (선택)

```bash
# cron 예시: 매일 오전 8시 실행
0 8 * * * cd /path/to/app && npm run generate >> logs/generate.log 2>&1
```
