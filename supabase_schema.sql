-- ================================================================
-- meerkat-portfolio Supabase 스키마
-- 실행 위치: Supabase Dashboard > SQL Editor > New query > Run
-- ================================================================

-- 섹션 타입 마스터 (skills / projects / history / career)
create table if not exists section_types (
  id         serial primary key,
  name       text not null unique,
  label_ko   text not null,
  icon       text,
  sort_order smallint default 0
);

insert into section_types (name, label_ko, icon, sort_order) values
  ('skills',   '기술',     'code',     1),
  ('projects', '프로젝트', 'folder',   2),
  ('history',  '히스토리', 'clock',    3),
  ('career',   '근무이력', 'building', 4)
on conflict (name) do nothing;

-- 포트폴리오 아이템 (모든 섹션 공통)
create table if not exists portfolio_items (
  id          uuid default gen_random_uuid() primary key,
  type_id     int references section_types(id) on delete restrict,
  title       text not null,
  subtitle    text,
  description text,
  image_url   text,
  -- 섹션별 다른 필드: skills→{level,category}, projects→{github_url,demo_url} 등
  extra_data  jsonb default '{}',
  tags        text[] default '{}',
  start_date  date,
  end_date    date,
  is_current  boolean default false,
  sort_order  smallint default 0,
  is_visible  boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- updated_at 자동 갱신 트리거
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger on_portfolio_items_updated
  before update on portfolio_items
  for each row execute function handle_updated_at();

-- 프로필 (항상 id=1 단일 row)
create table if not exists profile (
  id           int primary key default 1,
  name         text default '',
  birth_date   date,
  phone        text default '',
  email        text default '',
  github_url   text default '',
  blog_url     text default '',
  bio          text default '',
  -- 학력 배열: [{"school":"OO대학교","degree":"컴퓨터공학 학사","year":2022}]
  education    jsonb default '[]',
  photo_url    text,
  updated_at   timestamptz default now()
);

insert into profile (id) values (1) on conflict (id) do nothing;

-- ================================================================
-- RLS (Row Level Security) — 공개 읽기 / 로그인 사용자 쓰기
-- ================================================================

alter table portfolio_items enable row level security;
alter table profile          enable row level security;
alter table section_types    enable row level security;

-- 누구나 읽기
create policy "public read portfolio_items" on portfolio_items for select using (true);
create policy "public read profile"         on profile          for select using (true);
create policy "public read section_types"   on section_types    for select using (true);

-- 로그인한 사용자만 쓰기 (앱에서 이메일 추가 검증)
create policy "auth write portfolio_items"  on portfolio_items  for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "auth write profile"          on profile          for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ================================================================
-- Storage 이미지 정책 (버킷은 대시보드에서 수동 생성)
-- Storage > New bucket > "portfolio-images" > Public 체크
-- ================================================================

create policy "public read images" on storage.objects
  for select using (bucket_id = 'portfolio-images');

create policy "auth upload images" on storage.objects
  for insert with check (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');

create policy "auth delete images" on storage.objects
  for delete using (bucket_id = 'portfolio-images' and auth.role() = 'authenticated');
