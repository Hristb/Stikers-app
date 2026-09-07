/* ── Regenera supabase/seed.sql desde src/content/*.json ──
   `supabase/seed.sql` solo lo usa `supabase db reset` (desarrollo local con
   Docker). La fuente de verdad del catálogo es src/content/*.json; este
   script vuelca ese catálogo a INSERTs idempotentes.

   Uso:  node scripts/gen-seed-sql.mjs      (o: npm run gen:seed)

   Para staging / producción NO se usa esto — se usa `npm run seed`
   (scripts/seed-supabase.mjs), que hace upsert vía la API. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p) => JSON.parse(readFileSync(root + p, 'utf8'));
const products = read('src/content/products.json');
const packs = read('src/content/packs.json');
const categories = read('src/content/categories.json');

const q = (s) => (s === null || s === undefined ? 'null' : `'${String(s).replace(/'/g, "''")}'`);

let out = `-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  seed.sql · catálogo completo para desarrollo local                   ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- GENERADO por scripts/gen-seed-sql.mjs — no editar a mano.
-- Se ejecuta con \`supabase db reset\` (después de las migraciones).
-- Fuente: src/content/*.json. Para staging/producción usar \`npm run seed\`.
-- rarities / finishes / store_config los siembra la migración 0001. Las
-- categorías salen de src/content/categories.json (además de las 3 base de
-- la migración) para soportar categorías nuevas en dev local.

`;

out += `insert into public.categories (slug, name, sort_order) values\n`;
out += categories
  .map((c, i) => `  (${q(c.id)}, ${q(c.name)}, ${c.sortOrder ?? i})`)
  .join(',\n');
out += `\non conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;\n\n`;

out += `insert into public.stickers (slug, name, image_url, category_id, rarity_id, rarity_label, price, sort_order) values\n`;
out += products
  .map((p, i) => {
    const cat = `(select id from public.categories where slug = ${q(p.category)})`;
    const rar = p.rarity ? `(select id from public.rarities where slug = ${q(p.rarity)})` : 'null';
    return `  (${q(p.id)}, ${q(p.name)}, ${q(p.image)}, ${cat}, ${rar}, ${q(p.rarityLabel)}, ${p.price}, ${i})`;
  })
  .join(',\n');
out += `\non conflict (slug) do update set
  name = excluded.name, image_url = excluded.image_url, category_id = excluded.category_id,
  rarity_id = excluded.rarity_id, rarity_label = excluded.rarity_label,
  price = excluded.price, sort_order = excluded.sort_order;\n\n`;

const tags = [...new Set(products.flatMap((p) => p.searchTags))].sort();
out += `insert into public.tags (slug) values\n`;
out += tags.map((t) => `  (${q(t)})`).join(',\n');
out += `\non conflict (slug) do nothing;\n\n`;

out += `insert into public.sticker_tags (sticker_id, tag_id)\nselect s.id, t.id from (values\n`;
out += products
  .flatMap((p) => p.searchTags.map((tag) => `  (${q(p.id)}, ${q(tag)})`))
  .join(',\n');
out += `\n) as v(sticker_slug, tag_slug)
join public.stickers s on s.slug = v.sticker_slug
join public.tags t on t.slug = v.tag_slug
on conflict do nothing;\n\n`;

out += `insert into public.packs (slug, badge_label, name, description, image_url, price, sort_order) values\n`;
out += packs
  .map((p, i) => `  (${q(p.id)}, ${q(p.label)}, ${q(p.name)}, ${q(p.description)}, ${q(p.image)}, ${p.price}, ${i})`)
  .join(',\n');
out += `\non conflict (slug) do update set
  badge_label = excluded.badge_label, name = excluded.name, description = excluded.description,
  image_url = excluded.image_url, price = excluded.price, sort_order = excluded.sort_order;\n`;

writeFileSync(root + 'supabase/seed.sql', out);
const pairs = products.reduce((n, p) => n + p.searchTags.length, 0);
console.log(`✓ supabase/seed.sql — ${products.length} stickers, ${tags.length} tags, ${pairs} sticker_tags, ${packs.length} packs`);
