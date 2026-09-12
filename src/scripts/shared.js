/* ── Helpers compartidos por todas las páginas (overlays, toast, WhatsApp) ──
   Astro empaqueta estos <script> como módulos ES (con nombre de archivo con
   hash — así se evita el problema de caché que tuvimos en el sitio estático
   viejo). Eso significa que cada archivo tiene su propio scope: el markup
   sigue usando atributos onclick="..." heredados del sitio original, así
   que las funciones que esos atributos llaman se exponen explícitamente en
   `window` al final de cada archivo. Un identificador libre (sin declarar
   en el módulo) SÍ resuelve contra `window`, así que los demás módulos
   pueden seguir llamando `openOv(...)`, `SPRITES`, etc. tal cual. */
const WA = 'https://wa.me/51905888108?text=';

function openOv(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeOv(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
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
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* Lee un bloque <script type="application/json" id="..."> ya renderizado
   por Astro desde una Content Collection. Devuelve `fallback` si no existe
   (por ejemplo en una página que no necesita ese dato). */
function readJSON(id, fallback) {
  const el = document.getElementById(id);
  if (!el) return fallback;
  try { return JSON.parse(el.textContent); } catch { return fallback; }
}

/* Sprites de Fortnite (categoría "fortnite" de la colección `products`) —
   los usan tanto mystery-pack.js como customize-pack.js. */
const SPRITES = readJSON('sprites-json', []);

window.WA = WA;
window.openOv = openOv;
window.closeOv = closeOv;
window.shuffle = shuffle;
window.showToast = showToast;
window.readJSON = readJSON;
window.SPRITES = SPRITES;

// Clic en el fondo cierra el overlay — excepto la vista rápida de sticker,
// que solo se cierra con la X (evita cerrarla sin querer al tocar afuera).
document.querySelectorAll('.overlay:not(#sticker-overlay)').forEach(el => {
  el.addEventListener('click', e => { if (e.target === el) closeOv(el.id); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['mystery-overlay', 'customize-overlay', 'cart-overlay', 'sticker-overlay', 'pack-overlay'].forEach(id => {
      const el = document.getElementById(id);
      if (el && el.classList.contains('open')) closeOv(id);
    });
  }
});
