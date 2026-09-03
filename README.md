# Sticker Vault

Tienda de stickers (memes, tech y gaming) en una sola página estática.
Los pedidos se cierran por WhatsApp. Publicada con GitHub Pages en
**https://stikersvault.com**.

## Estructura

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Home / catálogo de stickers individuales + sección Packs. Es la página que carga al entrar. |
| `drop.html` | Página "Drop": Pack Sorpresa y Pack Personalizado. Se enlaza como `drop.html`. |
| `404.html` | Página de error de GitHub Pages; regresa al inicio. |
| `styles.css` | Todos los estilos (tema oscuro "Tech Minimalist"). |
| `script.js` | Datos de stickers + lógica del catálogo, Pack Sorpresa y Pack Personalizado. |
| `cart.js` | Carrito de stickers individuales y checkout por WhatsApp (`localStorage`: `sv_cart_v1`). |
| `ui.js` | Inyecta el footer, el overlay del carrito y el toast en todas las páginas. |
| `analytics.js` | Envoltura de analítica (Plausible). Registra búsquedas del catálogo. |
| `site.webmanifest` | Manifiesto PWA. Iconos en `img/icons/`. |
| `robots.txt`, `sitemap.xml` | SEO. |
| `CNAME` | Dominio personalizado. |
| `img/` | Imágenes: `random/` (memes), `dev/`, `vinil/` (acabados), `packs/`, `banner/`, `icons/`. |

## Cómo agregar stickers

**Meme** → copia la imagen a `img/random/` y agrega una línea en `MEME_STICKERS` (`script.js`).

**Dev/Tech** → copia la imagen a `img/dev/` y agrega una línea en `DEV_STICKERS` (`script.js`).

**Fortnite (sprites)** → agrega un objeto en `SPRITES` (`script.js`) con `name`, `img`
(nombre del archivo en `fortnite.gg`) y `rarity` (`mythic` | `legendary` | `epic` | `rare` | `special`).

**Acabado de vinil** (Pack Personalizado) → agrega la imagen a `img/vinil/` y una
entrada en `FINISHES` (`script.js`).

Los tags de búsqueda por categoría están en `CATEGORY_SEARCH_TAGS` (`script.js`).

## Precios

Definidos en `cart.js`: sticker suelto `S/ 1.00`; cada 10 en el carrito se cobran
como pack a `S/ 8.50`. El número de WhatsApp está en `script.js` (`WA`) y en
`ui.js` (`LINKS.whatsapp`).

## Analítica

`analytics.js` usa [Plausible](https://plausible.io) (sin cookies, sin banner).
Para activarla: crea el sitio `stikersvault.com` en tu panel de Plausible — el
`<script>` ya está en el `<head>` de `index.html` y `drop.html`. Se registra el
evento `Search` con la categoría y el término buscado.
Para usar Google Analytics: pon el snippet de GA4 en el `<head>` y ajusta
`track()` en `analytics.js`.

## Desarrollo local

Es HTML estático, pero necesita un servidor para que funcionen los `fetch` de
iconos y las rutas sin `.html`:

```bash
python -m http.server 8000
# abre http://localhost:8000
```

## Deploy

`git push` a `main`. El workflow `.github/workflows/deploy-pages.yml` publica el
sitio completo en GitHub Pages automáticamente.
