-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  0001 · Catálogo relacional + datos de referencia                     ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- Modela lo que hoy vive en src/content/*.json (products, packs, finishes,
-- pricing) como tablas reales. El loader de Astro (src/loaders/supabase.ts)
-- lee de aquí en build; si Supabase no está configurado, cae al JSON.

-- ── Enums ──────────────────────────────────────────────────────────────
create type public.order_status as enum (
  'pendiente', 'contactado', 'pagado', 'en_produccion',
  'enviado', 'entregado', 'cancelado'
);
create type public.order_channel as enum ('whatsapp');
create type public.order_item_kind as enum (
  'sticker', 'pack', 'pack_sorpresa', 'pack_personalizado'
);

-- ── Helper: mantiene updated_at ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── categories ────────────────────────────────────────────────────────
create table public.categories (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── rarities ──────────────────────────────────────────────────────────
create table public.rarities (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  label       text not null,
  sort_order  int  not null default 0
);

-- ── stickers ──────────────────────────────────────────────────────────
create table public.stickers (
  id            bigint generated always as identity primary key,
  slug          text not null unique,               -- = "id" del products.json
  name          text not null,
  image_url     text not null,
  category_id   bigint not null references public.categories(id),
  rarity_id     bigint references public.rarities(id),
  rarity_label  text,                                -- "Meme" / "Dev" cuando rarity_id es null
  price         numeric(10,2) not null default 1 check (price >= 0),
  is_active     boolean not null default true,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index stickers_category_idx on public.stickers(category_id);
create index stickers_rarity_idx   on public.stickers(rarity_id);
create trigger stickers_set_updated_at
  before update on public.stickers
  for each row execute function public.set_updated_at();

-- ── tags + join N:N (searchTags) ──────────────────────────────────────
create table public.tags (
  id    bigint generated always as identity primary key,
  slug  text not null unique
);

create table public.sticker_tags (
  sticker_id  bigint not null references public.stickers(id) on delete cascade,
  tag_id      bigint not null references public.tags(id)     on delete cascade,
  primary key (sticker_id, tag_id)
);

-- ── finishes (vinilos del Pack Personalizado) ─────────────────────────
create table public.finishes (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  label       text not null,
  image_url   text not null,
  is_active   boolean not null default true,
  sort_order  int  not null default 0
);

-- ── packs (los 3 packs del home) ─────────────────────────────────────
create table public.packs (
  id           bigint generated always as identity primary key,
  slug         text not null unique,
  badge_label  text,                                -- "label" del packs.json ("Pack destacado")
  name         text not null,
  description  text,
  image_url    text not null,
  price        numeric(10,2) not null check (price >= 0),
  is_active    boolean not null default true,
  sort_order   int  not null default 0
);

-- contenido fijo de un pack (opcional, a futuro)
create table public.pack_items (
  pack_id     bigint not null references public.packs(id)     on delete cascade,
  sticker_id  bigint not null references public.stickers(id)  on delete cascade,
  quantity    int not null default 1 check (quantity > 0),
  primary key (pack_id, sticker_id)
);

-- ── store_config (fila única) ────────────────────────────────────────
-- Reemplaza pricing.json + el número de WhatsApp hardcodeado en shared.js.
create table public.store_config (
  id               int primary key default 1 check (id = 1),
  currency         text not null default 'PEN',
  unit_price       numeric(10,2) not null default 1,
  pack_size        int  not null default 10 check (pack_size > 0),
  pack_price       numeric(10,2) not null default 8.50,
  whatsapp_number  text not null default '51956547311',
  updated_at       timestamptz not null default now()
);
create trigger store_config_set_updated_at
  before update on public.store_config
  for each row execute function public.set_updated_at();

-- ── Seed: datos de referencia (chicos y estructurales) ───────────────
insert into public.categories (slug, name, sort_order) values
  ('fortnite', 'Fortnite',   1),
  ('meme',     'Memes',      2),
  ('dev',      'Dev / Tech', 3)
on conflict (slug) do nothing;

insert into public.rarities (slug, label, sort_order) values
  ('mythic',    'Mítico',     1),
  ('legendary', 'Legendario', 2),
  ('epic',      'Épico',      3),
  ('rare',      'Raro',       4),
  ('special',   'Special',    5)
on conflict (slug) do nothing;

insert into public.finishes (slug, label, image_url, sort_order) values
  ('blanco',      'Vinil Blanco',                '/img/vinil/Vinil_adhesivo_blanco.jpg',                        1),
  ('arcoiris',    'Holográfico Arcoíris',        '/img/vinil/Vinil_adhesivo_holográfico_arcoiris.jpg',          2),
  ('vidrio-roto', 'Holográfico Vidrio Roto',     '/img/vinil/Vinil_adhesivo_holográfico_vidrio_roto.jpg',       3)
on conflict (slug) do nothing;

insert into public.store_config (id, currency, unit_price, pack_size, pack_price, whatsapp_number)
values (1, 'PEN', 1, 10, 8.50, '51956547311')
on conflict (id) do nothing;
