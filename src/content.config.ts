// Catálogo modelado como recursos de API: cada colección se lee de Supabase
// en build (src/loaders/supabase.ts) y, si Supabase no está configurado,
// cae al JSON local de src/content/. La forma (id único, campos tipados,
// validados con Zod) es idéntica en ambos casos — nada que consuma
// `getCollection()` en las páginas/componentes necesita tocarse.
import { defineCollection, z } from 'astro:content';
import {
  productsLoader,
  packsLoader,
  finishesLoader,
  pricingLoader,
  categoriesLoader,
} from './loaders/supabase';

// La lista de categorías vive en la BD (tabla `categories`) / en
// src/content/categories.json — NO en este enum. Agregar una categoría no
// requiere tocar código: basta un registro en `categories` + stickers que
// la referencien. El loader de `products` descarta (con warn) cualquier
// sticker cuya categoría no exista.
const products = defineCollection({
  loader: productsLoader,
  schema: z.object({
    name: z.string(),
    image: z.string(),
    category: z.string(),
    rarity: z.enum(['mythic', 'legendary', 'epic', 'rare', 'special']).nullable(),
    rarityLabel: z.string().nullable(),
    price: z.number(),
    searchTags: z.array(z.string()),
  }),
});

const categories = defineCollection({
  loader: categoriesLoader,
  schema: z.object({
    name: z.string(),
    sortOrder: z.number(),
  }),
});

const packs = defineCollection({
  loader: packsLoader,
  schema: z.object({
    label: z.string(),
    name: z.string(),
    description: z.string(),
    image: z.string(),
    price: z.number(),
  }),
});

const finishes = defineCollection({
  loader: finishesLoader,
  schema: z.object({
    label: z.string(),
    image: z.string(),
  }),
});

const pricing = defineCollection({
  loader: pricingLoader,
  schema: z.object({
    unitPrice: z.number(),
    packSize: z.number(),
    packPrice: z.number(),
  }),
});

export const collections = { products, packs, finishes, pricing, categories };
