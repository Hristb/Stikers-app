# Documentación técnica — Sticker Vault

> Interna. Para entender cómo está armado el proyecto. No se publica.

| Documento | Contenido |
|---|---|
| [`arquitectura.md`](./arquitectura.md) | Visión general, principios, diagramas de componentes y despliegue, los dos flujos (catálogo en build / pedido en runtime), stack, estructura de carpetas, qué queda fuera a propósito. |
| [`modelo-de-datos.md`](./modelo-de-datos.md) | Diagrama entidad-relación, enumerados, **diccionario de datos** completo (15 tablas), triggers/funciones/secuencias, reglas de negocio del esquema, mapeo tabla → JSON del front. |
| [`especificacion-tecnica.md`](./especificacion-tecnica.md) | Contrato de la RPC `create_order` (entrada/salida/errores/algoritmo), loader de catálogo, cliente del navegador, **modelo RLS** (políticas + matriz de permisos + análisis de abuso), variables de entorno, operaciones (migraciones, seed, deploy, admins, rotación), extensiones futuras. |
| [`agregar-un-sticker.md`](./agregar-un-sticker.md) | Procedimiento paso a paso: qué archivo tocar, en qué carpeta va la imagen, qué pasa si te equivocás de carpeta, recetas por categoría, agregar categoría nueva, ocultar/borrar, qué rompe el build. |
| `local/` *(no versionado — `.gitignore`)* | `pruebas-supabase.md` (curl para probar la API/RPC/RLS) + `sticker-vault.postman_collection.json` (importable en Postman). Contienen keys, por eso no se suben. |

## Mapa rápido

```
Editar catálogo        → src/content/*.json  →  npm run seed  →  Supabase  →  (deploy hornea)
Cambiar esquema        → supabase/migrations/*.sql  →  npm run db:push
Registrar un pedido    → navegador → window.Checkout → rpc('create_order') → Postgres
Ver pedidos            → Supabase Dashboard → Table Editor
```

## Fuentes de verdad (si este doc y el código difieren, gana el código)

- Esquema: `supabase/migrations/2026090512000{1,2,3}_*.sql`
- Loader: `src/loaders/supabase.ts` + `src/content.config.ts`
- Checkout: `src/scripts/{checkout,supabase-client,cart,mystery-pack,customize-pack}.js`
- Deploy: `.github/workflows/deploy-pages.yml`
- Variables: `.env.example`

Proyecto Supabase: `ctlwwuleysaiqodwxkqb` · Admin: `hristbartra@gmail.com`
