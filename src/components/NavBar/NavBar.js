import { BaseComponent } from "../BaseComponent.js";

class VendlyNavbar extends BaseComponent {

    // Monta a estrutura visual da barra de navegação.
    render() {
        this.innerHTML = `
            <link
                rel="stylesheet"
                href="/src/components/NavBar/NavBar.css"
            >

            <nav class="navbar navbar-expand-md vendly-navbar border-bottom py-2 px-3 shadow-sm w-100">
                <div class="container-fluid d-flex align-items-center justify-content-between p-0">

                    <!-- MENU LATERAL E LOGO -->

                    <div class="d-flex align-items-center gap-3">
                        <button
                            id="btnSidebarToggle"
                            class="btn p-2 rounded border-0 text-white nav-btn-hover btn-hamburger"
                            type="button"
                            title="Alternar Menu"
                            aria-label="Menu"
                        >
                            <!-- Ícone de fechar -->
                            <svg
                                class="icon-svg icon-close"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>

                            <!-- Ícone de menu -->
                            <svg
                                class="icon-svg icon-menu"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>

                        <a
                            href="/src/pages/frenteCaixa.html"
                            class="d-flex align-items-center text-decoration-none gap-2 navbar-brand-link mobile-center-logo"
                        >
                            <div class="logo-wrapper">
                                <img
                                    src="/public/assets/images/vendlyIcon-neutral-white.svg"
                                    alt="Logo Vendly"
                                    class="vendly-logo logo-default"
                                >

                                <img
                                    src="/public/assets/images/vendlyIcon-hover.svg"
                                    alt="Logo Vendly"
                                    class="vendly-logo logo-hover"
                                >
                            </div>

                            <span class="vendly-brand-text">vendly</span>
                        </a>
                    </div>


                    <!-- CAMPO DE BUSCA -->

                    <div class="d-none d-md-flex flex-grow-1 justify-content-center px-4">
                        <form
                            id="searchForm"
                            class="w-100 max-w-search"
                            role="search"
                        >
                            <div class="input-group">
                                <input
                                    type="search"
                                    id="searchInput"
                                    class="form-control bg-white text-dark border-0 shadow-none"
                                    placeholder="Buscar no sistema..."
                                    aria-label="Buscar"
                                >

                                <button
                                    class="btn btn-search text-white border-0"
                                    type="submit"
                                    aria-label="Pesquisar"
                                >
                                    <svg
                                        class="icon-svg"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>


                    <!-- NOTIFICAÇÕES -->

                    <div class="d-flex align-items-center gap-2">
                        <div class="position-relative">
                            <button
                                id="btnNotifications"
                                class="btn p-2 rounded-circle border-0 text-white position-relative nav-btn-hover"
                                aria-label="Notificações do sistema"
                            >
                                <svg
                                    class="icon-svg"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>

                                <span
                                    id="notifBadge"
                                    class="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-warning-orange text-dark notif-badge"
                                >
                                    3
                                </span>
                            </button>
                        </div>
                    </div>

                </div>
            </nav>
        `;
    }


    // Configura os cliques e o envio do formulário.
    initEvents() {
        const botaoMenu = this.querySelector("#btnSidebarToggle");
        const formularioBusca = this.querySelector("#searchForm");
        const botaoNotificacoes = this.querySelector("#btnNotifications");

        if (botaoMenu) {
            botaoMenu.addEventListener("click", () => {
                this.alternarMenu(botaoMenu);
            });
        }

        if (formularioBusca) {
            formularioBusca.addEventListener("submit", (evento) => {
                // Evita que o formulário recarregue a página.
                evento.preventDefault();

                this.enviarBusca();
            });
        }

        if (botaoNotificacoes) {
            botaoNotificacoes.addEventListener("click", () => {
                this.abrirNotificacoes();
            });
        }
    }


    // Alterna o ícone do botão e avisa o menu lateral.
    alternarMenu(botaoMenu) {
        const menuEstaAberto = botaoMenu.classList.contains("is-open");

        if (menuEstaAberto) {
            botaoMenu.classList.remove("is-open");
        } else {
            botaoMenu.classList.add("is-open");
        }

        const eventoMenu = new CustomEvent("toggleSidebar");

        document.dispatchEvent(eventoMenu);
    }


    // Obtém o texto da busca e avisa a página.
    enviarBusca() {
        const campoBusca = this.querySelector("#searchInput");

        if (!campoBusca) {
            return;
        }

        const textoBusca = campoBusca.value.trim();

        if (textoBusca === "") {
            return;
        }

        const dadosBusca = {
            query: textoBusca
        };

        const configuracaoEvento = {
            detail: dadosBusca
        };

        const eventoBusca = new CustomEvent(
            "searchSubmitted",
            configuracaoEvento
        );

        document.dispatchEvent(eventoBusca);
    }


    // Avisa a página para abrir as notificações.
    abrirNotificacoes() {
        const eventoNotificacoes = new CustomEvent("openNotifications");

        document.dispatchEvent(eventoNotificacoes);
    }
}


// Permite utilizar <vendly-navbar> no HTML.
customElements.define("vendly-navbar", VendlyNavbar);
