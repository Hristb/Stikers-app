/* ── Analítica ligera ──
   Usa Plausible (plausible.io): script sin cookies, no necesita banner de
   consentimiento. El <script> de Plausible ya está en el <head> de cada
   página; solo falta crear el sitio "stikersvault.com" en tu panel para que
   empiece a registrar. Mientras no exista la cuenta, track() no hace nada.

   ¿Prefieres Google Analytics? Pon el snippet de GA4 en el <head> y cambia
   el cuerpo de track() por:  gtag('event', event, props || {}); */

function track(event, props) {
  try {
    if (typeof window.plausible === 'function') {
      window.plausible(event, props ? { props } : undefined);
    }
  } catch (_) {
    /* la analítica nunca debe romper la página */
  }
}

/* Registra qué se busca en el catálogo.
   Debounce de 900 ms para no contar cada tecla, y mínimo 3 caracteres. */
let _searchTrackTimer;
function trackSearch(source, term) {
  clearTimeout(_searchTrackTimer);
  const q = String(term || '').trim().toLowerCase();
  if (q.length < 3) return;
  _searchTrackTimer = setTimeout(() => track('Search', { source: source, term: q }), 900);
}
