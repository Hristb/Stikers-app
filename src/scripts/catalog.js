/* ── Home catalog: búsqueda, tabs Catálogo/Packs, paginación ──
   Antes leía de SPRITES/MEME_STICKERS/DEV_STICKERS hardcodeados en este
   mismo archivo. Ahora lee el catálogo ya normalizado que Astro embebió
   como #catalog-json a partir de la colección `products` — mismo shape
   que tendría una respuesta de API real. */
const CATALOG = readJSON('catalog-json', []);
const PACKS = readJSON('packs-json', []);
const CATALOG_PRICING = readJSON('pricing-json', { unitPrice: 1, packSize: 10, packPrice: 8.5 });

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

// Igual para las cards de packs (sección #packs).
const _packSection = document.getElementById('packs');
if (_packSection) {
  _packSection.addEventListener('click', e => {
    if (e.target.closest('.pack-add')) return;
    const card = e.target.closest('.pack-product');
    if (card) openPack(card.dataset.id);
  });
  _packSection.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.pack-product');
    if (card && !e.target.closest('.pack-add')) { e.preventDefault(); openPack(card.dataset.id); }
  });
}

const escSv = s => String(s).replace(/'/g, "\\'");

function openPack(id) {
  const pk = PACKS.find(x => x.id === id);
  if (!pk) return;
  svCurrent = { id: pk.id, name: pk.name, image: pk.image, isPack: true };

  const img = document.getElementById('sv-img');
  img.src = pk.image; img.alt = pk.name; img.style.opacity = '';
  document.getElementById('sv-name').textContent = pk.name;

  const badge = document.getElementById('sv-badge');
  badge.textContent = pk.label || 'Pack';
  badge.className = 'sticker-view-badge sticker-view-badge--plain';
  badge.hidden = false;

  document.getElementById('sv-unit').textContent = `S/ ${CATALOG_PRICING.packPrice.toFixed(2)}`;
  document.getElementById('sv-unit-label').textContent = `· ${CATALOG_PRICING.packSize} stickers`;
  document.getElementById('sv-pack').hidden = true;

  const desc = document.getElementById('sv-desc');
  desc.textContent = pk.description || '';
  desc.hidden = !pk.description;

  document.getElementById('sv-tags').innerHTML = '';

  renderStickerActions();
  openOv('sticker-overlay');
}

function openSticker(id) {
  const s = CATALOG.find(x => x.id === id);
  if (!s) return; // p. ej. en /drop no hay #catalog-json
  svCurrent = s;

  const img = document.getElementById('sv-img');
  img.src = s.image;
  img.alt = s.name;
  img.style.opacity = '';
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
  // Un solo botón. El texto refleja el estado; el conteo lo da el toast + el
  // badge del carrito en el header. Sin stepper ni "ver carrito" acá.
  box.innerHTML =
    `<button type="button" class="primary-btn" onclick="svAdd()">${inCart ? 'Agregar otro' : 'Agregar al carrito'}</button>`;
}

function svAdd() {
  if (!svCurrent || !window.Cart) return;
  window.Cart.add({
    kind: svCurrent.isPack ? 'pack' : 'sticker',
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
  }, 200);
});

window.showHomeSection = showHomeSection;
window.loadMoreHome = loadMoreHome;
window.searchHomeCatalog = searchHomeCatalog;
window.openSticker = openSticker;
window.openPack = openPack;
window.svAdd = svAdd;
window.svSearchTag = svSearchTag;
