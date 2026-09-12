/* ── Pack Personalizado (arma tu pack con cualquier sticker del catálogo) ──
   Antes solo dejaba elegir sprites de Fortnite (filtrado por rareza). Ahora
   lee el catálogo completo (#catalog-json, misma fuente que usaba el
   catálogo de stickers sueltos) y filtra por categoría en vez de rareza —
   la rareza solo existe para Fortnite, las demás categorías no la tienen.

   La hoja (vinil) es UNA sola para todo el pack, no por sticker — antes se
   podía mezclar (cada sticker con su propia hoja), pero al meter recargo
   por hoja holográfica esa mezcla complicaba el precio sin necesidad. */
const SPRITES = readJSON('catalog-json', []);
const CATEGORIES = readJSON('categories-json', []);
const FINISHES = readJSON('finishes-json', []);
const CUSTOM_PRICING = readJSON('pricing-json', { unitPrice: 1, packSize: 10, packPrice: 8.5 });

// Único vinil sin recargo. Cualquier otro (hoy: holográfico arcoíris /
// vidrio roto) suma este extra al pack completo.
const HOLO_SURCHARGE = 0.5;
const finishSurcharge = id => (id === 'blanco' ? 0 : HOLO_SURCHARGE);
const currentPrice = () => CUSTOM_PRICING.packPrice + finishSurcharge(selectedFinish);

let selectedIdxs   = [];
let activeFilter   = 'all';
let searchQuery    = '';
let selectedFinish = FINISHES[0]?.id;

function openCustomize() {
  selectedIdxs = []; activeFilter = 'all'; searchQuery = ''; selectedFinish = FINISHES[0]?.id;
  const searchEl = document.getElementById('cust-search');
  if (searchEl) searchEl.value = '';
  renderFilterTabs(); renderGrid(); updateCTA(); renderFinishes();
  openOv('customize-overlay');
}

function renderFilterTabs() {
  const box = document.getElementById('filter-tabs');
  if (!box) return;
  const tabs = [{ id: 'all', name: 'Todos' }, ...CATEGORIES];
  box.innerHTML = tabs.map(c =>
    `<button type="button" class="filter-tab${c.id === activeFilter ? ' active' : ''}" onclick="filterBy('${c.id}', this)">${c.name}</button>`
  ).join('');
}

function renderFinishes() {
  const box = document.getElementById('finish-tabs');
  if (!box) return;
  box.innerHTML = FINISHES.map(f => {
    const sel = f.id === selectedFinish;
    const extra = finishSurcharge(f.id);
    return `<button type="button" class="finish-opt${sel ? ' selected' : ''}" onclick="selectFinish('${f.id}')" title="${f.label}${extra ? ` (+S/ ${extra.toFixed(2)})` : ''}" aria-pressed="${sel}">
      <span class="finish-swatch" style="background-image:url('${f.image}')"></span>
      <span class="finish-name">${f.label}${extra ? ` +${extra.toFixed(2)}` : ''}</span>
    </button>`;
  }).join('');
}

function selectFinish(id) {
  selectedFinish = id;
  renderFinishes();
  updateCTA();
}

function renderGrid() {
  let list = activeFilter === 'all' ? SPRITES : SPRITES.filter(s => s.category === activeFilter);
  if (searchQuery) list = list.filter(s => s.name.toLowerCase().includes(searchQuery));

  if (list.length === 0) {
    document.getElementById('sprites-grid').innerHTML =
      '<p class="no-results">No se encontraron stickers para esa búsqueda.</p>';
    return;
  }

  document.getElementById('sprites-grid').innerHTML = list.map(s => {
    const gi  = SPRITES.indexOf(s);
    const sel = selectedIdxs.includes(gi);
    const max = !sel && selectedIdxs.length >= 10;
    return `<div class="spr-card${sel ? ' selected' : ''}${max ? ' maxed' : ''}"
                 onclick="toggleSpr(${gi})" title="${s.name}">
      <div class="spr-chk">
        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <img src="${s.image}" alt="${s.name}" loading="lazy"
           onerror="this.onerror=null;this.style.opacity='.25'">
      <span class="spr-name">${s.name}</span>
      ${s.rarityLabel ? `<span class="spr-rar${s.rarity ? ` bdg-${s.rarity}` : ''}">${s.rarityLabel}</span>` : ''}
    </div>`;
  }).join('');
}

function toggleSpr(gi) {
  const pos = selectedIdxs.indexOf(gi);
  if (pos > -1) selectedIdxs.splice(pos, 1);
  else if (selectedIdxs.length < 10) selectedIdxs.push(gi);
  renderGrid(); updateCTA();
}

function filterBy(category, btn) {
  activeFilter = category;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderGrid();
}

function searchSprites(val) {
  searchQuery = val.toLowerCase().trim();
  renderGrid();
  if (typeof trackSearch === 'function') trackSearch('pack-personalizado', val);
}

function updateCTA() {
  const n = selectedIdxs.length;
  const numEl = document.getElementById('cust-num');
  const btn   = document.getElementById('cust-btn');
  const counter = document.querySelector('.cust-counter');
  const priceEl = document.getElementById('cust-total-price');
  const progress = (n / 10) * 100;

  numEl.textContent = n;
  numEl.classList.toggle('zero', n === 0);
  numEl.classList.toggle('done', n === 10);
  if (counter) counter.style.setProperty('--progress', `${progress}%`);
  if (priceEl) priceEl.textContent = `Total: S/ ${currentPrice().toFixed(2)}`;

  /* live preview strip — tocar un sticker elegido lo saca del pack */
  const preview = document.getElementById('pack-preview');
  preview.innerHTML = selectedIdxs.map(i => `
    <button type="button" class="pack-preview-item" onclick="toggleSpr(${i})" title="Sacar ${SPRITES[i].name}">
      <img src="${SPRITES[i].image}" alt="${SPRITES[i].name}"
           onerror="this.onerror=null;this.style.opacity='.25'">
    </button>`).join('');
  preview.classList.toggle('visible', n > 0);

  if (n === 10) {
    btn.disabled = false;
    btn.classList.add('pulse-glow');
  } else {
    btn.disabled = true;
    btn.classList.remove('pulse-glow');
  }
}

function confirmCustom() {
  if (selectedIdxs.length !== 10) return;
  const finish = FINISHES.find(f => f.id === selectedFinish) || FINISHES[0];
  const price = currentPrice();
  const buildMessage = () => {
    const lines = selectedIdxs.map(i => {
      const rarity = SPRITES[i].rarityLabel ? ` (${SPRITES[i].rarityLabel})` : '';
      return `  - ${SPRITES[i].name}${rarity}`;
    }).join('\n');
    return `Hola! Quiero pedir el Pack Personalizado - S/ ${price.toFixed(2)}\nHoja: ${finish.label}\n\nMis stickers:\n${lines}`;
  };
  Checkout.recordOrderAndOpenWhatsApp({
    items: [{
      kind: 'pack_personalizado',
      quantity: 1,
      finish_slug: selectedFinish,
      components: selectedIdxs.map(i => ({ slug: SPRITES[i].id })),
    }],
    buildMessage,
    closeOverlayId: 'customize-overlay',
  });
}

window.openCustomize = openCustomize;
window.selectFinish = selectFinish;
window.toggleSpr = toggleSpr;
window.filterBy = filterBy;
window.searchSprites = searchSprites;
window.confirmCustom = confirmCustom;
