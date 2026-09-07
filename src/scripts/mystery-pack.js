/* ── Pack Sorpresa (Mystery Pack) ──
   SPRITES (fortnite) se declara una sola vez en shared.js, ver ahí el porqué. */
let mysteryPack = [];
let revealIdx    = 0;
let revealing    = false;

function openMystery() {
  mysteryPack = shuffle([...SPRITES]).slice(0, 10);
  revealIdx = 0; revealing = false;

  document.getElementById('mystery-cards').innerHTML = mysteryPack.map((s, i) =>
    `<div class="g-card" id="gc${i}" onclick="clickCard(${i})">
      <div class="g-inner">
        <div class="g-face g-front"></div>
        <div class="g-face g-back">
          <img src="${s.image}" alt="${s.name}" loading="lazy"
               onerror="this.onerror=null;this.style.opacity='.25'">
          <span class="g-cname">${s.name}</span>
          <span class="g-badge bdg-${s.rarity}">${s.rarityLabel}</span>
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
  const order = ['mythic', 'legendary', 'epic', 'rare', 'special'];
  const clr    = { mythic: 'bdg-mythic', legendary: 'bdg-legendary', epic: 'bdg-epic', rare: 'bdg-rare', special: 'bdg-special' };
  const labelOf = rarity => (mysteryPack.find(s => s.rarity === rarity) || {}).rarityLabel || rarity;
  const summary = document.getElementById('mystery-summary');
  summary.innerHTML = Object.entries(counts)
    .sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
    .map(([r, n]) => `<span class="sum-pill ${clr[r]}">${n} ${labelOf(r)}${n > 1 ? 's' : ''}</span>`)
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
  const buildMessage = () => {
    const lines = mysteryPack.map(s => `  - ${s.name} (${s.rarityLabel})`).join('\n');
    return `Hola! Quiero pedir el Pack Sorpresa - S/ 8.50\n\nMis stickers:\n${lines}`;
  };
  Checkout.recordOrderAndOpenWhatsApp({
    items: [{
      kind: 'pack_sorpresa',
      quantity: 1,
      components: mysteryPack.map(s => ({ slug: s.id })),
    }],
    buildMessage,
    closeOverlayId: 'mystery-overlay',
  });
}

window.openMystery = openMystery;
window.startReveal = startReveal;
window.clickCard = clickCard;
window.orderMystery = orderMystery;
