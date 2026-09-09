# Arquitectura — Sticker Vault

> Documento interno. No se publica. Estado: 2026-09-05, rama `astro-migration`.

## 1. Resumen en una frase

Sitio **estático** (Astro → HTML/JS/CSS en GitHub Pages) que consume un
backend **Supabase** de dos formas: el **catálogo** se hornea en tiempo de
build, y los **pedidos** se registran desde el navegador a través de una
única función RPC antes de derivar la venta a WhatsApp.

## 2. Principios de diseño

| Principio | Cómo se aplica |
|---|---|
| **El sitio sigue siendo estático** | No hay servidor propio ni SSR. Todo lo dinámico lo resuelve el navegador contra Supabase o se resuelve en build. |
| **La `anon key` es pública** | Va en el bundle. La seguridad NO depende de ocultarla, depende de RLS + una RPC `SECURITY DEFINER`. |
| **El JSON es la fuente editable + el respaldo** | `src/content/*.json` se sigue versionando. Si Supabase no está configurado o no responde, el build usa el JSON. |
| **El servidor manda en el precio** | `create_order()` recalcula el total desde `stickers` / `store_config`. El navegador no puede falsear importes. |
| **La venta nunca se bloquea** | Si el registro del pedido falla, igual se abre WhatsApp (sin número de pedido). |
| **Snapshots en los pedidos** | Cada línea de pedido guarda nombre/precio/imagen del momento. Cambiar el catálogo no altera pedidos históricos. |

## 3. Diagrama de componentes

```mermaid
flowchart TB
    subgraph Dev["Edición de contenido"]
        JSON["src/content/*.json<br/>(products, packs, finishes, pricing)"]
        SEED["scripts/seed-supabase.mjs<br/>(npm run seed)"]
        MIG["supabase/migrations/*.sql"]
    end

    subgraph CI["GitHub Actions (build & deploy)"]
        BUILD["astro build"]
        LOADER["src/loaders/supabase.ts<br/>lee catálogo · fallback a JSON"]
    end

    subgraph Pages["GitHub Pages (estático)"]
        HTML["index.html · drop.html · 404.html"]
        BUNDLE["_astro/*.js<br/>(incluye @supabase/supabase-js<br/>+ PUBLIC_SUPABASE_URL/ANON_KEY)"]
    end

    subgraph SB["Supabase (proyecto ctlwwuleysaiqodwxkqb)"]
        REST["PostgREST /rest/v1<br/>(rol anon)"]
        RPC["RPC public.create_order()<br/>SECURITY DEFINER"]
        DB[("PostgreSQL<br/>catálogo + pedidos + RLS")]
        AUTH["Auth (futuro panel admin)"]
    end

    Visitor(["Visitante<br/>(navegador)"])
    WA(["WhatsApp<br/>wa.me/51905888108"])

    JSON --> SEED --> DB
    MIG -->|supabase db push| DB
    JSON -.fallback.-> LOADER
    LOADER -->|SELECT catálogo| REST
    REST --> DB
    LOADER --> BUILD --> HTML & BUNDLE

    Visitor -->|carga| HTML
    Visitor -->|"lee catálogo ya horneado"| HTML
    Visitor -->|"rpc('create_order')"| RPC --> DB
    Visitor -->|"abre pedido"| WA
    AUTH -.-> DB
```

## 4. Diagrama de despliegue

```mermaid
flowchart LR
    subgraph GH["GitHub"]
        REPO["repo público<br/>(sin secretos)"]
        ACT["Actions<br/>secrets: PUBLIC_SUPABASE_URL,<br/>PUBLIC_SUPABASE_ANON_KEY"]
        PAGES["Pages<br/>stikersvault.com"]
    end
    subgraph SUPA["Supabase Cloud"]
        PG[("Postgres")]
        PGRST["PostgREST"]
        GOTRUE["GoTrue (Auth)"]
    end
    LOCAL["Máquina local<br/>.env (git-ignorado):<br/>service_role, access token, db pass"]

    REPO --> ACT --> PAGES
    LOCAL -->|supabase db push| PG
    LOCAL -->|npm run seed| PGRST
    PAGES -->|navegador del visitante| PGRST
    PGRST --> PG
    GOTRUE --> PG
```

## 5. Flujo A — Lectura del catálogo (build time)

```mermaid
sequenceDiagram
    participant CI as astro build
    participant L as loaders/supabase.ts
    participant SB as Supabase REST
    participant J as src/content/*.json
    participant Out as dist/*.html

    CI->>L: getCollection('products' | 'packs' | 'finishes' | 'pricing')
    alt PUBLIC_SUPABASE_URL + ANON_KEY presentes
        L->>SB: SELECT stickers + categories + rarities + sticker_tags(tags)
        alt respuesta OK y > 0 filas
            SB-->>L: filas
            L->>L: map fila → forma del JSON ({id,name,image,category,rarity,rarityLabel,price,searchTags})
        else error / 0 filas
            L->>J: readFile()
            J-->>L: array JSON (respaldo)
        end
    else sin credenciales
        L->>J: file(jsonPath) (loader nativo de Astro)
    end
    L-->>CI: entradas validadas con schema Zod
    CI->>Out: HTML con el catálogo embebido<br/>(#catalog-json, #sprites-json, #pricing-json, ...)
```

**Consecuencia operativa:** cambiar datos en Supabase **no** se ve en
producción hasta el siguiente deploy. Para refrescar: `npm run seed` (si
editaste el JSON) y luego push / *Run workflow*.

## 6. Flujo B — Registro de un pedido (runtime)

```mermaid
sequenceDiagram
    actor U as Visitante
    participant Cart as cart.js / mystery-pack.js / customize-pack.js
    participant CO as checkout.js (window.Checkout)
    participant Ov as CheckoutOverlay (form: nombre + WhatsApp)
    participant SC as supabase-client.js
    participant RPC as create_order() [SECURITY DEFINER]
    participant DB as Postgres
    participant WA as WhatsApp

    U->>Cart: "Pedir por WhatsApp" / "Comprar" / "Confirmar pack"
    Cart->>CO: recordOrderAndOpenWhatsApp({ items, buildMessage, closeOverlayId })
    CO->>Ov: openOv('checkout-overlay')
    U->>Ov: nombre + teléfono → submit
    Ov-->>CO: { full_name, phone }  (o null si cancela)
    alt Supabase configurado
        CO->>SC: sbCreateOrder({ customer, items, whatsappMessage })
        SC->>RPC: rpc('create_order', { p_customer, p_items, p_meta })
        RPC->>DB: upsert customer (por phone)
        RPC->>DB: insert order (order_number = SV-XXXXXX vía trigger)
        RPC->>DB: insert order_items (precios y snapshots DESDE la BD)
        RPC->>DB: insert order_item_components (packs)
        RPC->>DB: recalcula total (bundling) + update order
        RPC->>DB: insert order_events('created')
        RPC-->>SC: { order_number, total, currency, whatsapp_number }
        SC-->>CO: idem
        CO->>CO: mensaje = "*Pedido SV-000123*\n\n" + mensaje base
    else Supabase caído / no configurado
        CO->>CO: console.warn — sigue sin número de pedido
    end
    CO->>WA: window.open(wa.me + mensaje)
    CO->>Cart: true → Cart.clear()
```

## 7. Stack

| Capa | Tecnología |
|---|---|
| Front | Astro 7 (`build.format:'file'`, sin adapter), Tailwind 4, JS vanilla (módulos ES bundleados) |
| Contenido | Astro Content Layer (`defineCollection` + Zod), loaders propios |
| Backend | Supabase: PostgreSQL 15+, PostgREST, GoTrue |
| Cliente DB | `@supabase/supabase-js` v2 (build-time y browser) |
| Infra | GitHub Pages + GitHub Actions; dominio propio `stikersvault.com` |
| Analítica | Plausible (sin cookies) |
| Pago | Manual por WhatsApp (`wa.me/51905888108`) |

## 8. Estructura de carpetas relevante

```
src/
  content.config.ts        colecciones (schema Zod) — loader = Supabase|JSON
  content/*.json           catálogo editable a mano + respaldo de build
  loaders/supabase.ts      loader de catálogo con fallback
  scripts/
    shared.js              WA, openOv/closeOv, showToast, SPRITES (globales)
    supabase-client.js     createClient(anon) + sbCreateOrder()
    checkout.js            window.Checkout: form nombre+tel + registro + WhatsApp
    cart.js                carrito (localStorage sv_cart_v2, guarda slug)
    catalog.js             grid/búsqueda del home + vista rápida (openSticker)
    mystery-pack.js        Pack Sorpresa  → kind 'pack_sorpresa'
    customize-pack.js      Pack Personalizado → kind 'pack_personalizado'
  components/
    CheckoutOverlay.astro  modal nombre + WhatsApp (común a los 3 flujos)
    StickerOverlay.astro   vista rápida de un sticker (la llena catalog.js)
  layouts/BaseLayout.astro carga: analytics → shared → checkout → cart
scripts/
  seed-supabase.mjs        JSON → Supabase (npm run seed, usa service_role)
supabase/
  config.toml
  migrations/2026090512000{1,2,3}_*.sql
  seed.sql                 catálogo completo para `supabase db reset` local
docs/                      este directorio
```

## 9. Qué NO está resuelto (a propósito)

- **Panel de administración**: la tabla `admins` y `is_admin()` están listas,
  pero no hay UI ni login en el sitio. Hoy se gestionan pedidos desde el
  Table Editor de Supabase.
- **Estados del pedido**: `orders.status` existe (`pendiente` → … →
  `entregado`) pero se cambia a mano en Supabase.
- **Notificaciones**: no hay webhook / email al entrar un pedido. Se podría
  añadir con Supabase Database Webhooks o un trigger → Edge Function.
- **Pagos**: intencionalmente manual por WhatsApp (requisito de negocio). El
  `PAYMENT_CHANNELS` de `cart.js` deja lugar para añadir Yape/Plin/tarjeta.
- **Stock**: `stickers` no lleva inventario (hay columna prevista pero sin uso).
