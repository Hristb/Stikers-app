-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  0003 · RPC public.create_order() + Row Level Security                ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- El sitio es estático (GitHub Pages): el navegador habla con Supabase con
-- la anon key (pública). La seguridad NO depende de ocultar esa key, depende
-- de estas políticas RLS:
--   · catálogo  → lectura pública, escritura solo admin
--   · pedidos   → el visitante NO puede leer ni escribir directamente;
--                 solo puede llamar create_order() (SECURITY DEFINER)

-- ── is_admin() ───────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ── create_order(): única vía de escritura para el rol anónimo ───────
-- Recalcula precios y total en el servidor a partir de `stickers` /
-- `packs` / `store_config`: cualquier precio que mande el cliente se ignora.
create or replace function public.create_order(
  p_customer jsonb,
  p_items    jsonb,
  p_meta     jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name          text := trim(coalesce(p_customer->>'full_name', ''));
  v_phone         text := regexp_replace(coalesce(p_customer->>'phone', ''), '\D', '', 'g');
  v_email         text := nullif(trim(coalesce(p_customer->>'email', '')), '');
  v_instagram     text := nullif(trim(coalesce(p_customer->>'instagram', '')), '');
  v_note          text := nullif(trim(coalesce(p_customer->>'note', '')), '');
  v_customer_id   uuid;
  v_order_id      uuid;
  v_order_number  text;
  v_cfg           public.store_config%rowtype;
  v_item          jsonb;
  v_comp          jsonb;
  v_kind          public.order_item_kind;
  v_qty           int;
  v_sticker       public.stickers%rowtype;
  v_pack          public.packs%rowtype;
  v_finish        public.finishes%rowtype;
  v_comp_finish   public.finishes%rowtype;
  v_order_item_id uuid;
  v_unit          numeric(10,2);
  v_line          numeric(10,2);
  v_sticker_units int := 0;
  v_extra_total   numeric(10,2) := 0;
  v_pack_count    int := 0;
  v_loose_count   int := 0;
  v_subtotal      numeric(10,2) := 0;
  v_total         numeric(10,2) := 0;
  v_item_count    int := 0;
begin
  -- ── validación de entrada ──
  if char_length(v_name) < 2 or char_length(v_name) > 120 then
    raise exception 'Nombre inválido' using errcode = 'check_violation';
  end if;
  if v_phone !~ '^[0-9]{7,15}$' then
    raise exception 'Teléfono inválido' using errcode = 'check_violation';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no tiene ítems' using errcode = 'check_violation';
  end if;
  if jsonb_array_length(p_items) > 200 then
    raise exception 'Demasiados ítems en el pedido' using errcode = 'check_violation';
  end if;

  select * into v_cfg from public.store_config where id = 1;

  -- ── upsert cliente por teléfono ──
  insert into public.customers (full_name, phone, email, instagram)
  values (v_name, v_phone, v_email, v_instagram)
  on conflict (phone) do update
    set full_name  = excluded.full_name,
        email      = coalesce(excluded.email, public.customers.email),
        instagram  = coalesce(excluded.instagram, public.customers.instagram),
        updated_at = now()
  returning id into v_customer_id;

  -- ── crear orden (order_number lo pone el trigger) ──
  insert into public.orders (
    customer_id, currency, customer_note, referrer, landing_path, user_agent
  ) values (
    v_customer_id,
    v_cfg.currency,
    v_note,
    left(nullif(p_meta->>'referrer', ''), 500),
    left(nullif(p_meta->>'landing_path', ''), 300),
    left(nullif(p_meta->>'user_agent', ''), 500)
  )
  returning id, order_number into v_order_id, v_order_number;

  -- ── recorrer los ítems ──
  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_kind := coalesce(v_item->>'kind', 'sticker')::public.order_item_kind;
    v_qty  := coalesce((v_item->>'quantity')::int, 1);
    if v_qty < 1 or v_qty > 500 then
      raise exception 'Cantidad inválida' using errcode = 'check_violation';
    end if;
    v_item_count := v_item_count + v_qty;

    if v_kind = 'sticker' then
      select * into v_sticker from public.stickers
        where slug = (v_item->>'slug') and is_active;
      if not found then
        raise exception 'Sticker no encontrado: %', v_item->>'slug'
          using errcode = 'foreign_key_violation';
      end if;
      v_unit := v_sticker.price;
      v_line := v_unit * v_qty;
      v_sticker_units := v_sticker_units + v_qty;

      insert into public.order_items (
        order_id, kind, sticker_id, name_snapshot, rarity_label_snapshot,
        image_url_snapshot, unit_price_snapshot, quantity, line_total
      ) values (
        v_order_id, 'sticker', v_sticker.id, v_sticker.name, v_sticker.rarity_label,
        v_sticker.image_url, v_unit, v_qty, v_line
      );

    elsif v_kind = 'pack' then
      select * into v_pack from public.packs
        where slug = (v_item->>'slug') and is_active;
      if not found then
        raise exception 'Pack no encontrado: %', v_item->>'slug'
          using errcode = 'foreign_key_violation';
      end if;
      v_unit := v_pack.price;
      v_line := v_unit * v_qty;
      v_extra_total := v_extra_total + v_line;

      insert into public.order_items (
        order_id, kind, pack_id, name_snapshot, image_url_snapshot,
        unit_price_snapshot, quantity, line_total
      ) values (
        v_order_id, 'pack', v_pack.id, v_pack.name, v_pack.image_url,
        v_unit, v_qty, v_line
      );

    else
      -- pack_sorpresa | pack_personalizado → precio de store_config
      v_unit := v_cfg.pack_price;
      v_line := v_unit * v_qty;
      v_extra_total := v_extra_total + v_line;

      v_finish := null;
      if v_item ? 'finish_slug' then
        select * into v_finish from public.finishes where slug = (v_item->>'finish_slug');
      end if;

      insert into public.order_items (
        order_id, kind, finish_id, name_snapshot, finish_label_snapshot,
        unit_price_snapshot, quantity, line_total
      ) values (
        v_order_id, v_kind, v_finish.id,
        case when v_kind = 'pack_sorpresa' then 'Pack Sorpresa' else 'Pack Personalizado' end,
        v_finish.label, v_unit, v_qty, v_line
      )
      returning id into v_order_item_id;

      -- componentes: los stickers que van dentro del pack
      if jsonb_typeof(v_item->'components') = 'array' then
        for v_comp in select value from jsonb_array_elements(v_item->'components')
        loop
          select * into v_sticker from public.stickers where slug = (v_comp->>'slug');
          v_comp_finish := null;
          if v_comp ? 'finish_slug' then
            select * into v_comp_finish from public.finishes where slug = (v_comp->>'finish_slug');
          end if;
          insert into public.order_item_components (
            order_item_id, sticker_id, finish_id, name_snapshot, finish_label_snapshot, quantity
          ) values (
            v_order_item_id,
            v_sticker.id,
            coalesce(v_comp_finish.id, v_finish.id),
            coalesce(v_sticker.name, v_comp->>'name', 'Sticker'),
            coalesce(v_comp_finish.label, v_finish.label),
            greatest(coalesce((v_comp->>'quantity')::int, 1), 1)
          );
        end loop;
      end if;
    end if;
  end loop;

  -- ── total autoritativo: mismo bundling que cart.js ──
  --   cada `pack_size` stickers sueltos se cobran a `pack_price`; el resto a `unit_price`.
  v_pack_count  := v_sticker_units / v_cfg.pack_size;
  v_loose_count := v_sticker_units % v_cfg.pack_size;
  v_subtotal := v_sticker_units * v_cfg.unit_price + v_extra_total;
  v_total := v_pack_count * v_cfg.pack_price
           + v_loose_count * v_cfg.unit_price
           + v_extra_total;

  update public.orders set
    item_count       = v_item_count,
    pack_count       = v_pack_count,
    loose_count      = v_loose_count,
    subtotal         = v_subtotal,
    discount         = greatest(v_subtotal - v_total, 0),
    total            = v_total,
    whatsapp_message = left(nullif(p_meta->>'whatsapp_message', ''), 4000)
  where id = v_order_id;

  insert into public.order_events (order_id, type, detail, created_by)
  values (
    v_order_id, 'created',
    jsonb_build_object('item_count', v_item_count, 'total', v_total),
    'anon'
  );

  return jsonb_build_object(
    'order_id',        v_order_id,
    'order_number',    v_order_number,
    'total',           v_total,
    'currency',        v_cfg.currency,
    'whatsapp_number', v_cfg.whatsapp_number
  );
end;
$$;

revoke all on function public.create_order(jsonb, jsonb, jsonb) from public;
grant execute on function public.create_order(jsonb, jsonb, jsonb) to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Bootstrap del primer admin (una sola vez, desde el SQL Editor o psql con
-- service_role — la API no lo permite porque aún nadie es admin):
--   insert into public.admins (user_id, email)
--   select id, email from auth.users where email = 'tu-correo@ejemplo.com';

-- ── Row Level Security ──────────────────────────────────────────────
alter table public.categories             enable row level security;
alter table public.rarities               enable row level security;
alter table public.stickers               enable row level security;
alter table public.tags                   enable row level security;
alter table public.sticker_tags           enable row level security;
alter table public.finishes               enable row level security;
alter table public.packs                  enable row level security;
alter table public.pack_items             enable row level security;
alter table public.store_config           enable row level security;
alter table public.customers              enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.order_item_components  enable row level security;
alter table public.order_events           enable row level security;
alter table public.admins                 enable row level security;

-- catálogo: lectura pública (anon + authenticated)
create policy "read active"  on public.categories    for select using (is_active);
create policy "read all"     on public.rarities      for select using (true);
create policy "read active"  on public.stickers      for select using (is_active);
create policy "read all"     on public.tags          for select using (true);
create policy "read all"     on public.sticker_tags  for select using (true);
create policy "read active"  on public.finishes      for select using (is_active);
create policy "read active"  on public.packs         for select using (is_active);
create policy "read all"     on public.pack_items    for select using (true);
create policy "read all"     on public.store_config  for select using (true);

-- catálogo: escritura solo admin autenticado
create policy "admin write" on public.categories    for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.rarities      for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.stickers      for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.tags          for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.sticker_tags  for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.finishes      for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.packs         for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.pack_items    for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.store_config  for all using (public.is_admin()) with check (public.is_admin());

-- pedidos: SOLO admin. El visitante anónimo no tiene política ⇒ sin acceso
-- directo; escribe exclusivamente vía create_order() (SECURITY DEFINER).
create policy "admin only" on public.customers             for all using (public.is_admin()) with check (public.is_admin());
create policy "admin only" on public.orders                for all using (public.is_admin()) with check (public.is_admin());
create policy "admin only" on public.order_items           for all using (public.is_admin()) with check (public.is_admin());
create policy "admin only" on public.order_item_components for all using (public.is_admin()) with check (public.is_admin());
create policy "admin only" on public.order_events          for all using (public.is_admin()) with check (public.is_admin());
create policy "admin only" on public.admins                for all using (public.is_admin()) with check (public.is_admin());

-- Cinturón y tirantes: aunque el proyecto exponga tablas nuevas por defecto,
-- el rol anónimo no tiene ni un privilegio sobre las tablas de pedidos…
revoke all on public.customers             from anon;
revoke all on public.orders                from anon;
revoke all on public.order_items           from anon;
revoke all on public.order_item_components from anon;
revoke all on public.order_events          from anon;
revoke all on public.admins                from anon;

-- …y sobre el catálogo solo puede LEER (nada de insert/update/delete, ni
-- siquiera como no-op que RLS filtraría a 0 filas).
revoke insert, update, delete, truncate, references, trigger on public.categories   from anon;
revoke insert, update, delete, truncate, references, trigger on public.rarities     from anon;
revoke insert, update, delete, truncate, references, trigger on public.stickers     from anon;
revoke insert, update, delete, truncate, references, trigger on public.tags         from anon;
revoke insert, update, delete, truncate, references, trigger on public.sticker_tags from anon;
revoke insert, update, delete, truncate, references, trigger on public.finishes     from anon;
revoke insert, update, delete, truncate, references, trigger on public.packs        from anon;
revoke insert, update, delete, truncate, references, trigger on public.pack_items   from anon;
revoke insert, update, delete, truncate, references, trigger on public.store_config from anon;
