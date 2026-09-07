# Sticker Vault

Tienda de stickers (memes, tech y gaming). Sitio construido con
[Astro](https://astro.build) + [Tailwind](https://tailwindcss.com), generado
como HTML estático y publicado con GitHub Pages en
**https://stikersvault.com**. Los pedidos se cierran por WhatsApp.

## Estructura

| Ruta | Para qué sirve |
|---|---|
| `src/pages/index.astro` | Home / catálogo de stickers individuales + sección Packs. Se sirve en `/`. |
| `src/pages/_drop.astro` | Página "Drop" (Pack Sorpresa / Personalizado) — **oculta**: el prefijo `_` hace que Astro no la compile. Reactivar = renombrar a `drop.astro` + volver a poner el link en `Header.astro` y la entrada en `sitemap.xml`. |
| `src/pages/404.astro` | Página de error de GitHub Pages; regresa al inicio. |
| `src/layouts/BaseLayout.astro` | `<head>` (meta/OG/canonical/favicon/manifest/Plausible) + Header/Footer/CartOverlay/Toast comunes a toda página. |
| `src/components/` | `Header`, `Footer`, `CartOverlay`, `CheckoutOverlay`, `StickerOverlay` (vista rápida), `Toast`, `MysteryOverlay`, `CustomizeOverlay`. |
| `src/content.config.ts` + `src/content/*.json` | El catálogo como colecciones de Astro (ver abajo). |
| `src/loaders/supabase.ts` | Loader que lee el catálogo de Supabase en build; si no hay credenciales, cae al JSON de `src/content/`. |
| `src/scripts/` | JS de interacción: `shared.js`, `checkout.js`, `supabase-client.js`, `cart.js`, `catalog.js`, `mystery-pack.js`, `customize-pack.js`, `analytics.js`. |
| `supabase/` | `config.toml`, `migrations/` (esquema versionado) y `seed.sql`. **Sin secretos.** |
| `scripts/seed-supabase.mjs` | Sube el catálogo de `src/content/*.json` a Supabase (`npm run seed`). |
| `src/styles/global.css` | `@import "tailwindcss"` + tokens de color (`@theme`) + el CSS heredado del sitio estático original. |
| `public/` | Todo lo que se copia tal cual a `dist/`: `favicon.ico`, `site.webmanifest`, `robots.txt`, `sitemap.xml`, `CNAME`, `img/`. |

## El catálogo es "como una API"

`src/content.config.ts` define 5 colecciones (`products`, `categories`, `packs`,
`finishes`, `pricing`), cada una validada con un schema Zod. Las páginas y
componentes las leen con `getCollection('products')`, sin saber de dónde salen
los datos. `products.category` es `z.string()` libre: la lista de categorías
válidas vive en la tabla `categories` / `src/content/categories.json`, no en un
enum — agregar una categoría no requiere tocar código.

El `loader` de cada colección (`src/loaders/supabase.ts`) intenta leer de
**Supabase en build**; si no hay `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY`
(o Supabase no responde), cae al JSON de `src/content/` que sigue versionado.
Así el sitio compila con o sin base de datos, y el JSON funciona como semilla
y respaldo.

Los datos de interacción en el cliente (búsqueda, filtros, Pack Sorpresa,
Pack Personalizado) se sirven al navegador como bloques
`<script type="application/json">` embebidos por cada página a partir de esa
misma colección — así los scripts (`catalog.js`, `mystery-pack.js`,
`customize-pack.js`) no dependen de un formato de archivo hardcodeado.

## Cómo agregar stickers

> Guía completa (carpeta de imagen, categoría nueva, ocultar/borrar, qué
> rompe el build): [`docs/agregar-un-sticker.md`](docs/agregar-un-sticker.md).

Todos los productos viven en `src/content/products.json`, con esta forma:

```json
{
  "id": "fortnite-john-wick",
  "name": "John Wick",
  "image": "https://fortnite.gg/img/x/sprites/icons/....webp",
  "category": "fortnite",
  "rarity": "mythic",
  "rarityLabel": "Mítico",
  "price": 1,
  "searchTags": ["fornite", "sprites", "battle royale", "espiritus"]
}
```

- **Meme** → copia la imagen a `public/img/random/` y agrega una entrada con
  `category: "meme"`, `rarity: null`, `rarityLabel: "Meme"`.
- **Dev/Tech** → copia la imagen a `public/img/dev/` y agrega una entrada con
  `category: "dev"`, `rarity: null`, `rarityLabel: "Dev"`.
- **Fortnite (sprites)** → agrega una entrada con `category: "fortnite"` y
  `rarity` en `mythic` | `legendary` | `epic` | `rare` | `special`.
- **Categoría nueva** → agrega una línea a `src/content/categories.json`
  (`{ "id": "<slug>", "name": "<Nombre>", "sortOrder": N }`) y crea
  `public/img/<slug>/`. Sin tocar código.

Acabados de vinil (Pack Personalizado) van en `src/content/finishes.json`;
los 3 packs del home en `src/content/packs.json`; las categorías en
`src/content/categories.json`.

`src/content/*.json` es la fuente editable a mano. Tras cambiarlo, corre
`npm run seed` para subirlo a Supabase (y redeploya para que producción lo
tome — ver *Base de datos*).

## Precios

`src/content/pricing.json` — `unitPrice` (sticker suelto), `packSize`
(cuántos sueltos arman un pack) y `packPrice`. `cart.js` lo lee vía
`#pricing-json`, embebido por `BaseLayout.astro`. Con Supabase esto sale de
la tabla `store_config` (fila única), que además guarda `whatsapp_number` y
`currency`. `create_order()` usa `store_config` para calcular el total real.
El número de WhatsApp del front sigue en `src/scripts/shared.js` (`WA`) y en
`src/components/Footer.astro` (`LINKS.whatsapp`).

## Base de datos (Supabase)

El catálogo y los **pedidos** (cliente + ítems de cada persona que llega a
comprar por WhatsApp) viven en Supabase. Esquema en `supabase/migrations/`:

| Grupo | Tablas |
|---|---|
| Catálogo | `categories`, `rarities`, `stickers`, `tags`, `sticker_tags`, `finishes`, `packs`, `pack_items`, `store_config` |
| Pedidos | `customers`, `orders`, `order_items`, `order_item_components`, `order_events` |
| Admin | `admins` |

**Seguridad (el repo es público):**

- `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY` son **públicas por
  diseño** — Astro las incrusta en el JS que se publica en GitHub Pages. Eso
  es normal y seguro: la protección está en **Row Level Security**, no en
  ocultar la key.
- El catálogo es de **solo lectura** para el visitante. Los pedidos **no son
  legibles ni escribibles** directamente; la única vía es la función
  `create_order()` (`SECURITY DEFINER`), que además **recalcula el total en
  el servidor** (ignora cualquier precio que mande el navegador).
- **Nunca** al repo: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`,
  `SUPABASE_DB_PASSWORD`, JWT secret. Van solo en `.env` local (git-ignorado).
  `.env.example` lista todas las variables.

### Puesta en marcha

```bash
cp .env.example .env          # y rellena PUBLIC_SUPABASE_URL + ANON_KEY

# 1. aplicar el esquema al proyecto remoto
npx supabase login            # usa SUPABASE_ACCESS_TOKEN
npx supabase link --project-ref <TU-REF>
npm run db:push               # = supabase db push

# 2. sembrar el catálogo desde src/content/*.json  (necesita SERVICE_ROLE_KEY)
npm run seed

# 3. crear el primer admin (una vez, en el SQL Editor de Supabase):
#    insert into public.admins (user_id, email)
#    select id, email from auth.users where email = 'tu-correo@ejemplo.com';
```

**Local con Docker** (opcional): `npx supabase start` levanta Postgres +
Studio; `npm run db:reset` aplica migraciones + `supabase/seed.sql`. Apunta
`.env` a `http://127.0.0.1:54321` y usa el `service_role` que imprime
`supabase start` para `npm run seed`.

### Deploy

Además de hacer `git push` a `main`, define en **Settings → Secrets and
variables → Actions** los secrets `PUBLIC_SUPABASE_URL` y
`PUBLIC_SUPABASE_ANON_KEY` (el workflow los pasa a `npm run build`). Si
faltan, el build usa el catálogo de `src/content/*.json`.

El catálogo se hornea en build: al cambiar datos en Supabase hay que
redeployar (`git commit --allow-empty` + push, o *Run workflow*) para verlo
en producción.

## Analítica

`src/scripts/analytics.js` usa [Plausible](https://plausible.io) (sin
cookies, sin banner). Para activarla: crea el sitio `stikersvault.com` en tu
panel de Plausible — el `<script>` ya está en el `<head>` (`BaseLayout.astro`).
Se registra el evento `Search` con la categoría y el término buscado.
Para usar Google Analytics: pon el snippet de GA4 en el `<head>` y ajusta
`track()` en `analytics.js`.

## Desarrollo local

```bash
npm install
npm run dev
# abre http://localhost:4321
```

`npm run build` genera el sitio estático en `dist/`; `npm run preview` lo
sirve tal cual quedaría en producción.

## Deploy

`git push` a `main`. El workflow `.github/workflows/deploy-pages.yml` instala
dependencias, corre `npm run build` y publica `dist/` en GitHub Pages
automáticamente.

**Cache:** ya no hay que preocuparse por el bug de caché de Cloudflare que
tuvimos con el sitio estático viejo (CSS/JS servidos desactualizados tras un
deploy) — Astro empaqueta el CSS y la mayoría del JS con nombre de archivo
con hash de contenido, y lo que queda inline vive dentro del HTML (cacheado
solo 10 min), así que un deploy nuevo siempre se ve reflejado sin tener que
subir manualmente ningún `?v=N`.
