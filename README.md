# meerkat-portfolio

개인 포트폴리오 — Vue 3 + Supabase

## 기술 스택

| | 기술 |
|---|---|
| Frontend | Vue 3, Vite, Pinia, Vue Router, Tailwind CSS |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage + RLS) |
| 인증 | Google OAuth via Supabase |
| 배포 | Vercel (GitHub 연동 자동 배포) |

## 로컬 개발

```bash
npm install
cp .env.example .env.local   # Supabase 키 입력
npm run dev
```

## 관리자 접근

헤더 영역 **7회 연속 클릭** → Google 로그인 → 관리자 이메일 일치 시 편집 모드 활성화

## 개발 일지

- **Day 1** — GitHub 레포, Supabase 프로젝트, 스키마, Vercel 배포 연결
- Day 2 — Vue 프로젝트 구조, 라우터, Pinia 스토어
- Day 3 — 홈 화면 (4분할 그리드, 프로필 카드, 섹션 요약 카드)
- Day 4 — 관리자 인증, CRUD 폼
- Day 5 — 섹션별 상세 페이지 (기술/프로젝트/히스토리/근무이력)
- Day 6 — 연락 기능, 반응형 마무리, 배포
