import { BaseComponent } from "../BaseComponent.js";

class VendlyNavbar extends BaseComponent {
  render() {
    this.innerHTML = `
      <!-- Link apontando para o CSS separado do componente -->
      <link rel="stylesheet" href="/src/components/NavBar/NavBar.css">

      <nav class="navbar navbar-expand-md vendly-navbar border-bottom py-2 px-3 shadow-sm w-100">
        <div class="container-fluid d-flex align-items-center justify-content-between p-0">
          
          <div class="d-flex align-items-center gap-3">
            <button id="btnSidebarToggle" class="btn p-2 rounded border-0 text-white nav-btn-hover btn-hamburger" type="button" title="Alternar Menu" aria-label="Menu">
              <!-- Ícone 1: Fechar (X) -->
              <svg class="icon-svg icon-close" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <!-- Ícone 2: Hambúrguer -->
              <svg class="icon-svg icon-menu" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <!-- Container Clicável com Dupla Imagem (Overlay) -->
            <a href="/index.html" class="d-flex align-items-center text-decoration-none gap-2 navbar-brand-link">
              <div class="logo-wrapper">
                <!-- Estado padrão (tudo branco) -->
                <img src="/public/assets/images/vendlyIcon-neutral-white.svg" alt="Logo Vendly" class="vendly-logo logo-default">
                <!-- Estado animado/colorido -->
                <img src="/public/assets/images/vendlyIcon-hover.svg" alt="Logo Vendly" class="vendly-logo logo-hover">
              </div>
              <span class="vendly-brand-text">vendly</span>
            </a>
          </div>

          <div class="d-none d-md-flex flex-grow-1 justify-content-center px-4">
            <form id="searchForm" class="w-100 max-w-search" role="search">
              <div class="input-group">
                <input type="search" id="searchInput" class="form-control bg-white text-dark border-0 shadow-none" placeholder="Buscar no sistema..." aria-label="Buscar">
                <button class="btn btn-search text-white border-0" type="submit" aria-label="Pesquisar">
                  <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </form>
          </div>

          <div class="d-flex align-items-center gap-2">
            <div class="position-relative">
              <button id="btnNotifications" class="btn p-2 rounded-circle border-0 text-white position-relative nav-btn-hover" aria-label="Notificações do sistema">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                <span id="notifBadge" class="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-warning-orange text-dark notif-badge">3</span>
              </button>
            </div>
          </div>

        </div>
      </nav>
    `;
  }

  initEvents() {
    const btnSidebarToggle = this.querySelector("#btnSidebarToggle");
    const btnNotifications = this.querySelector("#btnNotifications");
    const searchForm = this.querySelector("#searchForm");
    const searchInput = this.querySelector("#searchInput");

    if (btnSidebarToggle) {
      btnSidebarToggle.addEventListener("click", () => {
        // Alterna a classe no clique para transicionar entre os ícones
        btnSidebarToggle.classList.toggle("is-open");
        document.dispatchEvent(new CustomEvent("toggleSidebar"));
      });
    }

    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) document.dispatchEvent(new CustomEvent("searchSubmitted", { detail: { query } }));
      });
    }

    if (btnNotifications) {
      btnNotifications.addEventListener("click", () => document.dispatchEvent(new CustomEvent("openNotifications")));
    }
  }
}

customElements.define("vendly-navbar", VendlyNavbar);