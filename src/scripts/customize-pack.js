/* ── Pack Personalizado (Customize Pack) ──
   SPRITES (fortnite) viene de shared.js. FINISHES sale de #finishes-json
   (colección `finishes`) en vez de un array hardcodeado en este archivo. */
const FINISHES = readJSON('finishes-json', []);

let selectedIdxs   = [];
let activeFilter   = 'all';
let searchQuery    = '';
let selectedFinish = FINISHES[0]?.id;
let itemFinishes   = {}; // { [spriteIdx]: finishId } — lets each sticker use its own vinyl

function openCustomize() {
  selectedIdxs = []; activeFilter = 'all'; searchQuery = ''; selectedFinish = FINISHES[0]?.id; itemFinishes = {};
  const searchEl = document.getElementById('cust-search');
  if (searchEl) searchEl.value = '';
  renderGrid(); updateCTA(); renderFinishes();
  document.querySelectorAll('.filter-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  openOv('customize-overlay');
}

function renderFinishes() {
  const box = document.getElementById('finish-tabs');
  if (!box) return;
  box.innerHTML = FINISHES.map(f => {
    const sel = f.id === selectedFinish;
    return `<button type="button" class="finish-opt${sel ? ' selected' : ''}" onclick="selectFinish('${f.id}')" title="${f.label}" aria-pressed="${sel}">
      <span class="finish-swatch" style="background-image:url('${f.image}')"></span>
      <span class="finish-name">${f.label}</span>
    </button>`;
  }).join('');
}

function selectFinish(id) {
  selectedFinish = id;
  renderFinishes();
}

function renderGrid() {
  let list = activeFilter === 'all' ? SPRITES : SPRITES.filter(s => s.rarity === activeFilter);
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
      <span class="spr-rar bdg-${s.rarity}">${s.rarityLabel}</span>
    </div>`;
  }).join('');
}

function toggleSpr(gi) {
  const pos = selectedIdxs.indexOf(gi);
  if (pos > -1) { selectedIdxs.splice(pos, 1); delete itemFinishes[gi]; }
  else if (selectedIdxs.length < 10) { selectedIdxs.push(gi); itemFinishes[gi] = selectedFinish; }
  renderGrid(); updateCTA();
}

/* cycles a single selected sticker through the available vinyl finishes */
function cycleItemFinish(gi) {
  const order = FINISHES.map(f => f.id);
  const current = itemFinishes[gi] || selectedFinish;
  itemFinishes[gi] = order[(order.indexOf(current) + 1) % order.length];
  updateCTA();
}

function filterBy(rarity, btn) {
  activeFilter = rarity;
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
  const progress = (n / 10) * 100;

  numEl.textContent = n;
  numEl.classList.toggle('zero', n === 0);
  numEl.classList.toggle('done', n === 10);
  if (counter) counter.style.setProperty('--progress', `${progress}%`);

  /* live preview strip — each thumbnail shows/cycles its own vinyl finish */
  const preview = document.getElementById('pack-preview');
  preview.innerHTML = selectedIdxs.map(i => {
    const finish = FINISHES.find(f => f.id === (itemFinishes[i] || selectedFinish)) || FINISHES[0];
    return `<button type="button" class="pack-preview-item" onclick="cycleItemFinish(${i})"
            title="${SPRITES[i].name} — ${finish.label} (toca para cambiar la hoja)">
      <img src="${SPRITES[i].image}" alt="${SPRITES[i].name}"
           onerror="this.onerror=null;this.style.opacity='.25'">
      <span class="pack-preview-finish" style="background-image:url('${finish.image}')"></span>
    </button>`;
  }).join('');
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
  const buildMessage = () => {
    const lines = selectedIdxs.map(i => {
      const finish = FINISHES.find(f => f.id === (itemFinishes[i] || selectedFinish)) || FINISHES[0];
      return `  - ${SPRITES[i].name} (${SPRITES[i].rarityLabel}) — Hoja: ${finish.label}`;
    }).join('\n');
    return `Hola! Quiero pedir el Pack Personalizado - S/ 8.50\n\nMis stickers:\n${lines}`;
  };
  Checkout.recordOrderAndOpenWhatsApp({
    items: [{
      kind: 'pack_personalizado',
      quantity: 1,
      finish_slug: selectedFinish,
      components: selectedIdxs.map(i => ({
        slug: SPRITES[i].id,
        finish_slug: itemFinishes[i] || selectedFinish,
      })),
    }],
    buildMessage,
    closeOverlayId: 'customize-overlay',
  });
}

window.openCustomize = openCustomize;
window.selectFinish = selectFinish;
window.toggleSpr = toggleSpr;
window.cycleItemFinish = cycleItemFinish;
window.filterBy = filterBy;
window.searchSprites = searchSprites;
window.confirmCustom = confirmCustom;
