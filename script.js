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


// ─────────────────────────────────────────────────────────────────────────────
// CATEGORÍAS DE STICKERS — configuración centralizada
//
// Para agregar una nueva categoría:
//   1. Crea el array (ej: GAMING_STICKERS) con objetos { name, img }
//   2. Agrégalo en getHomeCatalogItems() igual que DEV_STICKERS o MEME_STICKERS
//   3. Añade la clave en CATEGORY_LABELS si quieres una etiqueta en español
//
// searchTags define qué palabras activan ese grupo en el buscador.
// Puedes poner tantas como quieras: ['dev', 'code', 'programacion']
// ─────────────────────────────────────────────────────────────────────────────

/* ── Meme stickers — carpeta img/random ── */
/* Para agregar: copia la imagen a img/random/ y agrega una línea aquí */
const MEME_STICKERS = [
  { name: '1% de Paciencia', img: 'img/random/paciencia-1porcentaje.png' },
  { name: 'This Is Fine',    img: 'img/random/this-is-fine.png' },
  { name: 'No entiendo',    img: 'img/random/no-entiendo.png' },
  { name: 'Start',    img: 'img/random/start.png' },
];

/* ── Dev stickers — carpeta img/dev ── */
/* Para agregar: copia la imagen a img/dev/ y agrega una línea aquí */
const DEV_STICKERS = [
  { name: 'Chispa de Vida',  img: 'img/dev/chispa_de_vida.png'  },
  { name: 'Exceso de IA',    img: 'img/dev/exceso_de_ia.png'    },
  { name: 'GitHub',          img: 'img/dev/github.png'          },
  { name: 'Pure Coffee',     img: 'img/dev/pure-coffee.png'     },
  { name: 'Sin Internet',    img: 'img/dev/sin-internet.png'    },
];


/* ── Vinyl finish options for the Customize Pack modal ── */
const FINISHES = [
  { id: 'blanco',      label: 'Vinil Blanco',           img: 'img/vinil/Vinil_adhesivo_blanco.jpg' },
  { id: 'arcoiris',    label: 'Holográfico Arcoíris',    img: 'img/vinil/Vinil_adhesivo_holográfico_arcoiris.jpg' },
  { id: 'vidrio-roto', label: 'Holográfico Vidrio Roto', img: 'img/vinil/Vinil_adhesivo_holográfico_vidrio_roto.jpg' },
];

/* ── state ── */
let selectedIdxs = [];
let mysteryPack  = [];
let revealIdx    = 0;
let revealing    = false;
let activeFilter = 'all';
let searchQuery  = '';
let selectedFinish = FINISHES[0].id;
let itemFinishes   = {}; // { [spriteIdx]: finishId } — lets each sticker use its own vinyl

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
  selectedIdxs = []; activeFilter = 'all'; searchQuery = ''; selectedFinish = FINISHES[0].id; itemFinishes = {};
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
      <span class="finish-swatch" style="background-image:url('${f.img}')"></span>
      <span class="finish-name">${f.label}</span>
    </button>`;
  }).join('');
}

function selectFinish(id) {
  selectedFinish = id;
  renderFinishes();
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
  if (sectionId === 'catalogo') {
    homeVisibleCount = pageSize();
    renderHomeCatalog();
  }
}

/* ── Home catalog: full sprite list + memes + dev ── */
const CATEGORY_LABELS = {
  mythic:    'Mítico',
  legendary: 'Legendario',
  epic:      'Épico',
  rare:      'Raro',
  special:   'Special',
  meme:      'Meme',
  dev:       'Dev',
};

// Tags de búsqueda por categoría — agrega aquí sinónimos/palabras clave
const CATEGORY_SEARCH_TAGS = {
  fortnite: ['fornite', 'sprites', 'battle royale', 'espiritus'],
  meme:     ['meme', 'memes', 'random'],
  dev:      ['dev', 'code', 'programacion', 'developer', 'coding'],
};

function getHomeCatalogItems() {
  const spriteItems = SPRITES.map(s => ({
    name: s.name,
    img: `${IMG}${s.img}`,
    rarity: RARITY_ES[s.rarity],
    category: s.rarity,
    searchTags: CATEGORY_SEARCH_TAGS.fortnite,  // todos los sprites son de Fortnite
  }));
  const memeItems = MEME_STICKERS.map(m => ({
    name: m.name,
    img: m.img,
    rarity: CATEGORY_LABELS.meme,
    category: 'meme',
    searchTags: CATEGORY_SEARCH_TAGS.meme,
  }));
  const devItems = DEV_STICKERS.map(d => ({
    name: d.name,
    img: d.img,
    rarity: CATEGORY_LABELS.dev,
    category: 'dev',
    searchTags: CATEGORY_SEARCH_TAGS.dev,
  }));
  return [...spriteItems, ...memeItems, ...devItems];
}

let homeCategory = 'all';
let homeSearchQuery = '';
let homeVisibleCount = 0; // se inicializa en renderHomeCatalog según pantalla
const PAGE_SIZE_MOBILE  = 10;
const PAGE_SIZE_DESKTOP = 20;

function pageSize() { return window.innerWidth <= 540 ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP; }

// Arma la primera página mezclando grupos para que el usuario
// vea variedad desde el primer scroll.
// Cuotas: hasta 3 memes, hasta 3 dev, resto sprites (completa hasta 10).
// Si algún grupo tiene menos, los slots sobrantes los llena sprites.
const FIRST_PAGE_MIX = { meme: 3, dev: 3 };

function buildMixedFirstPage(fullList, ps) {
  const byCategory = {};
  fullList.forEach(i => {
    (byCategory[i.category] = byCategory[i.category] || []).push(i);
  });

  const picked = new Set();
  const result = [];

  // Toma hasta `quota` items de una categoría en orden
  function take(category, quota) {
    const group = byCategory[category] || [];
    let taken = 0;
    for (const item of group) {
      if (taken >= quota) break;
      if (!picked.has(item)) { result.push(item); picked.add(item); taken++; }
    }
  }

  // Primero los grupos con cuota fija
  Object.entries(FIRST_PAGE_MIX).forEach(([cat, quota]) => take(cat, quota));

  // Rellena con sprites hasta llegar a ps
  const spriteCategories = ['mythic', 'legendary', 'epic', 'rare', 'special'];
  for (const cat of spriteCategories) {
    if (result.length >= ps) break;
    take(cat, ps - result.length);
  }

  return result.slice(0, ps);
}

function renderHomeCatalog() {
  const grid = document.getElementById('sticker-catalog');
  const btn  = document.getElementById('load-more-btn');
  if (!grid) return;

  let list = getHomeCatalogItems();
  if (homeCategory !== 'all') list = list.filter(i => i.category === homeCategory);
  if (homeSearchQuery) list = list.filter(i =>
    i.name.toLowerCase().includes(homeSearchQuery) ||
    i.searchTags.some(tag => tag.includes(homeSearchQuery))
  );

  if (list.length === 0) {
    grid.innerHTML = '<p class="no-results">No se encontraron stickers para esa búsqueda.</p>';
    if (btn) btn.hidden = true;
    return;
  }

  // Paginación en todos los dispositivos: 20 en desktop, 10 en mobile
  const ps = pageSize();
  if (homeVisibleCount === 0) homeVisibleCount = ps; // primera carga

  let visible;
  if (homeVisibleCount === ps && !homeSearchQuery && homeCategory === 'all') {
    // Primera página: mezcla representativa (3 memes, 3 dev, resto sprites)
    visible = buildMixedFirstPage(list, ps);
  } else {
    visible = list.slice(0, homeVisibleCount);
  }

  grid.innerHTML = visible.map(i => `
    <article class="sticker-product" data-name="${i.name}" data-rarity="${i.rarity}" data-img="${i.img}">
      <img src="${i.img}" alt="${i.name}" loading="lazy" onerror="this.onerror=null;this.style.opacity='.25'">
      <strong>${i.name}</strong>
      <span>${i.rarity}</span>
      <button aria-label="Agregar ${i.name} al carrito" onclick="addToCartFromEl(this)">+</button>
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
}

renderHomeCatalog();

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
      <img src="${IMG}${SPRITES[i].img}" alt="${SPRITES[i].name}"
           onerror="this.onerror=null;this.style.opacity='.25'">
      <span class="pack-preview-finish" style="background-image:url('${finish.img}')"></span>
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
  const lines = selectedIdxs.map(i => {
    const finish = FINISHES.find(f => f.id === (itemFinishes[i] || selectedFinish)) || FINISHES[0];
    return `  - ${SPRITES[i].name} (${RARITY_ES[SPRITES[i].rarity]}) — Hoja: ${finish.label}`;
  }).join('\n');
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

/* Re-render catalog on resize so paging kicks in/out correctly */
let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    homeVisibleCount = pageSize();
    renderHomeCatalog();
  }, 200);
});
