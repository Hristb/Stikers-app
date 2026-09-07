/* ── Paso final de checkout (compartido) ──
   Lo usan cart.js, mystery-pack.js y customize-pack.js.

   `WA`, `showToast`, `openOv`, `closeOv` vienen de shared.js (globales).

   ┌─────────────────────────────────────────────────────────────────────┐
   │ RECORD_ORDERS                                                        │
   │  false → va DIRECTO a WhatsApp con el pedido (no pide nada).         │
   │  true  → abre el formulario nombre + WhatsApp y registra el pedido   │
   │          en Supabase (RPC create_order) antes de abrir WhatsApp.     │
   │ El backend (tablas, RLS, RPC) queda igual; solo cambia este flag.    │
   └─────────────────────────────────────────────────────────────────────┘ */
const RECORD_ORDERS = false;
// supabase-client.js (y @supabase/supabase-js) solo se cargan si RECORD_ORDERS
// es true — import dinámico dentro del if.

let pending = null; // { resolve } de la promesa de collectCustomer()

/** Abre el overlay y resuelve con { full_name, phone } o null si se cancela. */
function collectCustomer() {
  return new Promise((resolve) => {
    if (pending) pending.resolve(null); // por si quedó uno abierto
    pending = { resolve };
    const form = document.getElementById('checkout-form');
    const err = document.getElementById('checkout-error');
    if (form) form.reset();
    if (err) err.hidden = true;
    openOv('checkout-overlay');
    setTimeout(() => form?.querySelector('input')?.focus(), 120);
  });
}

function settle(value) {
  const p = pending;
  pending = null;
  closeOv('checkout-overlay');
  if (p) p.resolve(value);
}

function showErr(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.hidden = false;
}

/**
 * Abre WhatsApp con el pedido. Con RECORD_ORDERS=true, antes pide nombre +
 * WhatsApp y registra el pedido en Supabase.
 * @param {{ items: Array<object>, buildMessage: () => string, closeOverlayId?: string }} opts
 * @returns {Promise<boolean>} true si se abrió WhatsApp, false si se canceló.
 */
async function recordOrderAndOpenWhatsApp({ items, buildMessage, closeOverlayId }) {
  let message = buildMessage();

  if (RECORD_ORDERS) {
    const customer = await collectCustomer();
    if (!customer) return false;

    try {
      const { sbReady, sbCreateOrder } = await import('./supabase-client.js');
      if (sbReady()) {
        showToast('Registrando pedido…');
        const res = await sbCreateOrder({ customer, items, whatsappMessage: message });
        if (res && res.order_number) {
          message = `*Pedido ${res.order_number}*\n\n${message}`;
        }
      }
    } catch (err) {
      console.warn('[checkout] no se pudo registrar el pedido; se abre WhatsApp igual:', err);
    }
  }

  showToast('Abriendo WhatsApp…');
  window.open(WA + encodeURIComponent(message), '_blank');
  if (closeOverlayId) closeOv(closeOverlayId);
  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checkout-form');
  const overlay = document.getElementById('checkout-overlay');
  if (!form || !overlay) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const fullName = String(fd.get('full_name') || '').trim();
    const phone = String(fd.get('phone') || '').replace(/\D/g, '');
    const err = document.getElementById('checkout-error');
    if (fullName.length < 2) return showErr(err, 'Escribe tu nombre.');
    if (phone.length < 7 || phone.length > 15) return showErr(err, 'Escribe un número de WhatsApp válido (solo dígitos).');
    settle({ full_name: fullName, phone });
  });

  // Cerrar el overlay (✕, click afuera, Esc) = cancelar el checkout.
  overlay.addEventListener('click', (e) => { if (e.target === overlay) settle(null); });
  overlay.querySelector('.ov-close')?.addEventListener('click', () => settle(null));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) settle(null);
  });
});

window.Checkout = { collectCustomer, recordOrderAndOpenWhatsApp };
