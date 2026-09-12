/* ── Home catalog: búsqueda, tabs Catálogo/Packs, paginación ──
   Antes leía de SPRITES/MEME_STICKERS/DEV_STICKERS hardcodeados en este
   mismo archivo. Ahora lee el catálogo ya normalizado que Astro embebió
   como #catalog-json a partir de la colección `products` — mismo shape
   que tendría una respuesta de API real. */
const CATALOG = readJSON('catalog-json', []);
const CATALOG_PRICING = readJSON('pricing-json', { unitPrice: 1, packSize: 10, packPrice: 8.5 });
// Los packs (cards de #packs, su modal de detalle y su carrito) viven en
// pack-detail.js — este archivo solo se ocupa del catálogo de stickers
// sueltos (hoy desactivado, ver comentario en index.astro).

function showHomeSection(sectionId, tab) {
  const sections = ['catalogo', 'packs'];
  sections.forEach(id => {
    const section = document.getElementById(id);
    if (section) section.hidden = id !== sectionId;
  });
  document.querySelectorAll('.catalog-tab').forEach(button => {
    const active = button === tab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  if (sectionId === 'catalogo') {
    homeVisibleCount = pageSize();
    renderHomeCatalog();
  }
}

let homeCategory = 'all';
let homeSearchQuery = '';
let homeVisibleCount = 0; // se inicializa en renderHomeCatalog según pantalla
const PAGE_SIZE_MOBILE  = 10;
const PAGE_SIZE_DESKTOP = 20;

function pageSize() { return window.innerWidth <= 540 ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP; }

// Intercalado por categoría: en vez de mostrar bloque tras bloque (y que
// Fortnite —la categoría más grande— sea un muro), se recorren todas las
// categorías en ronda. `MIX_WEIGHTS` = cuántos de cada una por ronda.
// Fortnite pesa un poco más pero no domina; cuando una categoría chica se
// acaba, las grandes (fortnite, dev) rellenan la cola.
const MIX_WEIGHTS = { fortnite: 2, dev: 2, gatos: 2, meme: 1, frases: 1 };

function interleaveByCategory(list) {
  const groups = {};
  for (const it of list) (groups[it.category] = groups[it.category] || []).push(it);
  const cats = Object.keys(groups);
  const idx = Object.fromEntries(cats.map(c => [c, 0]));
  const out = [];
  let moved = true;
  while (out.length < list.length && moved) {
    moved = false;
    for (const c of cats) {
      const w = MIX_WEIGHTS[c] ?? 1;
      for (let k = 0; k < w && idx[c] < groups[c].length; k++) {
        out.push(groups[c][idx[c]++]);
        moved = true;
      }
    }
  }
  return out;
}

function renderHomeCatalog() {
  const grid = document.getElementById('sticker-catalog');
  const btn  = document.getElementById('load-more-btn');
  if (!grid) return;

  let list = CATALOG;
  if (homeCategory !== 'all') list = list.filter(i => i.category === homeCategory);
  if (homeSearchQuery) list = list.filter(i =>
    i.name.toLowerCase().includes(homeSearchQuery) ||
    i.searchTags.some(tag => tag.includes(homeSearchQuery))
  );
  // Sin filtro ni búsqueda: intercalar categorías para un scroll variado.
  if (homeCategory === 'all' && !homeSearchQuery) list = interleaveByCategory(list);

  if (list.length === 0) {
    grid.innerHTML = '<p class="no-results">No se encontraron stickers para esa búsqueda.</p>';
    if (btn) btn.hidden = true;
    return;
  }

  // Paginación en todos los dispositivos: 20 en desktop, 10 en mobile
  const ps = pageSize();
  if (homeVisibleCount === 0) homeVisibleCount = ps; // primera carga

  const visible = list.slice(0, homeVisibleCount);

  grid.innerHTML = visible.map(i => `
    <article class="sticker-product" data-id="${i.id}" data-name="${i.name}" data-rarity="${i.rarityLabel}" data-img="${i.image}"
             role="button" tabindex="0" aria-label="Ver ${i.name}">
      <img src="${i.image}" alt="${i.name}" loading="lazy" onerror="this.onerror=null;this.style.opacity='.25'">
      <strong>${i.name}</strong>
      <span>${i.rarityLabel}</span>
      <button type="button" class="sticker-product-add" aria-label="Agregar ${i.name} al carrito" onclick="addToCartFromEl(this)">+</button>
    </article>`).join('');

  if (btn) btn.hidden = homeVisibleCount >= list.length;
}

function loadMoreHome() {
  homeVisibleCount += pageSize();
  renderHomeCatalog();
}

function searchHomeCatalog(val) {
  homeSearchQuery = val.toLowerCase().trim();
  homeVisibleCount = pageSize(); // reset paging on new search
  renderHomeCatalog();
  if (typeof trackSearch === 'function') trackSearch('catalogo', val);
}

renderHomeCatalog();

/* ── Vista rápida de un sticker (overlay #sticker-overlay) ── */
let svCurrent = null;

// Toda la card abre la vista rápida; el botón "+" (agregar) hace lo suyo.
// Delegado en el contenedor (persiste entre re-renders del grid).
const _catalogGrid = document.getElementById('sticker-catalog');
if (_catalogGrid) {
  _catalogGrid.addEventListener('click', e => {
    if (e.target.closest('.sticker-product-add')) return;
    const card = e.target.closest('.sticker-product');
    if (card) openSticker(card.dataset.id);
  });
  _catalogGrid.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.sticker-product');
    if (card && !e.target.closest('.sticker-product-add')) {
      e.preventDefault();
      openSticker(card.dataset.id);
    }
  });
}

const escSv = s => String(s).replace(/'/g, "\\'");

/* ── Carrusel del overlay de detalle (#sv-media) ──
   Scroll nativo con scroll-snap: el swipe en móvil es gratis (es scroll de
   verdad), flechas/dots solo hacen `scrollTo` al slide correspondiente.
   Un slide único (sticker suelto, o pack sin fotos en items/) oculta los
   controles y queda igual que la vista de antes. */
let svImages = [];
let svIndex = 0;

function svGoTo(i, smooth = true) {
  const track = document.getElementById('sv-track');
  if (!track || !svImages.length) return;
  svIndex = (i + svImages.length) % svImages.length;
  track.scrollTo({ left: svIndex * track.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  document.querySelectorAll('#sv-dots .sv-dot').forEach((d, di) => d.classList.toggle('active', di === svIndex));
}

function renderCarousel(images) {
  const track = document.getElementById('sv-track');
  const dots = document.getElementById('sv-dots');
  const prev = document.getElementById('sv-prev');
  const next = document.getElementById('sv-next');
  if (!track) return;

  svImages = images && images.length ? images : [];
  svIndex = 0;

  track.innerHTML = svImages.map((im, i) => `
    <div class="sv-slide"><img src="${im.src}" alt="${escSv(im.alt || '')}" loading="${i === 0 ? 'eager' : 'lazy'}" onerror="this.onerror=null;this.style.opacity='.25'"></div>
  `).join('');

  const multi = svImages.length > 1;
  if (prev) prev.hidden = !multi;
  if (next) next.hidden = !multi;
  if (dots) {
    dots.innerHTML = multi
      ? svImages.map((_, i) => `<button type="button" class="sv-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="Ir a imagen ${i + 1}"></button>`).join('')
      : '';
  }
  track.scrollLeft = 0;
}

// Delegado una sola vez: sobrevive a los re-renders de innerHTML de arriba.
document.getElementById('sv-prev')?.addEventListener('click', () => svGoTo(svIndex - 1));
document.getElementById('sv-next')?.addEventListener('click', () => svGoTo(svIndex + 1));
document.getElementById('sv-dots')?.addEventListener('click', e => {
  const dot = e.target.closest('.sv-dot');
  if (dot) svGoTo(Number(dot.dataset.i));
});

// El usuario también puede arrastrar/swipear el track directo (scroll
// nativo) — este listener solo mantiene el dot activo sincronizado.
let _svScrollTimer;
document.getElementById('sv-track')?.addEventListener('scroll', function () {
  clearTimeout(_svScrollTimer);
  _svScrollTimer = setTimeout(() => {
    if (!svImages.length) return;
    const i = Math.round(this.scrollLeft / this.clientWidth);
    svIndex = Math.max(0, Math.min(i, svImages.length - 1));
    document.querySelectorAll('#sv-dots .sv-dot').forEach((d, di) => d.classList.toggle('active', di === svIndex));
  }, 100);
});

document.addEventListener('keydown', e => {
  if (!document.getElementById('sticker-overlay')?.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') svGoTo(svIndex - 1);
  if (e.key === 'ArrowRight') svGoTo(svIndex + 1);
});

function openSticker(id) {
  const s = CATALOG.find(x => x.id === id);
  if (!s) return; // p. ej. en /drop no hay #catalog-json
  svCurrent = s;

  renderCarousel([{ src: s.image, alt: s.name }]);
  document.getElementById('sv-name').textContent = s.name;

  const badge = document.getElementById('sv-badge');
  badge.textContent = s.rarityLabel || '';
  badge.className = 'sticker-view-badge' + (s.rarity ? ` bdg-${s.rarity}` : ' sticker-view-badge--plain');
  badge.hidden = !s.rarityLabel;

  document.getElementById('sv-unit').textContent = `S/ ${CATALOG_PRICING.unitPrice.toFixed(2)}`;
  document.getElementById('sv-unit-label').textContent = 'por unidad';
  document.getElementById('sv-desc').hidden = true;

  const full = CATALOG_PRICING.packSize * CATALOG_PRICING.unitPrice;
  const save = full - CATALOG_PRICING.packPrice;
  const packEl = document.getElementById('sv-pack');
  packEl.hidden = false;
  packEl.innerHTML =
    `Pack de ${CATALOG_PRICING.packSize} por <b>S/ ${CATALOG_PRICING.packPrice.toFixed(2)}</b>` +
    (save > 0 ? ` · ahorrás S/ ${save.toFixed(2)}` : '');

  document.getElementById('sv-tags').innerHTML = (s.searchTags || [])
    .map(t => `<button type="button" class="sticker-view-tag" onclick="svSearchTag('${escSv(t)}')">#${t}</button>`)
    .join('');

  renderStickerActions();
  openOv('sticker-overlay');
}

function renderStickerActions() {
  const box = document.getElementById('sv-actions');
  if (!box || !svCurrent) return;
  const inCart = (window.Cart?.items || []).find(i => i.name === svCurrent.name);
  const count = window.Cart?.getCount ? window.Cart.getCount() : 0;
  // Botón de agregar + acceso directo al carrito: en mobile el modal tapa
  // el header, así que sin esto no había forma de llegar al carrito sin
  // cerrar todo y scrollear arriba.
  box.innerHTML = `
    <button type="button" class="primary-btn" onclick="svAdd()">${inCart ? 'Agregar otro' : 'Agregar carrito'}</button>
    <button type="button" class="cart-btn" onclick="svGoToCart()" aria-label="Ver carrito">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="19" r="1.5"></circle>
        <circle cx="17" cy="19" r="1.5"></circle>
        <path d="M3 4h2l2.2 9.2a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L19 7H6"></path>
      </svg>
      <span class="cart-count">${count}</span>
    </button>`;
}

function svGoToCart() {
  closeOv('sticker-overlay');
  openCart();
}

function svAdd() {
  if (!svCurrent || !window.Cart) return;
  window.Cart.add({
    kind: 'sticker',
    slug: svCurrent.id,
    name: svCurrent.name,
    rarity: svCurrent.rarityLabel,
    img: svCurrent.image,
  });
  const n = (window.Cart.items.find(i => i.name === svCurrent.name) || {}).qty || 1;
  showToast(n > 1 ? `${svCurrent.name} — ${n} en tu carrito` : `${svCurrent.name} agregado`);
  renderStickerActions();
}

function svSearchTag(tag) {
  closeOv('sticker-overlay');
  const input = document.getElementById('home-search');
  if (input) input.value = tag;
  searchHomeCatalog(tag);
  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* Re-render catalog on resize so paging kicks in/out correctly */
let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    homeVisibleCount = pageSize();
    renderHomeCatalog();
    if (svImages.length > 1) svGoTo(svIndex, false);
  }, 200);
});

window.showHomeSection = showHomeSection;
window.loadMoreHome = loadMoreHome;
window.searchHomeCatalog = searchHomeCatalog;
window.openSticker = openSticker;
window.svAdd = svAdd;
window.svGoToCart = svGoToCart;
window.svSearchTag = svSearchTag;
