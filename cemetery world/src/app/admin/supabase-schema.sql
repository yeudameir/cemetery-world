-- ══════════════════════════════════════════════════════════════════
-- CEMETERY WORLD DATABASE SCHEMA
-- Run this entire file in Supabase → SQL Editor → Run
-- ══════════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── Countries ────────────────────────────────────────────────────
create table countries (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  name_he     text not null,
  flag_emoji  text not null default '',
  created_at  timestamptz default now()
);

-- ─── Cities ───────────────────────────────────────────────────────
create table cities (
  id          uuid primary key default uuid_generate_v4(),
  country_id  uuid references countries(id) on delete cascade,
  name        text not null,
  name_he     text not null default '',
  lat         float,
  lng         float,
  created_at  timestamptz default now()
);

-- ─── Cemeteries ───────────────────────────────────────────────────
create table cemeteries (
  id              uuid primary key default uuid_generate_v4(),
  city_id         uuid references cities(id) on delete cascade,
  name            text not null,
  name_he         text not null default '',
  community       text,          -- e.g. "Jewish", "Muslim", "Christian", "Mixed"
  founded_year    int,
  condition       text,          -- "good" | "fair" | "poor" | "abandoned"
  cover_image     text,          -- URL to cover photo
  lat             float,
  lng             float,
  description     text,
  description_he  text,
  created_at      timestamptz default now()
);

-- ─── Graves ───────────────────────────────────────────────────────
create table graves (
  id                    uuid primary key default uuid_generate_v4(),
  cemetery_id           uuid references cemeteries(id) on delete cascade,
  first_name            text,
  last_name             text,
  first_name_he         text,
  last_name_he          text,
  birth_date            date,
  death_date            date,
  birth_date_hebrew     text,    -- e.g. "כ׳ אב תש״ב"
  death_date_hebrew     text,
  inscription           text,    -- original text on stone
  inscription_readable  boolean default true,
  biography             text,    -- life story in English
  biography_he          text,    -- life story in Hebrew
  father_name           text,
  mother_name           text,
  spouse_name           text,
  inscription_language  text,    -- "Hebrew", "French", "Arabic", "Ladino", "Unknown"
  condition             text,    -- "good" | "fair" | "poor" | "illegible"
  lat                   float,
  lng                   float,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger graves_updated_at
  before update on graves
  for each row execute function update_updated_at();

-- ─── Grave Images ─────────────────────────────────────────────────
create table grave_images (
  id          uuid primary key default uuid_generate_v4(),
  grave_id    uuid references graves(id) on delete cascade,
  url         text not null,
  is_primary  boolean default false,
  caption     text,
  created_at  timestamptz default now()
);

-- ─── Update Requests (from public visitors) ───────────────────────
create table update_requests (
  id            uuid primary key default uuid_generate_v4(),
  grave_id      uuid references graves(id) on delete cascade,
  message       text not null,
  sender_name   text,
  sender_email  text,
  status        text default 'pending',  -- "pending" | "reviewed" | "applied"
  created_at    timestamptz default now()
);

-- ─── Indexes for performance ──────────────────────────────────────
create index on cities(country_id);
create index on cemeteries(city_id);
create index on graves(cemetery_id);
create index on grave_images(grave_id);
create index on graves(last_name, first_name);

-- ─── Full-text search ─────────────────────────────────────────────
create index on graves using gin(
  to_tsvector('simple', coalesce(first_name,'') || ' ' || coalesce(last_name,'') || ' ' || coalesce(first_name_he,'') || ' ' || coalesce(last_name_he,''))
);

-- ─── Row Level Security (public can read, only you can write) ─────
alter table countries       enable row level security;
alter table cities          enable row level security;
alter table cemeteries      enable row level security;
alter table graves          enable row level security;
alter table grave_images    enable row level security;
alter table update_requests enable row level security;

-- Anyone can read everything
create policy "public read countries"       on countries       for select using (true);
create policy "public read cities"          on cities          for select using (true);
create policy "public read cemeteries"      on cemeteries      for select using (true);
create policy "public read graves"          on graves          for select using (true);
create policy "public read grave_images"    on grave_images    for select using (true);

-- Anyone can submit an update request
create policy "public insert update_requests" on update_requests for insert with check (true);

-- Only service_role (your admin panel) can write everything else
create policy "service write countries"    on countries       for all using (auth.role() = 'service_role');
create policy "service write cities"       on cities          for all using (auth.role() = 'service_role');
create policy "service write cemeteries"   on cemeteries      for all using (auth.role() = 'service_role');
create policy "service write graves"       on graves          for all using (auth.role() = 'service_role');
create policy "service write images"       on grave_images    for all using (auth.role() = 'service_role');
create policy "service write requests"     on update_requests for all using (auth.role() = 'service_role');

-- ─── Sample data to start ─────────────────────────────────────────
insert into countries (name, name_he, flag_emoji) values
  ('Morocco',  'מרוקו',   '🇲🇦'),
  ('Poland',   'פולין',   '🇵🇱'),
  ('Tunisia',  'תוניסיה', '🇹🇳'),
  ('France',   'צרפת',    '🇫🇷'),
  ('Israel',   'ישראל',   '🇮🇱');
