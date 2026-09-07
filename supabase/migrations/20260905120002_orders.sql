-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  0002 · Clientes y pedidos                                            ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- Registro de TODA persona que llega a comprar. El pedido se sigue cerrando
-- por WhatsApp, pero antes queda guardado quién es y qué pidió.
-- La única vía de escritura para el visitante anónimo es la función
-- public.create_order() (ver 0003) — estas tablas no son escribibles por
-- el rol `anon` directamente.

-- ── customers ────────────────────────────────────────────────────────
create table public.customers (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null check (char_length(trim(full_name)) between 2 and 120),
  phone       text not null unique check (phone ~ '^[0-9]{7,15}$'),  -- solo dígitos
  email       text,
  instagram   text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ── orders ───────────────────────────────────────────────────────────
create sequence if not exists public.order_number_seq;

create table public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique,           -- SV-000001 (trigger)
  customer_id       uuid not null references public.customers(id),
  status            public.order_status  not null default 'pendiente',
  channel           public.order_channel not null default 'whatsapp',
  currency          text not null default 'PEN',
  item_count        int  not null default 0,
  pack_count        int  not null default 0,
  loose_count       int  not null default 0,
  subtotal          numeric(10,2) not null default 0,
  discount          numeric(10,2) not null default 0,
  total             numeric(10,2) not null default 0,
  customer_note     text,
  whatsapp_message  text,
  referrer          text,
  landing_path      text,
  user_agent        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  contacted_at      timestamptz,
  paid_at           timestamptz
);
create index orders_customer_idx   on public.orders(customer_id);
create index orders_status_idx     on public.orders(status);
create index orders_created_at_idx on public.orders(created_at desc);
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create or replace function public.set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'SV-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;
create trigger orders_set_order_number
  before insert on public.orders
  for each row execute function public.set_order_number();

-- ── order_items (líneas del pedido, con snapshots) ───────────────────
create table public.order_items (
  id                     uuid primary key default gen_random_uuid(),
  order_id               uuid not null references public.orders(id) on delete cascade,
  kind                   public.order_item_kind not null default 'sticker',
  sticker_id             bigint references public.stickers(id),
  pack_id                bigint references public.packs(id),
  finish_id              bigint references public.finishes(id),
  name_snapshot          text not null,
  rarity_label_snapshot  text,
  image_url_snapshot     text,
  finish_label_snapshot  text,
  unit_price_snapshot    numeric(10,2) not null,
  quantity               int not null check (quantity > 0),
  line_total             numeric(10,2) not null,
  created_at             timestamptz not null default now()
);
create index order_items_order_idx on public.order_items(order_id);

-- ── order_item_components (los 10 stickers de un pack personalizado) ─
create table public.order_item_components (
  id                     uuid primary key default gen_random_uuid(),
  order_item_id          uuid not null references public.order_items(id) on delete cascade,
  sticker_id             bigint references public.stickers(id),
  finish_id              bigint references public.finishes(id),
  name_snapshot          text not null,
  finish_label_snapshot  text,
  quantity               int not null default 1 check (quantity > 0)
);
create index order_item_components_item_idx on public.order_item_components(order_item_id);

-- ── order_events (timeline / auditoría) ─────────────────────────────
create table public.order_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  type        text not null,                        -- created | whatsapp_opened | status_changed | note
  detail      jsonb not null default '{}'::jsonb,
  created_by  text,                                 -- 'anon' | email del admin
  created_at  timestamptz not null default now()
);
create index order_events_order_idx on public.order_events(order_id);

-- ── admins (acceso futuro a panel / dashboard) ─────────────────────
create table public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text,
  created_at  timestamptz not null default now()
);
