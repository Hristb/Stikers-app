/* ── Chrome compartido de todas las páginas ──
   El footer, el overlay del carrito y el toast son idénticos en index.html
   y drop.html, así que se inyectan desde aquí en vez de copiarlos en cada
   HTML. Se evita que el markup se desincronice entre páginas.

   Este script se carga ANTES de script.js y cart.js para que su código de
   arranque (backdrop click, renderCart, syncBadge) encuentre los nodos.

   Para agregar una página nueva basta con incluir:
     <script src="analytics.js"></script>
     <script src="ui.js"></script>
     <script src="script.js"></script>
     <script src="cart.js"></script> */
(function () {
  /* Edita aquí los enlaces del footer (deja '' para ocultar uno) */
  const LINKS = {
    whatsapp:  'https://wa.me/51956547311',
    instagram: '', // ej: 'https://instagram.com/tuusuario'
    tiktok:    '',
  };

  const social = [
    LINKS.whatsapp  && `<a href="${LINKS.whatsapp}" target="_blank" rel="noopener">Pedir por WhatsApp</a>`,
    LINKS.instagram && `<a href="${LINKS.instagram}" target="_blank" rel="noopener">Instagram</a>`,
    LINKS.tiktok    && `<a href="${LINKS.tiktok}" target="_blank" rel="noopener">TikTok</a>`,
  ].filter(Boolean).join('');

  const footer = `
  <footer class="site-footer">
    <div class="site-footer-inner">
      <div class="site-footer-brand">
        <span class="site-footer-logo">S</span>
        <div>
          <strong>Sticker Vault</strong>
          <p>Stickers de memes, tech y gaming.<br>Vinil resistente al agua · impresión HD.</p>
        </div>
      </div>
      <nav class="site-footer-nav" aria-label="Pie de página">
        <a href="index.html">Catálogo</a>
        <a href="drop.html">Packs</a>
        ${social}
      </nav>
    </div>
    <p class="site-footer-legal">© <span id="footer-year"></span> Sticker Vault · Pedidos por WhatsApp · Perú</p>
  </footer>`;

  const cartOverlay = `
  <div id="cart-overlay" class="overlay" role="dialog" aria-modal="true" aria-label="Carrito">
    <div class="overlay-panel cart-panel">
      <button class="ov-close" onclick="closeOv('cart-overlay')" aria-label="Cerrar">✕</button>
      <div class="cart-hdr">
        <h2>Tu Carrito</h2>
        <p>Revisa tus stickers antes de pedir por WhatsApp</p>
      </div>
      <div class="cart-body">
        <p id="cart-empty" class="cart-empty">Tu carrito está vacío. Agrega stickers desde el catálogo.</p>
        <div id="cart-items"></div>
      </div>
      <p id="cart-hint" class="cart-hint" hidden></p>
      <div class="cart-footer">
        <div class="cart-total-row">
          <span>Total</span>
          <strong id="cart-total">S/ 0.00</strong>
        </div>
        <button id="cart-checkout-btn" class="primary-btn" onclick="checkoutCart()" disabled>Pedir por WhatsApp</button>
      </div>
    </div>
  </div>`;

  const toast = `<div id="toast" class="toast" aria-live="polite"></div>`;

  const page = document.querySelector('.page');
  if (page) page.insertAdjacentHTML('afterend', footer);
  document.body.insertAdjacentHTML('beforeend', cartOverlay + toast);

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
