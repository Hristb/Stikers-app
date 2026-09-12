/* ── Modal "Detalle del pack" (#pack-overlay) ──
   Galería grande + carrusel de miniaturas (portada del pack + cada sticker
   que trae adentro), specs, selector de cantidad y doble CTA: agregar al
   carrito o comprar directo por WhatsApp. Todo lo que se ve acá pertenece
   al MISMO pack — elegir una miniatura solo cambia qué imagen se agranda,
   nunca agrega un sticker suelto; el carrito y el WhatsApp siempre compran
   el pack completo (según la cantidad del stepper). */
const PD_PACKS = readJSON('packs-json', []);
const PD_ITEMS = readJSON('pack-items-json', {});
const PD_PRICING = readJSON('pricing-json', { unitPrice: 1, packSize: 10, packPrice: 8.5 });

// Specs comunes a todos los packs (mismo producto físico, distinto diseño).
// TODO: si el tamaño real difiere entre packs, mover esto a packs.json.
const PD_SIZE = 'Aprox. 5 cm cada sticker';
const PD_MATERIAL = 'Vinil blanco clásico';
const PD_WATER = 'Sí, resistente al agua y rayones';

const pdEsc = s => String(s).replace(/'/g, "\\'");

let pdPack = null;
let pdSlides = [];  // [{ src, alt }] — índice 0 = portada del pack
let pdIndex = 0;
let pdQty = 1;

/* pack-items-json siempre trae al menos 1 entrada por pack (si no hay
   fotos en items/, cae a la portada) — si esa única entrada ES la
   portada, no la dupliques como "sticker 1". */
function pdBuildSlides(pack) {
  const items = PD_ITEMS[pack.id] || [];
  const real = items.filter(it => it.src !== pack.image);
  return [{ src: pack.image, alt: pack.name }, ...real];
}

function pdRenderGallery(slides) {
  const track  = document.getElementById('pd-track');
  const thumbs = document.getElementById('pd-thumbs');
  const prev   = document.getElementById('pd-prev');
  const next   = document.getElementById('pd-next');
  if (!track || !thumbs) return;

  track.innerHTML = slides.map((s, i) => `
    <div class="pd-slide"><img src="${s.src}" alt="${pdEsc(s.alt)}" loading="${i === 0 ? 'eager' : 'lazy'}" onerror="this.onerror=null;this.style.opacity='.25'"></div>
  `).join('');

  const multi = slides.length > 1;
  thumbs.hidden = !multi;
  if (prev) prev.hidden = !multi;
  if (next) next.hidden = !multi;

  thumbs.innerHTML = multi
    ? slides.map((s, i) => `
        <button type="button" class="pd-thumb${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="${pdEsc(s.alt)}">
          <img src="${s.src}" alt="" loading="lazy">
        </button>`).join('')
    : '';

  track.scrollLeft = 0;
}

function pdSyncUI() {
  document.querySelectorAll('#pd-thumbs .pd-thumb').forEach((el, i) => {
    el.classList.toggle('active', i === pdIndex);
  });
  document.querySelector(`#pd-thumbs .pd-thumb[data-i="${pdIndex}"]`)
    ?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

  const itemCount = pdSlides.length - 1;
  const counterEl = document.getElementById('pd-counter');
  const nameEl = document.getElementById('pd-current-name');
  if (!counterEl || !nameEl || !pdPack) return;

  if (pdIndex === 0) {
    counterEl.textContent = itemCount > 0 ? `Pack completo · ${itemCount} stickers` : '';
    nameEl.textContent = pdPack.name;
  } else {
    counterEl.textContent = `${pdIndex} de ${itemCount}`;
    nameEl.textContent = pdSlides[pdIndex].alt;
  }
}

function pdGoTo(i, smooth = true) {
  const track = document.getElementById('pd-track');
  if (!track || !pdSlides.length) return;
  pdIndex = (i + pdSlides.length) % pdSlides.length;
  track.scrollTo({ left: pdIndex * track.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  pdSyncUI();
}

function pdSetQty(q) {
  pdQty = Math.max(1, Math.min(99, q));
  const el = document.getElementById('pd-qty-val');
  if (el) el.textContent = String(pdQty);
}

function openPackDetail(id) {
  const pack = PD_PACKS.find(p => p.id === id);
  if (!pack) return;
  pdPack = pack;
  pdSlides = pdBuildSlides(pack);
  pdIndex = 0;

  pdRenderGallery(pdSlides);
  pdSyncUI();
  pdSetQty(1);

  document.getElementById('pd-category').textContent = pack.label || 'Pack';
  document.getElementById('pd-name').textContent = pack.name;
  document.getElementById('pd-price').textContent = `S/ ${pack.price.toFixed(2)}`;
  document.getElementById('pd-spec-count').textContent = `${PD_PRICING.packSize} unidades`;
  document.getElementById('pd-spec-size').textContent = PD_SIZE;
  document.getElementById('pd-spec-material').textContent = PD_MATERIAL;
  document.getElementById('pd-spec-water').textContent = PD_WATER;

  openOv('pack-overlay');
}

function closePackDetail() {
  closeOv('pack-overlay');
}

function pdAddToCart() {
  if (!pdPack || !window.Cart) return;
  for (let i = 0; i < pdQty; i++) {
    window.Cart.add({ kind: 'pack', slug: pdPack.id, name: pdPack.name, img: pdPack.image });
  }
  showToast(pdQty > 1 ? `${pdQty}x ${pdPack.name} agregado al carrito` : `${pdPack.name} agregado al carrito`);
  pdSetQty(1);
}

function pdBuyWhatsApp() {
  if (!pdPack) return;
  const qty = pdQty;
  const total = (qty * pdPack.price).toFixed(2);
  window.Checkout.recordOrderAndOpenWhatsApp({
    items: [{ kind: 'pack', slug: pdPack.id, quantity: qty }],
    buildMessage: () =>
      `Hola! Quiero comprar:\n\n${qty}x ${pdPack.name} (pack de ${PD_PRICING.packSize}) — S/ ${total}\n\nTotal: S/ ${total}`,
    closeOverlayId: 'pack-overlay',
  });
}

/* ── Listeners: se registran una sola vez sobre elementos fijos del
   modal (o delegados en sus contenedores, para sobrevivir los re-renders
   de innerHTML de arriba). ── */
document.getElementById('pd-prev')?.addEventListener('click', () => pdGoTo(pdIndex - 1));
document.getElementById('pd-next')?.addEventListener('click', () => pdGoTo(pdIndex + 1));
document.getElementById('pd-thumbs')?.addEventListener('click', e => {
  const btn = e.target.closest('.pd-thumb');
  if (btn) pdGoTo(Number(btn.dataset.i));
});
document.getElementById('pd-qty-minus')?.addEventListener('click', () => pdSetQty(pdQty - 1));
document.getElementById('pd-qty-plus')?.addEventListener('click', () => pdSetQty(pdQty + 1));
document.getElementById('pd-add-btn')?.addEventListener('click', pdAddToCart);
document.getElementById('pd-wa-btn')?.addEventListener('click', pdBuyWhatsApp);

// El usuario también puede arrastrar/swipear la imagen grande directo
// (scroll nativo con scroll-snap) — este listener mantiene la miniatura
// activa y el contador sincronizados.
let _pdScrollTimer;
document.getElementById('pd-track')?.addEventListener('scroll', function () {
  clearTimeout(_pdScrollTimer);
  _pdScrollTimer = setTimeout(() => {
    if (!pdSlides.length) return;
    const i = Math.round(this.scrollLeft / this.clientWidth);
    pdIndex = Math.max(0, Math.min(i, pdSlides.length - 1));
    pdSyncUI();
  }, 100);
});

document.addEventListener('keydown', e => {
  if (!document.getElementById('pack-overlay')?.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') pdGoTo(pdIndex - 1);
  if (e.key === 'ArrowRight') pdGoTo(pdIndex + 1);
});

let _pdResizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_pdResizeTimer);
  _pdResizeTimer = setTimeout(() => { if (pdSlides.length > 1) pdGoTo(pdIndex, false); }, 200);
});

// Cards de #packs en el home: toda la card abre el modal; el botón "+"
// (agregar directo, sin abrir el modal) hace lo suyo aparte. La card
// "Arma tu pack" no tiene data-id (no es un pack real) — abre el builder
// (openCustomize, de customize-pack.js) en vez del detalle.
const _packSection = document.getElementById('packs');
if (_packSection) {
  _packSection.addEventListener('click', e => {
    if (e.target.closest('.pack-add')) return;
    const card = e.target.closest('.pack-product');
    if (!card) return;
    if (card.dataset.id) openPackDetail(card.dataset.id);
    else if (card.classList.contains('pack-product-custom')) window.openCustomize?.();
  });
  _packSection.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.pack-product');
    if (!card || e.target.closest('.pack-add')) return;
    e.preventDefault();
    if (card.dataset.id) openPackDetail(card.dataset.id);
    else if (card.classList.contains('pack-product-custom')) window.openCustomize?.();
  });
}

window.openPackDetail = openPackDetail;
window.closePackDetail = closePackDetail;
