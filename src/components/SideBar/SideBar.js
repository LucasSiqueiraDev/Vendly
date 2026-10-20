import { BaseComponent } from "../BaseComponent.js";

class VendlySidebar extends BaseComponent {
  constructor() {
    super();
    this.isCollapsed = false;
  }

  render() {
    this.innerHTML = `
      <link rel="stylesheet" href="/src/components/SideBar/SideBar.css">

      <aside id="sidebarContainer" class="vendly-sidebar">
        
        <!-- Navegação Principal -->
        <nav class="flex-grow-1 py-3 d-flex flex-column gap-3">
          
          <!-- Vendas -->
          <div class="px-2">
            <p class="sidebar-category-title sidebar-text">Vendas</p>
            <div class="d-flex flex-column gap-1">
              <a href="/pdv" class="sidebar-link" title="Frente de Caixa">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span class="sidebar-text">Frente de Caixa</span>
              </a>
              <a href="/vendas/historico" class="sidebar-link" title="Histórico de Vendas">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span class="sidebar-text">Histórico de Vendas</span>
              </a>
            </div>
          </div>

          <!-- Estoque -->
          <div class="px-2">
            <p class="sidebar-category-title sidebar-text">Estoque</p>
            <div class="d-flex flex-column gap-1">
              <a href="/src/pages/produtos.html" class="sidebar-link" title="Produtos">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <span class="sidebar-text">Produtos</span>
              </a>
              <a href="/estoque/historico" class="sidebar-link" title="Histórico de Estoque">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s-8 1.79 8-4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                <span class="sidebar-text">Histórico de Estoque</span>
              </a>
              <a href="/src/pages/categorias.html" class="sidebar-link" title="Categorias">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                <span class="sidebar-text">Categorias</span>
              </a>
              <a href="/src/pages/fornecedores.html" class="sidebar-link" title="Fornecedores">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                <span class="sidebar-text">Fornecedores</span>
              </a>
            </div>
          </div>

          <!-- Administração -->
          <div class="px-2">
            <p class="sidebar-category-title sidebar-text">Administração</p>
            <div class="d-flex flex-column gap-1">
              <a href="/src/pages/funcionarios.html" class="sidebar-link" title="Funcionários">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                <span class="sidebar-text">Funcionários</span>
              </a>
              <a href="/configuracoes" class="sidebar-link" title="Configurações">
                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span class="sidebar-text">Configurações</span>
              </a>
            </div>
          </div>

        </nav>

        <!-- Rodapé Fixo -->
        <div class="sidebar-footer mt-auto py-2">
          <div class="px-2">
            <button id="btnLogout" class="sidebar-link btn-logout-sidebar bg-transparent border-0 w-100" type="button" title="Sair do sistema">
              <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              <span class="sidebar-text fw-semibold">Sair</span>
            </button>
          </div>
        </div>

      </aside>
    `;
  }

  initEvents() {
    const btnLogout = this.querySelector("#btnLogout");

    if (btnLogout) {
      btnLogout.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("userLogout"));
      });
    }

    document.addEventListener("toggleSidebar", () => {
      if (window.innerWidth < 768) {
        const sidebarContainer = this.querySelector("#sidebarContainer");
        sidebarContainer?.classList.toggle("show-mobile");
      } else {
        this.toggleCollapse();
      }
    });

    this.highlightActiveLink();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    const sidebarContainer = this.querySelector("#sidebarContainer");

    if (this.isCollapsed) {
      sidebarContainer?.classList.add("collapsed");
    } else {
      sidebarContainer?.classList.remove("collapsed");
    }
  }

  highlightActiveLink() {
    const currentPath = window.location.pathname;
    const links = this.querySelectorAll(".sidebar-link");

    links.forEach(link => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      }
    });
  }
}

customElements.define("vendly-sidebar", VendlySidebar);