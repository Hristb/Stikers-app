/* ── Siembra el catálogo en Supabase desde src/content/*.json ──
   Fuente de verdad del catálogo editable a mano: los JSON de src/content/.
   Este script los sube a las tablas relacionales (idempotente: upsert).

   Uso:
     node --env-file=.env scripts/seed-supabase.mjs      (o: npm run seed)

   Requiere en .env:
     PUBLIC_SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY   ← saltea RLS. SOLO local, nunca al repo.

   Apunta a donde apunte PUBLIC_SUPABASE_URL (local o remoto). Para local:
     PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
     SUPABASE_SERVICE_ROLE_KEY=<el que imprime `supabase start`> */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✗ Falta PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const root = fileURLToPath(new URL('../', import.meta.url));
const json = async (p) => JSON.parse(await readFile(root + p, 'utf8'));

// Las categorías salen de src/content/categories.json (no hardcodeadas):
// agregar una categoría = una línea en ese archivo, sin tocar este script.
const RARITIES = [
  { slug: 'mythic', label: 'Mítico', sort_order: 1 },
  { slug: 'legendary', label: 'Legendario', sort_order: 2 },
  { slug: 'epic', label: 'Épico', sort_order: 3 },
  { slug: 'rare', label: 'Raro', sort_order: 4 },
  { slug: 'special', label: 'Special', sort_order: 5 },
];

const check = (label, { error }) => {
  if (error) {
    console.error(`✗ ${label}:`, error.message);
    process.exit(1);
  }
  console.log(`✓ ${label}`);
};

const mapBySlug = async (table) => {
  const { data, error } = await sb.from(table).select('id, slug');
  if (error) {
    console.error(`✗ leyendo ${table}:`, error.message);
    process.exit(1);
  }
  return Object.fromEntries(data.map((r) => [r.slug, r.id]));
};

async function main() {
  console.log(`Sembrando ${SUPABASE_URL} …\n`);

  const [products, packs, finishes, pricing, categories] = await Promise.all([
    json('src/content/products.json'),
    json('src/content/packs.json'),
    json('src/content/finishes.json'),
    json('src/content/pricing.json'),
    json('src/content/categories.json'),
  ]);

  // ── datos de referencia ──
  check(
    'categories',
    await sb.from('categories').upsert(
      categories.map((c, i) => ({ slug: c.id, name: c.name, sort_order: c.sortOrder ?? i })),
      { onConflict: 'slug' },
    ),
  );
  check('rarities', await sb.from('rarities').upsert(RARITIES, { onConflict: 'slug' }));
  check(
    'finishes',
    await sb.from('finishes').upsert(
      finishes.map((f, i) => ({ slug: f.id, label: f.label, image_url: f.image, sort_order: i })),
      { onConflict: 'slug' },
    ),
  );
  const price = pricing[0] ?? { unitPrice: 1, packSize: 10, packPrice: 8.5 };
  check(
    'store_config',
    await sb.from('store_config').upsert(
      { id: 1, unit_price: price.unitPrice, pack_size: price.packSize, pack_price: price.packPrice },
      { onConflict: 'id' },
    ),
  );

  // ── stickers ──
  const catId = await mapBySlug('categories');
  const rarId = await mapBySlug('rarities');
  check(
    `stickers (${products.length})`,
    await sb.from('stickers').upsert(
      products.map((p, i) => ({
        slug: p.id,
        name: p.name,
        image_url: p.image,
        category_id: catId[p.category],
        rarity_id: p.rarity ? rarId[p.rarity] : null,
        rarity_label: p.rarityLabel ?? null,
        price: p.price,
        sort_order: i,
      })),
      { onConflict: 'slug' },
    ),
  );

  // ── tags + join ──
  const tagSlugs = [...new Set(products.flatMap((p) => p.searchTags))].sort();
  check(
    `tags (${tagSlugs.length})`,
    await sb.from('tags').upsert(tagSlugs.map((slug) => ({ slug })), { onConflict: 'slug' }),
  );

  const stickerId = await mapBySlug('stickers');
  const tagId = await mapBySlug('tags');
  const links = products.flatMap((p) =>
    p.searchTags.map((t) => ({ sticker_id: stickerId[p.id], tag_id: tagId[t] })),
  );
  check(
    `sticker_tags (${links.length})`,
    await sb.from('sticker_tags').upsert(links, { onConflict: 'sticker_id,tag_id', ignoreDuplicates: true }),
  );

  // ── packs (upsert + borra los que ya no estén en packs.json) ──
  check(
    `packs (${packs.length})`,
    await sb.from('packs').upsert(
      packs.map((p, i) => ({
        slug: p.id,
        badge_label: p.label,
        name: p.name,
        description: p.description,
        image_url: p.image,
        price: p.price,
        sort_order: i,
      })),
      { onConflict: 'slug' },
    ),
  );
  const stalePacks = await sb.from('packs').delete().not(
    'slug', 'in', `(${packs.map((p) => p.id).join(',')})`,
  );
  if (stalePacks.error) console.error('✗ limpiando packs viejos:', stalePacks.error.message);

  console.log('\n✓ Listo.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
