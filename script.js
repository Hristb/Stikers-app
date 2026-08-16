const WA = 'https://wa.me/51956547311?text=';
const IMG = 'https://fortnite.gg/img/x/sprites/icons/';
const RARITY_ES = { mythic:'Mítico', legendary:'Legendario', epic:'Épico', rare:'Raro', special:'Special' };

const SPRITES = [
  // Mythic
  { name:'John Wick',        img:'T_Icon_Reload_FillerGrunt_icon_L.webp',               rarity:'mythic' },
  { name:'Batman',           img:'T_Icon_BR_FossilMeal_Default_L.webp',                 rarity:'mythic' },
  { name:'Vini Jr.',         img:'T_Icon_BR_CokeParmesan_Default_L.webp',               rarity:'mythic' },
  { name:'Burnt Peanut',     img:'T_Icon_BR_Creature_Sprite_BurntPeanut_ui_L.webp',     rarity:'mythic' },
  { name:'Zero Point',       img:'T_Icon_BR_Creature_Sprite_ZeroPoint_ui_L.webp',       rarity:'mythic' },
  { name:'Grim',             img:'T_Icon_BR_GrimReaper_Default_L.webp',                 rarity:'mythic' },
  { name:'Ironmouse',        img:'T_Icon_BR_PedicureAntacid_L.webp',                    rarity:'mythic' },
  { name:'Pollo',            img:'T_Icon_BR_CompanyStargazer_Default_L.webp',           rarity:'mythic' },
  // Legendary
  { name:'Dream',            img:'T_Icon_BR_Creature_Sprite_Sleepy_ui_L.webp',          rarity:'legendary' },
  { name:'Punk',             img:'T_Icon_BR_Creature_Sprite_Punk_ui_L.webp',            rarity:'legendary' },
  { name:'Boss',             img:'T_Icon_BR_Creature_Sprite_Boss_ui_L.webp',            rarity:'legendary' },
  { name:'Seven',            img:'T_Icon_BR_Creature_Sprite_Seven_ui_L.webp',           rarity:'legendary' },
  { name:'Llama',            img:'T_Icon_BR_Creature_Sprite_Llama_ui_L.webp',           rarity:'legendary' },
  { name:'Peely',            img:'T_Icon_BR_Creature_Sprite_Peely_ui_L.webp',           rarity:'legendary' },
  // Epic
  { name:'Duck',             img:'T_Icon_BR_Duck_Default_L.webp',                       rarity:'epic' },
  { name:'Ghost',            img:'T_Icon_BR_Creature_Sprite_Ghost_Unvault_L.webp',      rarity:'epic' },
  { name:'Demon',            img:'T_Icon_BR_RedDemon_Default_L.webp',                   rarity:'epic' },
  { name:'King',             img:'T_Icon_BR_Creature_Sprite_King_ui_L.webp',            rarity:'epic' },
  { name:'Striker',          img:'T_Icon_BR_Creature_Sprite_Soccer_ui_L.webp',          rarity:'epic' },
  { name:'Aura',             img:'T_Icon_BR_Creature_Sprite_Drifter_ui_L.webp',         rarity:'epic' },
  // Rare
  { name:'Water',            img:'T_Icon_BR_Creature_Sprite_Water_Unvault_Ch7S3_ui_L.webp', rarity:'rare' },
  { name:'Earth',            img:'T_Icon_BR_Creature_Sprite_Earth_Ch7S3_UI_L.webp',     rarity:'rare' },
  { name:'Fire',             img:'T_Icon_BR_Creature_Sprite_Fire_Unvault_Ch7S3_ui_L.webp', rarity:'rare' },
  { name:'Fishy',            img:'T_Icon_BR_Creature_Sprite_Fishy_ui_L.webp',           rarity:'rare' },
  { name:'Air',              img:'T_Icon_BR_Air_Default_L.webp',                        rarity:'rare' },
  // Special variants
  { name:'Cube Batman',      img:'T_Icon_BR_FossilMeal_Cube_L.webp',                    rarity:'special' },
  { name:'Gold Batman',      img:'T_Icon_BR_FossilMeal_Gold_L.webp',                    rarity:'special' },
  { name:'Gummy Batman',     img:'T_Icon_BR_FossilMeal_Candy_L.webp',                   rarity:'special' },
  { name:'Galaxy Batman',    img:'T_Icon_BR_FossilMeal_Galaxy_L.webp',                  rarity:'special' },
  { name:'Holofoil Batman',  img:'T_Icon_BR_FossilMeal_Holofoil_L.webp',               rarity:'special' },
  { name:'Gold Water',       img:'T_Icon_BR_Creature_Sprite_Water_Gold_ui_L.webp',      rarity:'special' },
  { name:'Quack Water',      img:'T_Icon_BR_Creature_Sprite_Water_Quack_ui_L.webp',     rarity:'special' },
  { name:'Gummy Water',      img:'T_Icon_BR_Creature_Sprite_Water_Candy_ui_L.webp',     rarity:'special' },
  { name:'Galaxy Water',     img:'T_Icon_BR_Creature_Sprite_Water_Galaxy_ui_L.webp',    rarity:'special' },
  { name:'Gem Water',        img:'T_Icon_BR_Creature_Sprite_Water_Gem_ui_L.webp',       rarity:'special' },
  { name:'Holofoil Water',   img:'T_Icon_BR_Creature_Sprite_Water_Holofoil_ui_L.webp', rarity:'special' },
  { name:'Cube Earth',       img:'T_Icon_BR_Creature_Sprite_Earth_Cube_ui_L.webp',      rarity:'special' },
  { name:'Gold Earth',       img:'T_Icon_BR_Creature_Sprite_Earth_Gold_ui_L.webp',      rarity:'special' },
  { name:'Quack Earth',      img:'T_Icon_BR_Creature_Sprite_Earth_Quack_ui_L.webp',     rarity:'special' },
  { name:'Gummy Earth',      img:'T_Icon_BR_Creature_Sprite_Earth_Candy_ui_L.webp',     rarity:'special' },
  { name:'Galaxy Earth',     img:'T_Icon_BR_Creature_Sprite_Earth_Galaxy_ui_L.webp',    rarity:'special' },
  { name:'Gem Earth',        img:'T_Icon_BR_Creature_Sprite_Earth_Gem_ui_L.webp',       rarity:'special' },
  { name:'Cube Fire',        img:'T_Icon_BR_Creature_Sprite_Fire_Cube_ui_L.webp',       rarity:'special' },
  { name:'Gold Fire',        img:'T_Icon_BR_Creature_Sprite_Fire_Gold_ui_L.webp',       rarity:'special' },
  { name:'Quack Fire',       img:'T_Icon_BR_Creature_Sprite_Fire_Quack_ui_L.webp',      rarity:'special' },
  { name:'Gummy Fire',       img:'T_Icon_BR_Creature_Sprite_Fire_Candy_ui_L.webp',      rarity:'special' },
  { name:'Galaxy Fire',      img:'T_Icon_BR_Creature_Sprite_Fire_Galaxy_ui_L.webp',     rarity:'special' },
  { name:'Holofoil Fire',    img:'T_Icon_BR_Creature_Sprite_Fire_Holofoil_ui_L.webp',  rarity:'special' },
  { name:'Gold Duck',        img:'T_Icon_BR_Duck_Gold_L.webp',                          rarity:'special' },
  { name:'Gummy Duck',       img:'T_Icon_BR_Duck_Candy_L.webp',                         rarity:'special' },
  { name:'Galaxy Duck',      img:'T_Icon_BR_Duck_Galaxy_L.webp',                        rarity:'special' },
  { name:'Gem Duck',         img:'T_Icon_BR_Duck_Gem_L.webp',                           rarity:'special' },
  { name:'Gold Ghost',       img:'T_Icon_BR_Creature_Sprite_Ghost_Gold_L.webp',         rarity:'special' },
  { name:'Gummy Ghost',      img:'T_Icon_BR_Creature_Sprite_Ghost_Candy_L.webp',        rarity:'special' },
  { name:'Galaxy Ghost',     img:'T_Icon_BR_Creature_Sprite_Ghost_Galaxy_L.webp',       rarity:'special' },
  { name:'Holofoil Ghost',   img:'T_Icon_BR_Creature_Sprite_Ghost_Holo_L.webp',         rarity:'special' },
  { name:'Cube Dream',       img:'T_Icon_BR_Creature_Sprite_Sleepy_Cube_ui_L.webp',     rarity:'special' },
  { name:'Gold Dream',       img:'T_Icon_BR_Creature_Sprite_Sleepy_Gold_ui_L.webp',     rarity:'special' },
  { name:'Gummy Dream',      img:'T_Icon_BR_Creature_Sprite_Sleepy_Candy_ui_L.webp',    rarity:'special' },
  { name:'Galaxy Dream',     img:'T_Icon_BR_Creature_Sprite_Sleepy_Galaxy_ui_L.webp',   rarity:'special' },
  { name:'Gold Demon',       img:'T_Icon_BR_RedDemon_Gold_L.webp',                      rarity:'special' },
  { name:'Gummy Demon',      img:'T_Icon_BR_RedDemon_Candy_L.webp',                     rarity:'special' },
  { name:'Galaxy Demon',     img:'T_Icon_BR_RedDemon_Galaxy_L.webp',                    rarity:'special' },
  { name:'Gem Demon',        img:'T_Icon_BR_RedDemon_Gem_L.webp',                       rarity:'special' },
  { name:'Cube Punk',        img:'T_Icon_BR_Creature_Sprite_Punk_Cube_ui_L.webp',       rarity:'special' },
  { name:'Gold Punk',        img:'T_Icon_BR_Creature_Sprite_Punk_Gold_ui_L.webp',       rarity:'special' },
  { name:'Gummy Punk',       img:'T_Icon_BR_Creature_Sprite_Punk_Candy_ui_L.webp',      rarity:'special' },
  { name:'Galaxy Punk',      img:'T_Icon_BR_Creature_Sprite_Punk_Galaxy_ui_L.webp',     rarity:'special' },
  { name:'Gold King',        img:'T_Icon_BR_Creature_Sprite_King_Gold_ui_L.webp',       rarity:'special' },
  { name:'Gummy King',       img:'T_Icon_BR_Creature_Sprite_King_Candy_ui_L.webp',      rarity:'special' },
  { name:'Galaxy King',      img:'T_Icon_BR_Creature_Sprite_King_Galaxy_ui_L.webp',     rarity:'special' },
  { name:'Holofoil King',    img:'T_Icon_BR_Creature_Sprite_King_Holofoil_ui_L.webp',  rarity:'special' },
  { name:'Cube Zero Point',  img:'T_Icon_BR_Creature_Sprite_ZeroPoint_Cube_ui_L.webp',  rarity:'special' },
  { name:'Gold Zero Point',  img:'T_Icon_BR_Creature_Sprite_ZeroPoint_Gold_ui_L.webp',  rarity:'special' },
  { name:'Quack Zero Point', img:'T_Icon_BR_Creature_Sprite_ZeroPoint_Quack_ui_L.webp', rarity:'special' },
  { name:'Gummy Zero Point', img:'T_Icon_BR_Creature_Sprite_ZeroPoint_Candy_ui_L.webp', rarity:'special' },
  { name:'Galaxy Zero Point',img:'T_Icon_BR_Creature_Sprite_ZeroPoint_Galaxy_ui_L.webp',rarity:'special' },
  { name:'Gem Zero Point',   img:'T_Icon_BR_Creature_Sprite_ZeroPoint_Gem_ui_L.webp',   rarity:'special' },
  { name:'Holofoil Zero Point',img:'T_Icon_BR_Creature_Sprite_ZeroPoint_Holofoil_ui_L.webp',rarity:'special'},
  { name:'Cube Fishy',       img:'T_Icon_BR_Creature_Sprite_Fishy_Cube_L.webp',          rarity:'special' },
  { name:'Gold Fishy',       img:'T_Icon_BR_Creature_Sprite_Fishy_Gold_ui_L.webp',       rarity:'special' },
  { name:'Gummy Fishy',      img:'T_Icon_BR_Creature_Sprite_Fishy_Candy_ui_L.webp',      rarity:'special' },
  { name:'Galaxy Fishy',     img:'T_Icon_BR_Creature_Sprite_Fishy_Galaxy_ui_L.webp',     rarity:'special' },
  { name:'Gold Striker',     img:'T_Icon_BR_Creature_Sprite_Soccer_Gold_L.webp',          rarity:'special' },
  { name:'Gummy Striker',    img:'T_Icon_BR_Creature_Sprite_Soccer_Candy_L.webp',         rarity:'special' },
  { name:'Galaxy Striker',   img:'T_Icon_BR_Creature_Sprite_Soccer_Galaxy_L.webp',        rarity:'special' },
  { name:'Holofoil Striker', img:'T_Icon_BR_Creature_Sprite_Soccer_Holofoil_L.webp',     rarity:'special' },
  { name:'Gold Aura',        img:'T_Icon_BR_Creature_Sprite_Drifter_Gold_ui_L.webp',     rarity:'special' },
  { name:'Gummy Aura',       img:'T_Icon_BR_Creature_Sprite_Drifter_Candy_ui_L.webp',    rarity:'special' },
  { name:'Galaxy Aura',      img:'T_Icon_BR_Creature_Sprite_Drifter_Galaxy_ui_L.webp',   rarity:'special' },
  { name:'Gem Aura',         img:'T_Icon_BR_Creature_Sprite_Drifter_Gem_ui_L.webp',      rarity:'special' },
  { name:'Cube Boss',        img:'T_Icon_BR_Creature_Sprite_Boss_Cube_ui_L.webp',         rarity:'special' },
  { name:'Gold Boss',        img:'T_Icon_BR_Creature_Sprite_Boss_Gold_ui_L.webp',         rarity:'special' },
  { name:'Gummy Boss',       img:'T_Icon_BR_Creature_Sprite_Boss_Candy_ui_L.webp',        rarity:'special' },
  { name:'Galaxy Boss',      img:'T_Icon_BR_Creature_Sprite_Boss_Galaxy_ui_L.webp',       rarity:'special' },
  { name:'Cube Grim',        img:'T_Icon_BR_GrimReaper_Cube_L.webp',                      rarity:'special' },
  { name:'Gold Grim',        img:'T_Icon_BR_GrimReaper_Gold_L.webp',                      rarity:'special' },
  { name:'Gummy Grim',       img:'T_Icon_BR_GrimReaper_Candy_L.webp',                     rarity:'special' },
  { name:'Galaxy Grim',      img:'T_Icon_BR_GrimReaper_Galaxy_L.webp',                    rarity:'special' },
  { name:'Gem Grim',         img:'T_Icon_BR_GrimReaper_Gem_L.webp',                       rarity:'special' },
  { name:'Holofoil Grim',    img:'T_Icon_BR_GrimReaper_Holofoil_L.webp',                 rarity:'special' },
  { name:'Gold Air',         img:'T_Icon_BR_Air_Gold_L.webp',                              rarity:'special' },
  { name:'Gummy Air',        img:'T_Icon_BR_Air_Candy_L.webp',                             rarity:'special' },
  { name:'Galaxy Air',       img:'T_Icon_BR_Air_Galaxy_L.webp',                            rarity:'special' },
  { name:'Holofoil Air',     img:'T_Icon_BR_Air_Holo_L.webp',                              rarity:'special' },
  { name:'Gold Seven',       img:'T_Icon_BR_Creature_Sprite_Seven_Gold_ui_L.webp',         rarity:'special' },
  { name:'Gummy Seven',      img:'T_Icon_BR_Creature_Sprite_Seven_Candy_ui_L.webp',        rarity:'special' },
  { name:'Galaxy Seven',     img:'T_Icon_BR_Creature_Sprite_Seven_Galaxy_ui_L.webp',       rarity:'special' },
  { name:'Holofoil Seven',   img:'T_Icon_BR_Creature_Sprite_Seven_Holofoil_ui_L.webp',    rarity:'special' },
  { name:'Gold Llama',       img:'T_Icon_BR_Creature_Sprite_Llama_Gold_ui_L.webp',         rarity:'special' },
  { name:'Gummy Llama',      img:'T_Icon_BR_Creature_Sprite_Llama_Candy_ui_L.webp',        rarity:'special' },
  { name:'Galaxy Llama',     img:'T_Icon_BR_Creature_Sprite_Llama_Galaxy_ui_L.webp',       rarity:'special' },
  { name:'Gem Llama',        img:'T_Icon_BR_Creature_Sprite_Llama_Gem_ui_L.webp',          rarity:'special' },
  { name:'Gold Peely',       img:'T_Icon_BR_Creature_Sprite_Peely_Gold_ui_L.webp',         rarity:'special' },
  { name:'Gummy Peely',      img:'T_Icon_BR_Creature_Sprite_Peely_Candy_ui_L.webp',        rarity:'special' },
  { name:'Galaxy Peely',     img:'T_Icon_BR_Creature_Sprite_Peely_Galaxy_ui_L.webp',       rarity:'special' },
  { name:'Holofoil Peely',   img:'T_Icon_BR_Creature_Sprite_Peely_Holofoil_ui_L.webp',   rarity:'special' },
];

SPRITES.forEach((sprite, index) => {
  const tagCycle = ['dev', 'gaming', 'memes'];
  sprite.tag = tagCycle[index % tagCycle.length];
});

/* ── state ── */
let selectedIdxs = [];
let mysteryPack  = [];
let revealIdx    = 0;
let revealing    = false;
let activeFilter = 'all';
let searchQuery  = '';

/* ── Mystery Pack ── */
function openMystery() {
  mysteryPack = shuffle([...SPRITES]).slice(0, 10);
  revealIdx = 0; revealing = false;

  document.getElementById('mystery-cards').innerHTML = mysteryPack.map((s, i) =>
    `<div class="g-card" id="gc${i}" onclick="clickCard(${i})">
      <div class="g-inner">
        <div class="g-face g-front"></div>
        <div class="g-face g-back">
          <img src="${IMG}${s.img}" alt="${s.name}" loading="lazy"
               onerror="this.onerror=null;this.style.opacity='.25'">
          <span class="g-cname">${s.name}</span>
          <span class="g-badge bdg-${s.rarity}">${RARITY_ES[s.rarity]}</span>
        </div>
      </div>
    </div>`
  ).join('');

  const summary = document.getElementById('mystery-summary');
  summary.hidden = true; summary.innerHTML = '';
  const newBtn = document.getElementById('mystery-new-btn');
  newBtn.hidden = true;

  const btn = document.getElementById('mystery-btn');
  btn.textContent = 'Revelar Pack ✨';
  btn.onclick = startReveal;
  btn.disabled = false;
  btn.classList.add('pulse-glow');
  document.getElementById('mystery-sub').textContent =
    'Toca cada carta o presiona Revelar Todo';

  openOv('mystery-overlay');
}

function startReveal() {
  if (revealing) return;
  revealing = true;
  const btn = document.getElementById('mystery-btn');
  btn.disabled = true;
  btn.classList.remove('pulse-glow');
  btn.textContent = 'Revelando…';
  autoReveal();
}

/* skips cards already flipped by individual clicks */
function autoReveal() {
  let nextIdx = -1;
  for (let i = 0; i < 10; i++) {
    if (!document.getElementById(`gc${i}`).classList.contains('flipped')) {
      nextIdx = i; break;
    }
  }
  if (nextIdx === -1) { showRevealComplete(); return; }
  const s = mysteryPack[nextIdx];
  document.getElementById(`gc${nextIdx}`).classList.add('flipped', `rarity-${s.rarity}`);
  const done = document.querySelectorAll('.g-card.flipped').length;
  setTimeout(autoReveal, done <= 5 ? 480 : 360);
}

/* tap individual face-down card to flip it (disabled during auto-reveal) */
function clickCard(idx) {
  if (revealing) return;
  const card = document.getElementById(`gc${idx}`);
  if (card.classList.contains('flipped')) return;
  card.classList.add('flipped', `rarity-${mysteryPack[idx].rarity}`);
  if (document.querySelectorAll('.g-card.flipped').length === 10) showRevealComplete();
}

function showRevealComplete() {
  revealing = false;
  const counts = {};
  mysteryPack.forEach(s => { counts[s.rarity] = (counts[s.rarity] || 0) + 1; });
  const order = ['mythic','legendary','epic','rare','special'];
  const labels = { mythic:'Mítico', legendary:'Legendario', epic:'Épico', rare:'Raro', special:'Special' };
  const clr    = { mythic:'bdg-mythic', legendary:'bdg-legendary', epic:'bdg-epic', rare:'bdg-rare', special:'bdg-special' };
  const summary = document.getElementById('mystery-summary');
  summary.innerHTML = Object.entries(counts)
    .sort((a,b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([r, n]) => `<span class="sum-pill ${clr[r]}">${n} ${labels[r]}${n > 1 ? 's' : ''}</span>`)
    .join('');
  summary.hidden = false;

  const btn = document.getElementById('mystery-btn');
  btn.textContent = 'Comprar Ahora — S/ 8.50';
  btn.disabled = false;
  btn.onclick = orderMystery;
  btn.classList.add('pulse-glow');
  document.getElementById('mystery-new-btn').hidden = false;
  document.getElementById('mystery-sub').textContent = '¡Pack increíble! Listo para comprar.';
}

function orderMystery() {
  const lines = mysteryPack.map(s => `  - ${s.name} (${RARITY_ES[s.rarity]})`).join('\n');
  const text = `Hola! Quiero pedir el Pack Sorpresa - S/ 8.50\n\nMis stickers:\n${lines}`;
  showToast('Abriendo WhatsApp…');
  setTimeout(() => {
    window.open(`${WA}${encodeURIComponent(text)}`, '_blank');
    closeOv('mystery-overlay');
  }, 800);
}

/* ── Customize Pack ── */
function openCustomize() {
  selectedIdxs = []; activeFilter = 'all'; searchQuery = '';
  const searchEl = document.getElementById('cust-search');
  if (searchEl) searchEl.value = '';
  renderGrid(); updateCTA();
  document.querySelectorAll('.filter-tab').forEach((t, i) => t.classList.toggle('active', i === 0));
  openOv('customize-overlay');
}

function renderGrid() {
  let list = activeFilter === 'all' ? SPRITES : SPRITES.filter(s => s.tag === activeFilter);
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
    return `<div class="spr-card${sel?' selected':''}${max?' maxed':''}"
                 onclick="toggleSpr(${gi})" title="${s.name}">
      <div class="spr-chk">
        <svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <img src="${IMG}${s.img}" alt="${s.name}" loading="lazy"
           onerror="this.onerror=null;this.style.opacity='.25'">
      <span class="spr-name">${s.name}</span>
      <span class="spr-rar bdg-${s.rarity}">${RARITY_ES[s.rarity]}</span>
    </div>`;
  }).join('');
}

function toggleSpr(gi) {
  const pos = selectedIdxs.indexOf(gi);
  if (pos > -1) selectedIdxs.splice(pos, 1);
  else if (selectedIdxs.length < 10) selectedIdxs.push(gi);
  renderGrid(); updateCTA();
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
}

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

  /* live preview strip */
  const preview = document.getElementById('pack-preview');
  preview.innerHTML = selectedIdxs.map(i =>
    `<img src="${IMG}${SPRITES[i].img}" alt="${SPRITES[i].name}" title="${SPRITES[i].name}"
          onerror="this.onerror=null;this.style.opacity='.25'">`
  ).join('');
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
  const lines = selectedIdxs.map(i => `  - ${SPRITES[i].name} (${RARITY_ES[SPRITES[i].rarity]})`).join('\n');
  const text = `Hola! Quiero pedir el Pack Personalizado - S/ 8.50\n\nMis stickers:\n${lines}`;
  showToast('Abriendo WhatsApp…');
  setTimeout(() => {
    window.open(`${WA}${encodeURIComponent(text)}`, '_blank');
    closeOv('customize-overlay');
  }, 800);
}

/* ── Shared helpers ── */
function openOv(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeOv(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* Close on backdrop click */
document.querySelectorAll('.overlay').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) closeOv(el.id); });
});
/* Close on Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['mystery-overlay','customize-overlay'].forEach(id => {
      if (document.getElementById(id).classList.contains('open')) closeOv(id);
    });
  }
});
