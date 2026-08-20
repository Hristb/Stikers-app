/* ── Cart & Checkout module ──
   Kept separate from script.js (mystery/custom pack flows) on purpose:
   this only handles the individual-sticker catalog → cart → order flow.

   Pricing rule: a single sticker costs S/ 1.00, but every complete group of
   10 in the cart is billed at the pack price (S/ 8.50) instead — cheaper
   than 10 loose stickers (S/ 10.00), so the cart nudges people toward
   completing a pack as they keep adding stickers.

   Cart state persists in localStorage so it survives navigation between
   home.html and index.html.

   Checkout is routed through a "payment channel" abstraction. Today only
   WhatsApp is wired up (business requirement: centralize on WhatsApp), but
   new channels (card, Yape, Plin, etc.) can be added later by registering
   another entry in PAYMENT_CHANNELS without touching the cart logic. */

const CART_STORAGE_KEY = 'sv_cart_v1';
const UNIT_PRICE = 1.00;
const PACK_SIZE  = 10;
const PACK_PRICE = 8.50;

const Cart = {
  items: [], // { name, rarity, img, qty }

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
    else this.items.push({ name: product.name, rarity: product.rarity || '', img: product.img || '', qty: 1 });
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

  getCount() {
    return this.items.reduce((n, i) => n + i.qty, 0);
  },

  /* bundles every full group of 10 at the pack price, prices the rest per unit */
  getTotal() {
    const count = this.getCount();
    const packs = Math.floor(count / PACK_SIZE);
    const loose = count % PACK_SIZE;
    return +(packs * PACK_PRICE + loose * UNIT_PRICE).toFixed(2);
  },

  getPackBreakdown() {
    const count = this.getCount();
    return { packs: Math.floor(count / PACK_SIZE), loose: count % PACK_SIZE };
  },

  /* how much cheaper the bundled total is vs. paying full price per sticker */
  getSavings() {
    const count = this.getCount();
    return +((count * UNIT_PRICE) - this.getTotal()).toFixed(2);
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
      const lines = cart.items
        .map(i => `  - ${i.qty}x ${i.name}${i.rarity ? ` (${i.rarity})` : ''} — S/ ${(i.qty * UNIT_PRICE).toFixed(2)}`)
        .join('\n');
      const { packs, loose } = cart.getPackBreakdown();
      const packLine = packs > 0 ? `${packs} pack(s) de ${PACK_SIZE} a S/ ${PACK_PRICE.toFixed(2)} c/u` : null;
      const looseLine = loose > 0 ? `${loose} sticker(s) suelto(s) a S/ ${UNIT_PRICE.toFixed(2)} c/u` : null;
      const breakdown = [packLine, looseLine].filter(Boolean).join(' + ');
      return `Hola! Quiero hacer un pedido:\n\n${lines}\n\n${breakdown ? `(${breakdown})\n` : ''}Total: S/ ${cart.getTotal().toFixed(2)}`;
    },
    send(message) {
      window.open(`${WA}${encodeURIComponent(message)}`, '_blank');
    }
  }
};
const ACTIVE_PAYMENT_CHANNEL = 'whatsapp';

function checkoutCart() {
  if (Cart.items.length === 0) return;
  const channel = PAYMENT_CHANNELS[ACTIVE_PAYMENT_CHANNEL];
  const message = channel.buildMessage(Cart);
  showToast('Abriendo WhatsApp…');
  setTimeout(() => {
    channel.send(message);
    Cart.clear();
    renderCart();
    closeOv('cart-overlay');
  }, 800);
}

/* ── Cart UI ── */
function addToCartFromEl(btn) {
  const card = btn.closest('[data-name]');
  if (!card) return;
  Cart.add({ name: card.dataset.name, rarity: card.dataset.rarity, img: card.dataset.img });
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
    list.innerHTML = Cart.items.map(i => `
      <div class="cart-line">
        ${i.img ? `<img src="${i.img}" alt="${i.name}" onerror="this.onerror=null;this.style.opacity='.25'">` : ''}
        <div class="cart-line-info">
          <strong>${i.name}</strong>
          ${i.rarity ? `<span>${i.rarity}</span>` : ''}
        </div>
        <div class="cart-qty">
          <button type="button" aria-label="Quitar uno" onclick="Cart.setQty('${escapeAttr(i.name)}', ${i.qty - 1})">−</button>
          <span>${i.qty}</span>
          <button type="button" aria-label="Agregar uno" onclick="Cart.setQty('${escapeAttr(i.name)}', ${i.qty + 1})">+</button>
        </div>
        <span class="cart-line-price">S/ ${(i.qty * UNIT_PRICE).toFixed(2)}</span>
        <button type="button" class="cart-line-remove" aria-label="Eliminar ${i.name}" onclick="Cart.remove('${escapeAttr(i.name)}')">✕</button>
      </div>`).join('');
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
