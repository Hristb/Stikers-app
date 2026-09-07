/* ── Cliente Supabase para el navegador ──
   El sitio es estático: acá se usa la anon key (pública, embebida por Astro
   desde PUBLIC_SUPABASE_*). La seguridad vive en las políticas RLS y en que
   la ÚNICA escritura permitida al visitante es la RPC `create_order`
   (ver supabase/migrations/..._functions_rls.sql).

   Si no hay credenciales configuradas, `sbReady()` es false y el checkout
   sigue funcionando (abre WhatsApp) sin registrar el pedido. */
import { createClient } from '@supabase/supabase-js';

const URL = import.meta.env.PUBLIC_SUPABASE_URL;
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

const sb = URL && ANON ? createClient(URL, ANON, { auth: { persistSession: false } }) : null;

export function sbReady() {
  return sb !== null;
}

/**
 * Registra cliente + pedido + ítems vía la RPC `create_order`.
 * @param {{ customer: {full_name:string, phone:string, email?:string, note?:string},
 *           items: Array<object>,
 *           whatsappMessage?: string }} payload
 * @returns {Promise<{order_number:string, total:number, currency:string, whatsapp_number:string}>}
 */
export async function sbCreateOrder({ customer, items, whatsappMessage }) {
  if (!sb) throw new Error('Supabase no está configurado');
  const meta = {
    referrer: document.referrer || '',
    landing_path: location.pathname + location.search,
    user_agent: navigator.userAgent || '',
    whatsapp_message: whatsappMessage || '',
  };
  const { data, error } = await sb.rpc('create_order', {
    p_customer: customer,
    p_items: items,
    p_meta: meta,
  });
  if (error) throw error;
  return data;
}

// Expuesto en window para los scripts que aún usan el patrón global (onclick="…").
window.SB = { ready: sbReady, createOrder: sbCreateOrder };
