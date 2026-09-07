# Cómo agregar (o quitar) un sticker

> Documento interno. Procedimiento completo: qué archivos tocar, dónde va la
> imagen, y qué pasa si te equivocás de carpeta.

---

## TL;DR — checklist

1. **Imagen** → `public/img/<carpeta-según-categoría>/<nombre-kebab-case>.png`
   (los sprites de Fortnite NO llevan imagen local, usan URL de `fortnite.gg`).
2. **Dato** → agregar un objeto a `src/content/products.json`.
3. **Subir a la BD** → `npm run seed`.
4. **(opcional) seed local** → `npm run gen:seed`.
5. **Publicar** → `git add -A && git commit -m "catálogo: +<sticker>" && git push`
   (el build hornea el catálogo; sin deploy no se ve en producción).
6. **Verificar** → abrir el sitio, buscar el sticker, revisar que la imagen carga.

---

## 1. La imagen

### Dónde va

`public/` se copia **tal cual** a `dist/` (Astro no procesa nada de ahí). Una
imagen en `public/img/dev/foo.png` queda servida en
`https://stikersvault.com/img/dev/foo.png`.

| Categoría | Carpeta | Campo `image` en el JSON |
|---|---|---|
| `meme` | `public/img/random/` | `/img/random/foo.png` |
| `dev` | `public/img/dev/` | `/img/dev/foo.png` |
| `fortnite` | — (no se sube imagen) | URL completa `https://fortnite.gg/img/x/sprites/icons/....webp` |

Otras carpetas existentes y para qué son (no meter stickers ahí):
`public/img/banner/` (banners del home), `public/img/vinil/` (texturas de
vinilo del Pack Personalizado), `public/img/packs/` (portadas de packs),
`public/img/icons/` (favicons/PWA).

### Nombre del archivo

- **Solo ASCII**, minúsculas, `kebab-case`, sin espacios ni acentos.
  `sticker-gato-programador.png` ✔ · `Sticker Gato Ñoño.png` ✘
  (los archivos con acento en `public/img/vinil/` ya dieron problemas de
  encoding en git — no repetirlo).
- Formato: `.png` (con transparencia) o `.webp`. Evitar `.jpg` para stickers.
- Peso: comprimir antes de subir. Apuntar a **< 200 KB** y ~800 px de lado
  mayor. `public/` no se optimiza: lo que subís es lo que descarga el
  visitante.

---

## 2. ¿Y si dejo la imagen en `public/img/` (la raíz)?

**Respuesta corta:** funciona, siempre que el campo `image` apunte
exactamente ahí (`/img/foo.png`). La subcarpeta es **convención**, no una
regla que el código imponga.

**Qué pasa exactamente:**

| Situación | Resultado |
|---|---|
| Imagen en `public/img/foo.png` **y** `image: "/img/foo.png"` | ✅ Carga bien. Nada se rompe. |
| Imagen en `public/img/random/foo.png` pero `image: "/img/foo.png"` | ❌ Imagen rota → el `onerror` de las tarjetas la deja al 25 % de opacidad. **No hay crash, el build no falla.** |
| Imagen en cualquier lado pero `image` con typo | ❌ Igual que arriba: rota y difuminada, silenciosa. |
| Categoría o rareza inválida en el JSON | 🛑 **`astro build` FALLA** (lo valida Zod). Esto sí se detecta. |

O sea: **el sistema no valida que la imagen exista** en la carpeta "correcta"
ni en ninguna. Lo único que importa técnicamente es que `image` y la ruta
real del archivo coincidan.

**Por qué usar la subcarpeta igual:**
- Orden: `random/` ya tiene los memes, `dev/` los de tech. Mezclar todo en la
  raíz hace imposible encontrar nada en 6 meses.
- Evita colisiones de nombre entre categorías.
- La raíz de `public/img/` está reservada para cosas sueltas del sitio
  (logo, etc.), no para catálogo.
- Si algún día se migran las imágenes a Supabase Storage o a un CDN, tenerlas
  agrupadas por carpeta hace la migración trivial.

**Regla práctica:** poné la imagen en la carpeta de su categoría y que el
`image` del JSON coincida. Si por lo que sea la dejás en la raíz, el `image`
tiene que ser `/img/<archivo>` y andará — pero no lo hagas.

---

## 3. El dato — `src/content/products.json`

Es un array. Agregá un objeto con esta forma:

```json
{
  "id": "dev-gato-programador",
  "name": "Gato Programador",
  "image": "/img/dev/gato-programador.png",
  "category": "dev",
  "rarity": null,
  "rarityLabel": "Dev",
  "price": 1,
  "searchTags": ["dev", "code", "gato", "programacion"]
}
```

| Campo | Tipo / valores | Reglas |
|---|---|---|
| `id` | string `kebab-case` | **único**. Convención: `<categoria>-<nombre>`. Es el `slug` en la BD y el `data-id` de la tarjeta. No cambiarlo después (rompe pedidos históricos que lo referencian). |
| `name` | string | Nombre visible. |
| `image` | string | Ruta `/img/...` (meme/dev) o URL `https://...` (fortnite). Debe coincidir con el archivo real. |
| `category` | slug de una fila de `categories` (`fortnite` / `meme` / `dev` / …) | **No es un enum.** Si el slug no existe en la tabla `categories`, el loader descarta ese sticker (con warn) en el build. Categoría nueva: §6. |
| `rarity` | `"mythic"` \| `"legendary"` \| `"epic"` \| `"rare"` \| `"special"` \| `null` | `null` para meme y dev. Obligatorio (uno de los 5) para fortnite. |
| `rarityLabel` | string \| `null` | Etiqueta que se muestra. `"Meme"`, `"Dev"`, o `"Mítico"`/`"Legendario"`/`"Épico"`/`"Raro"`/`"Special"`. |
| `price` | número | En soles. Hoy todos a `1`. El pack de 10 se cobra aparte (`store_config.pack_price`). |
| `searchTags` | array de strings | Términos por los que se encuentra en el buscador. Minúsculas. Reutilizá los que ya usan los de su categoría. |

### Recetas por categoría

**Meme**
```json
{ "id": "meme-<nombre>", "name": "<Nombre>", "image": "/img/random/<archivo>.png",
  "category": "meme", "rarity": null, "rarityLabel": "Meme",
  "price": 1, "searchTags": ["meme", "memes", "random"] }
```
Imagen → `public/img/random/`.

**Dev / Tech**
```json
{ "id": "dev-<nombre>", "name": "<Nombre>", "image": "/img/dev/<archivo>.png",
  "category": "dev", "rarity": null, "rarityLabel": "Dev",
  "price": 1, "searchTags": ["dev", "code", "programacion", "developer", "coding", "tech", "codigo"] }
```
Imagen → `public/img/dev/`.

**Fortnite (sprite)**
```json
{ "id": "fortnite-<nombre>", "name": "<Nombre>",
  "image": "https://fortnite.gg/img/x/sprites/icons/T_Icon_....webp",
  "category": "fortnite", "rarity": "epic", "rarityLabel": "Épico",
  "price": 1, "searchTags": ["fornite", "sprites", "battle royale", "espiritus"] }
```
Sin archivo local. `rarity` + `rarityLabel` van juntos y coherentes:
`mythic`→`Mítico`, `legendary`→`Legendario`, `epic`→`Épico`, `rare`→`Raro`,
`special`→`Special`. El filtro por rareza del Pack Personalizado usa el slug
(`rarity`), así que tiene que ser uno de los 5 exactos.

---

## 4. Subir el cambio a Supabase

```bash
npm run seed
```

`scripts/seed-supabase.mjs` lee los JSON y hace **upsert idempotente** (por
`slug`) de categorías, rarezas, finishes, `store_config`, **stickers**, tags,
`sticker_tags` y packs. Correrlo de más no rompe nada. Necesita
`SUPABASE_SERVICE_ROLE_KEY` en `.env`.

Salida esperada:
```
✓ stickers (127)
✓ tags (15)
✓ sticker_tags (520)
...
```

---

## 5. Seed local (solo si usás Docker)

`supabase/seed.sql` (lo usa `supabase db reset`) está **generado**. Tras
tocar el JSON:

```bash
npm run gen:seed        # regenera supabase/seed.sql desde el JSON
```

Alternativa: no regenerar y correr `npm run seed` apuntando `.env` al
Supabase local. Si no usás `supabase start`, ignorá este paso.

---

## 5b. ¿Puedo hacerlo solo en la base de datos, sin tocar el repo?

**Código: nunca se toca** (categoría nueva incluida — §6). Pero "solo imagen +
fila en `stickers`" todavía **no alcanza**, por dos motivos independientes:

### Motivo 1 — la imagen no vive en la BD

`public/img/...` **es el repo**, y GitHub Pages **no sirve archivos del
repo**: sirve solo el *artifact* que subió el último workflow. El recorrido:

```
public/img/foo.png (en main)  ──[npm run build copia public/→dist/]──▶  dist/img/foo.png
   ──[upload-pages-artifact]──▶  artifact  ──[deploy-pages]──▶  stikersvault.com/img/foo.png
```

Sin ese build+deploy, la imagen commiteada da **404**. Para saltarte el repo
con la imagen: usá una **URL externa** o **Supabase Storage** en
`stickers.image_url` (cero repo). Aun así, sigue el motivo 2.

### Motivo 2 — el catálogo se hornea en el build

El navegador **nunca consulta la tabla `stickers`**. El flujo real:

1. `astro build` ejecuta `getCollection('products')` → dispara
   `src/loaders/supabase.ts`, que en ese momento hace
   `SELECT ... FROM stickers WHERE is_active`.
2. `src/pages/index.astro` serializa el resultado y lo incrusta en el HTML:
   ```astro
   <script type="application/json" id="catalog-json" set:html={JSON.stringify(catalog)} />
   ```
3. En el navegador, `src/scripts/catalog.js` hace
   `readJSON('catalog-json', [])` — lee ese bloque del DOM, **no llama a
   Supabase**. Igual `#sprites-json` (`/drop`) y `#pricing-json`.

⇒ Una fila nueva en Supabase es **invisible hasta el próximo build**. El
`SELECT` corre **una vez, en GitHub Actions**, no una vez por visitante.

**Por qué está así:** el sitio es estático — carga instantánea, funciona aun
si Supabase se cae, cacheable como HTML, sin rate limits ni scraping del
catálogo. El precio es exactamente este: contenido nuevo = redeploy.

### Entonces, el mínimo real

| | Con la imagen en `public/` | Con la imagen externa / Storage |
|---|---|---|
| Fila en `stickers` (+ tags) | ✅ (dashboard o SQL) | ✅ |
| `products.json` | recomendado (si no, JSON y BD divergen) | recomendado |
| Commit + push | ✅ (dispara todo) | ❌ no hace falta |
| Disparar un deploy | ✅ (lo hace el push) | ✅ **a mano** |

**Disparar un deploy sin commit:** GitHub → *Actions* → "Deploy to GitHub
Pages" → **Run workflow**. O `git commit --allow-empty -m "rebuild" && git push`.

> Para llegar a "solo la BD y nada más" habría que **cambiar código una vez**:
> mover el catálogo a lectura en runtime (el navegador consulta Supabase al
> cargar) + imágenes en Storage. Se pierde el horneado en build (velocidad,
> tolerancia a caídas). No recomendado para este tamaño de proyecto.

---

## 6. Agregar una categoría nueva (p. ej. `anime`)

**No se toca código.** La lista de categorías vive en la BD (tabla
`categories`) y en `src/content/categories.json` — no hay ningún enum.

1. **`src/content/categories.json`** → agregar una línea:
   ```json
   { "id": "anime", "name": "Anime", "sortOrder": 4 }
   ```
2. **Carpeta de imágenes** → crear `public/img/anime/` (o usar URL externa /
   Storage en `image_url`).
3. Agregar los stickers a `products.json` con `"category": "anime"`.
4. `npm run seed` → sube la categoría **y** los stickers.
   *(o por curl: `POST /rest/v1/categories` + `POST /rest/v1/stickers`, ver
   `docs/local/pruebas-supabase.md`.)*
5. `npm run gen:seed` (opcional, para dev local con Docker).
6. `git add -A && git commit && git push` → deploy.

Qué pasa si un sticker apunta a una categoría que **no existe** en
`categories`: el loader (`src/loaders/supabase.ts`) lo **descarta con un
`console.warn`** en el build — no rompe nada, pero ese sticker no aparece.
Es la red de seguridad que reemplazó al enum.

> Cosmético: `src/scripts/catalog.js` tiene `FIRST_PAGE_MIX = {meme:3, dev:3}`
> (cuántos de cada categoría entran en la primera pantalla del home). Es
> opcional y solo afecta el orden inicial; una categoría nueva funciona sin
> tocarlo.

---

## 7. Qué rompe el build (y qué no)

| Error en el JSON | ¿Falla `astro build`? |
|---|---|
| `rarity` fuera del enum (`mythic`/`legendary`/`epic`/`rare`/`special`/`null`) | 🛑 Sí (Zod) |
| `price` como string `"1"` en vez de número | 🛑 Sí (Zod) |
| Falta un campo obligatorio | 🛑 Sí (Zod) |
| JSON mal formado (coma de más, etc.) | 🛑 Sí |
| `category` que no existe en la tabla `categories` | ⚠️ Build pasa; el loader **descarta** ese sticker con un warn en el log |
| `id` duplicado | ⚠️ Build pasa; en Supabase el upsert **pisa** el anterior |
| `image` apunta a un archivo que no existe | ❌ Build pasa; imagen rota en runtime (difuminada) |
| Imagen en carpeta equivocada | ❌ Igual: build pasa, imagen rota |

El build **no** verifica imágenes. Esa verificación es manual (paso 6 del
checklist).

---

## 8. Verificar

1. `npm run build` local → no debe tirar error de Zod.
2. `npm run dev` → home: buscá el sticker por nombre y por tag. Revisá que la
   imagen carga (si sale difuminada, la ruta `image` no coincide con el
   archivo).
3. Fortnite: abrí `/drop` → "Diseñar pack" → filtrá por la rareza que le
   pusiste, tiene que aparecer.
4. Tras `npm run seed`: en Supabase → Table Editor → `stickers`, buscá el
   `slug`. Y `sticker_tags` para las etiquetas.
5. Tras el deploy: abrí `stikersvault.com` en incógnito.

---

## 9. Quitar u ocultar un sticker

**Ocultar (recomendado)** — dejarlo en el catálogo pero fuera del sitio:
```sql
update public.stickers set is_active = false where slug = 'dev-gato-programador';
```
RLS deja de mostrarlo a los visitantes. Los pedidos que lo referencian
siguen intactos (tienen snapshot). Para que no vuelva con el próximo
`npm run seed`, quitá también el objeto del `products.json` — el seed no
borra, solo hace upsert, así que sacarlo del JSON + `is_active=false` es la
combinación correcta.

**Borrar de verdad:**
```sql
delete from public.stickers where slug = 'dev-gato-programador';
```
Falla si algún `order_items.sticker_id` lo referencia (FK). En ese caso,
ocultalo en vez de borrarlo. Quitá también el objeto del JSON y la imagen de
`public/img/...`.

---

## 10. Resumen de archivos

| Acción | Archivo(s) |
|---|---|
| Imagen (meme) | `public/img/random/<archivo>.png` |
| Imagen (dev) | `public/img/dev/<archivo>.png` |
| Imagen (fortnite) | ninguno (URL externa) |
| Dato del sticker | `src/content/products.json` |
| Categoría nueva | `src/content/categories.json` (+ carpeta `public/img/<slug>/`) — **sin código** |
| Subir a Supabase | `npm run seed` |
| Seed local | `npm run gen:seed` (regenera `supabase/seed.sql`) |
| Publicar | `git commit` + `git push` → GitHub Actions → Pages |
