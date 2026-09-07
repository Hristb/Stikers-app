/* ── Loader de catálogo desde Supabase ──
   Cumple la promesa del comentario de content.config.ts: "el día que el
   catálogo migre a una base de datos, solo cambia el `loader` de cada
   colección". Cada colección puede leerse de Supabase en build o, si no
   hay credenciales (contribuidor sin `.env`, CI sin secrets, Supabase
   caído), caer al JSON local que sigue versionado en src/content/.

   La forma que devuelve cada loader es EXACTAMENTE la del JSON, así que
   ni los schema Zod ni nada que llame a getCollection() cambia. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { file } from 'astro/loaders';
import type { Loader } from 'astro/loaders';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.PUBLIC_SUPABASE_URL ?? process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? process.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const sb: SupabaseClient | null = supabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, { auth: { persistSession: false } })
  : null;

type Entry = Record<string, unknown> & { id: string };

/**
 * Devuelve un loader de Astro para `jsonPath`:
 *   · sin Supabase configurado → `file(jsonPath)` (comportamiento actual)
 *   · con Supabase             → ejecuta `query` en build; si falla, cae al JSON.
 */
function supabaseOrJson(
  jsonPath: string,
  query: (client: SupabaseClient) => Promise<Entry[]>,
): Loader | (() => Promise<Entry[]>) {
  if (!sb) return file(jsonPath);
  return async () => {
    try {
      const rows = await query(sb);
      if (!rows.length) throw new Error('la consulta devolvió 0 filas');
      return rows;
    } catch (err) {
      console.warn(
        `\n[supabase-loader] ⚠  "${jsonPath}": ${(err as Error).message}. ` +
          `Usando el JSON local como respaldo.\n`,
      );
      const raw = await readFile(path.join(process.cwd(), jsonPath), 'utf8');
      return JSON.parse(raw) as Entry[];
    }
  };
}

const num = (v: unknown) => Number(v ?? 0);

export const productsLoader = supabaseOrJson('src/content/products.json', async (client) => {
  const [cats, stickers] = await Promise.all([
    client.from('categories').select('slug'),
    client
      .from('stickers')
      .select(
        'slug, name, image_url, price, rarity_label, ' +
          'category:categories(slug), rarity:rarities(slug), sticker_tags(tags(slug))',
      )
      .eq('is_active', true)
      .order('sort_order'),
  ]);
  if (cats.error) throw cats.error;
  if (stickers.error) throw stickers.error;

  const validCategories = new Set((cats.data ?? []).map((c: any) => c.slug));

  return (stickers.data ?? [])
    .map((r: any) => ({
      id: r.slug,
      name: r.name,
      image: r.image_url,
      category: r.category?.slug,
      rarity: r.rarity?.slug ?? null,
      rarityLabel: r.rarity_label ?? null,
      price: num(r.price),
      searchTags: (r.sticker_tags ?? []).map((st: any) => st.tags?.slug).filter(Boolean),
    }))
    .filter((p) => {
      if (p.category && validCategories.has(p.category)) return true;
      console.warn(
        `[supabase-loader] ⚠  sticker "${p.id}": categoría "${p.category}" no existe en la tabla categories — se omite`,
      );
      return false;
    });
});

export const categoriesLoader = supabaseOrJson('src/content/categories.json', async (client) => {
  const { data, error } = await client
    .from('categories')
    .select('slug, name, sort_order')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.slug,
    name: r.name,
    sortOrder: num(r.sort_order),
  }));
});

export const packsLoader = supabaseOrJson('src/content/packs.json', async (client) => {
  const { data, error } = await client
    .from('packs')
    .select('slug, badge_label, name, description, image_url, price')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.slug,
    label: r.badge_label,
    name: r.name,
    description: r.description,
    image: r.image_url,
    price: num(r.price),
  }));
});

export const finishesLoader = supabaseOrJson('src/content/finishes.json', async (client) => {
  const { data, error } = await client
    .from('finishes')
    .select('slug, label, image_url')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({ id: r.slug, label: r.label, image: r.image_url }));
});

export const pricingLoader = supabaseOrJson('src/content/pricing.json', async (client) => {
  const { data, error } = await client
    .from('store_config')
    .select('unit_price, pack_size, pack_price')
    .eq('id', 1)
    .single();
  if (error) throw error;
  return [
    {
      id: 'default',
      unitPrice: num(data.unit_price),
      packSize: num(data.pack_size),
      packPrice: num(data.pack_price),
    },
  ];
});
