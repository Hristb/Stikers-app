/* ── Cart & Checkout module ──
   Kept separate from catalog/mystery/customize scripts on purpose: this
   only handles the individual-sticker catalog → cart → order flow.

   Pricing used to be hardcoded here (UNIT_PRICE/PACK_SIZE/PACK_PRICE).
   Now it's read from the `pricing` content collection (embedded by Astro
   as #pricing-json in BaseLayout) — the day pricing moves to a real
   database/API, only that JSON source changes, not this file.

   Cart state persists in localStorage so it survives navigation between
   index.html (home/catálogo) and drop.html.

   Checkout is routed through a "payment channel" abstraction. Today only
   WhatsApp is wired up (business requirement: centralize on WhatsApp), but
   new channels (card, Yape, Plin, etc.) can be added later by registering
   another entry in PAYMENT_CHANNELS without touching the cart logic.

   The final step (name + WhatsApp form + recording the order in Supabase
   before opening WhatsApp) lives in checkout.js and is shared with the
   mystery / custom pack flows. `Checkout` is exposed on window there. */

// v2: los ítems ahora guardan `slug` (para registrar el pedido en Supabase).
const CART_STORAGE_KEY = 'sv_cart_v2';
const PRICING = readJSON('pricing-json', { unitPrice: 1.00, packSize: 10, packPrice: 8.50 });
const UNIT_PRICE = PRICING.unitPrice;
const PACK_SIZE  = PRICING.packSize;
const PACK_PRICE = PRICING.packPrice;

const Cart = {
  items: [], // { kind:'sticker'|'pack', slug, name, rarity, img, qty }

  load() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      this.items = raw ? JSON.parse(raw) : [];
    } catch {
      this.items = [];
    }
  },

  save() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    this.syncBadge();
  },

  add(product) {
    const existing = this.items.find(i => i.name === product.name);
    if (existing) existing.qty += 1;
    else this.items.push({
      kind: product.kind || 'sticker',
      slug: product.slug || '',
      name: product.name,
      rarity: product.rarity || '',
      img: product.img || '',
      // Precio propio del ítem (ej. pack + hoja holográfica) — si no viene,
      // cae al precio fijo de pack/sticker de siempre.
      price: product.price ?? (product.kind === 'pack' ? PACK_PRICE : UNIT_PRICE),
      qty: 1,
    });
    this.save();
    renderCart();
  },

  setQty(name, qty) {
    const item = this.items.find(i => i.name === name);
    if (!item) return;
    if (qty <= 0) { this.remove(name); return; }
    item.qty = qty;
    this.save();
    renderCart();
  },

  remove(name) {
    this.items = this.items.filter(i => i.name !== name);
    this.save();
    renderCart();
  },

  clear() {
    this.items = [];
    this.save();
  },

  /* stickers sueltos (entran al bundle de 10) vs. packs armados (precio fijo) */
  stickerUnits() {
    return this.items.reduce((n, i) => n + (i.kind === 'pack' ? 0 : i.qty), 0);
  },
  packUnits() {
    return this.items.reduce((n, i) => n + (i.kind === 'pack' ? i.qty : 0), 0);
  },

  getCount() {
    return this.stickerUnits() + this.packUnits();
  },

  /* bundles every full group of 10 loose stickers at pack price, rest per
     unit, plus cada pack armado a SU precio (puede variar por la hoja
     elegida — ver `price` en cada ítem) */
  getTotal() {
    const s = this.stickerUnits();
    const packs = Math.floor(s / PACK_SIZE);
    const loose = s % PACK_SIZE;
    const packsTotal = this.items.reduce((sum, i) => sum + (i.kind === 'pack' ? i.qty * (i.price ?? PACK_PRICE) : 0), 0);
    return +(packs * PACK_PRICE + loose * UNIT_PRICE + packsTotal).toFixed(2);
  },

  getPackBreakdown() {
    const s = this.stickerUnits();
    return { packs: Math.floor(s / PACK_SIZE), loose: s % PACK_SIZE };
  },

  /* how much cheaper the loose-sticker bundling is vs. paying full price each */
  getSavings() {
    const s = this.stickerUnits();
    const bundled = Math.floor(s / PACK_SIZE) * PACK_PRICE + (s % PACK_SIZE) * UNIT_PRICE;
    return +((s * UNIT_PRICE) - bundled).toFixed(2);
  },

  syncBadge() {
    document.querySelectorAll('.cart-count').forEach(el => { el.textContent = this.getCount(); });
  }
};

Cart.load();

/* ── Payment channels (centralized on WhatsApp for now) ── */
const PAYMENT_CHANNELS = {
  whatsapp: {
    id: 'whatsapp',
    label: 'WhatsApp',
    buildMessage(cart) {
      const stickerLines = cart.items
        .filter(i => i.kind !== 'pack')
        .map(i => `  - ${i.qty}x ${i.name}${i.rarity ? ` (${i.rarity})` : ''}`)
        .join('\n');
      const packLines = cart.items
        .filter(i => i.kind === 'pack')
        .map(i => `  - ${i.qty}x ${i.name} (pack de ${PACK_SIZE}) — S/ ${(i.qty * (i.price ?? PACK_PRICE)).toFixed(2)}`)
        .join('\n');
      const { packs, loose } = cart.getPackBreakdown();
      const packLine = packs > 0 ? `${packs} pack(s) de ${PACK_SIZE} a S/ ${PACK_PRICE.toFixed(2)} c/u` : null;
      const looseLine = loose > 0 ? `${loose} sticker(s) suelto(s) a S/ ${UNIT_PRICE.toFixed(2)} c/u` : null;
      const breakdown = [packLine, looseLine].filter(Boolean).join(' + ');

      const blocks = [];
      if (stickerLines) blocks.push(`Stickers:\n${stickerLines}`);
      if (packLines) blocks.push(`Packs:\n${packLines}`);
      return `Hola! Quiero hacer un pedido:\n\n${blocks.join('\n\n')}\n\n${breakdown ? `(sueltos: ${breakdown})\n` : ''}Total: S/ ${cart.getTotal().toFixed(2)}`;
    },
  }
};
const ACTIVE_PAYMENT_CHANNEL = 'whatsapp';

function checkoutCart() {
  if (Cart.items.length === 0) return;
  const channel = PAYMENT_CHANNELS[ACTIVE_PAYMENT_CHANNEL];
  Checkout.recordOrderAndOpenWhatsApp({
    items: Cart.items
      .filter(i => i.slug)
      .map(i => ({ kind: i.kind === 'pack' ? 'pack' : 'sticker', slug: i.slug, quantity: i.qty })),
    buildMessage: () => channel.buildMessage(Cart),
    closeOverlayId: 'cart-overlay',
  }).then(opened => {
    if (opened) { Cart.clear(); renderCart(); }
  });
}

/* ── Cart UI ── */
function addToCartFromEl(btn) {
  const card = btn.closest('[data-name]');
  if (!card) return;
  Cart.add({
    kind: card.dataset.kind || 'sticker',
    slug: card.dataset.id,
    name: card.dataset.name,
    rarity: card.dataset.rarity,
    img: card.dataset.img,
  });
  showToast(`${card.dataset.name} agregado al carrito`);
}

function openCart() {
  renderCart();
  openOv('cart-overlay');
}

function renderCart() {
  const list        = document.getElementById('cart-items');
  const totalEl      = document.getElementById('cart-total');
  const emptyEl      = document.getElementById('cart-empty');
  const checkoutBtn  = document.getElementById('cart-checkout-btn');
  const hintEl       = document.getElementById('cart-hint');
  if (!list) return; // overlay not present on this page

  const escapeAttr = s => String(s).replace(/'/g, "\\'");

  if (Cart.items.length === 0) {
    list.innerHTML = '';
    if (emptyEl) emptyEl.hidden = false;
    if (checkoutBtn) checkoutBtn.disabled = true;
  } else {
    if (emptyEl) emptyEl.hidden = true;
    if (checkoutBtn) checkoutBtn.disabled = false;
    list.innerHTML = Cart.items.map(i => {
      const isPack = i.kind === 'pack';
      const linePrice = isPack ? i.qty * (i.price ?? PACK_PRICE) : i.qty * UNIT_PRICE;
      const sub = isPack ? `Pack de ${PACK_SIZE}` : i.rarity;
      return `
      <div class="cart-line${isPack ? ' cart-line-pack' : ''}">
        ${i.img ? `<img src="${i.img}" alt="${i.name}" onerror="this.onerror=null;this.style.opacity='.25'">` : ''}
        <div class="cart-line-info">
          <strong>${i.name}</strong>
          ${sub ? `<span>${sub}</span>` : ''}
        </div>
        <div class="cart-qty">
          <button type="button" aria-label="Quitar uno" onclick="Cart.setQty('${escapeAttr(i.name)}', ${i.qty - 1})">−</button>
          <span>${i.qty}</span>
          <button type="button" aria-label="Agregar uno" onclick="Cart.setQty('${escapeAttr(i.name)}', ${i.qty + 1})">+</button>
        </div>
        <span class="cart-line-price">S/ ${linePrice.toFixed(2)}</span>
        <button type="button" class="cart-line-remove" aria-label="Eliminar ${i.name}" onclick="Cart.remove('${escapeAttr(i.name)}')">✕</button>
      </div>`;
    }).join('');
  }

  if (totalEl) totalEl.textContent = `S/ ${Cart.getTotal().toFixed(2)}`;

  if (hintEl) {
    const message = buildCartHintMessage();
    hintEl.hidden = !message;
    hintEl.textContent = message || '';
  }
}

/* picks the right nudge based on how many complete packs / loose stickers are in the cart */
function buildCartHintMessage() {
  const { packs, loose } = Cart.getPackBreakdown();
  const savings = Cart.getSavings();
  const missing = PACK_SIZE - loose;

  if (loose === 0 && packs > 0) {
    return `Ya tienes ${packs} pack${packs > 1 ? 's' : ''} de ${PACK_SIZE}. Ahorraste S/ ${savings.toFixed(2)}.`;
  }
  if (loose > 0 && packs > 0) {
    return `Ya tienes ${packs} pack${packs > 1 ? 's' : ''}. Agrega ${missing} más para completar otro pack de ${PACK_SIZE}.`;
  }
  if (loose > 0) {
    return `Agrega ${missing} sticker${missing === 1 ? '' : 's'} más y arma un pack de ${PACK_SIZE} por S/ ${PACK_PRICE.toFixed(2)} (en vez de S/ ${(PACK_SIZE * UNIT_PRICE).toFixed(2)}).`;
  }
  return '';
}

document.addEventListener('DOMContentLoaded', () => {
  Cart.syncBadge();
  renderCart();
});

window.Cart = Cart;
window.checkoutCart = checkoutCart;
window.addToCartFromEl = addToCartFromEl;
window.openCart = openCart;
