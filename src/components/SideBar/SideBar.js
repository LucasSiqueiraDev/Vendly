import { BaseComponent } from "../BaseComponent.js";

class VendlySidebar extends BaseComponent {

    constructor() {
        super();

        // O menu começa expandido.
        this.isCollapsed = false;
    }


    // Monta a estrutura visual do menu lateral.
    render() {
        this.innerHTML = `
            <link
                rel="stylesheet"
                href="/src/components/SideBar/SideBar.css"
            >

            <aside id="sidebarContainer" class="vendly-sidebar">

                <!-- Fechamento do menu sobreposto no celular. -->
                <div class="d-flex d-md-none align-items-center justify-content-between p-3 border-bottom">
                    <span class="fw-bold">Menu Vendly</span>
                    <button
                        id="btnCloseMobile"
                        class="btn text-white border-0 p-1 bg-transparent"
                        type="button"
                        title="Fechar menu"
                        aria-label="Fechar menu"
                    >
                        <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav class="flex-grow-1 py-3 d-flex flex-column gap-3">

                    <!-- VENDAS -->

                    <div class="px-2">
                        <p class="sidebar-category-title sidebar-text">
                            Vendas
                        </p>

                        <div class="d-flex flex-column gap-1">
                            <a
                                href="/src/pages/frenteCaixa.html"
                                class="sidebar-link"
                                title="Frente de Caixa"
                            >
                                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>

                                <span class="sidebar-text">
                                    Frente de Caixa
                                </span>
                            </a>

                            <a
                                href="/src/pages/historicoVendas.html"
                                class="sidebar-link"
                                title="Histórico de Vendas"
                            >
                                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>

                                <span class="sidebar-text">
                                    Histórico de Vendas
                                </span>
                            </a>
                        </div>
                    </div>


                    <!-- ESTOQUE -->

                    <div class="px-2">
                        <p class="sidebar-category-title sidebar-text">
                            Estoque
                        </p>

                        <div class="d-flex flex-column gap-1">
                            <a
                                href="/src/pages/produtos.html"
                                class="sidebar-link"
                                title="Produtos"
                            >
                                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>

                                <span class="sidebar-text">
                                    Produtos
                                </span>
                            </a>

                            <a
                                href="/src/pages/historicoEstoque.html"
                                class="sidebar-link"
                                title="Histórico de Estoque"
                            >
                                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s-8 1.79 8-4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                                </svg>

                                <span class="sidebar-text">
                                    Histórico de Estoque
                                </span>
                            </a>

                            <a
                                href="/src/pages/categorias.html"
                                class="sidebar-link"
                                title="Categorias"
                            >
                                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>

                                <span class="sidebar-text">
                                    Categorias
                                </span>
                            </a>

                            <a
                                href="/src/pages/fornecedores.html"
                                class="sidebar-link"
                                title="Fornecedores"
                            >
                                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>

                                <span class="sidebar-text">
                                    Fornecedores
                                </span>
                            </a>
                        </div>
                    </div>


                    <!-- ADMINISTRAÇÃO -->

                    <div class="px-2">
                        <p class="sidebar-category-title sidebar-text">
                            Administração
                        </p>

                        <div class="d-flex flex-column gap-1">
                            <a href="/src/pages/dashboard.html" class="sidebar-link" title="Dashboard">
                                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
                                </svg>
                                <span class="sidebar-text">Dashboard</span>
                            </a>

                            <a
                                href="/src/pages/funcionarios.html"
                                class="sidebar-link"
                                title="Funcionários"
                            >
                                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>

                                <span class="sidebar-text">
                                    Funcionários
                                </span>
                            </a>

                            <a
                                href="/src/pages/configuracoes.html"
                                class="sidebar-link"
                                title="Configurações"
                            >
                                <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>

                                <span class="sidebar-text">
                                    Configurações
                                </span>
                            </a>
                        </div>
                    </div>

                </nav>


                <!-- BOTÃO DE SAÍDA -->

                <div class="sidebar-footer mt-auto py-2">
                    <div class="px-2">
                        <button
                            id="btnLogout"
                            class="sidebar-link btn-logout-sidebar bg-transparent border-0 w-100"
                            type="button"
                            title="Sair do sistema"
                        >
                            <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>

                            <span class="sidebar-text fw-semibold">
                                Sair
                            </span>
                        </button>
                    </div>
                </div>

            </aside>
        `;
    }


    // Configura os eventos do menu lateral.
    initEvents() {
        const botaoSair = this.querySelector("#btnLogout");

        if (botaoSair) {
            botaoSair.addEventListener("click", () => {
                this.solicitarLogout();
            });
        }

        this.mediaMobile = window.matchMedia('(max-width: 767.98px)');

        // Recebe o aviso enviado pelo botão da barra superior.
        this.aoAlternarMenu = () => {
            this.alternarMenu();
        };
        document.addEventListener("toggleSidebar", this.aoAlternarMenu);

        const botaoFechar = this.querySelector('#btnCloseMobile');
        botaoFechar.addEventListener('click', () => {
            this.fecharMenuMobile(true);
        });

        this.aoPressionarTecla = (evento) => {
            const menu = this.querySelector('#sidebarContainer');

            if (evento.key === 'Escape' && this.mediaMobile.matches &&
                menu.classList.contains('show-mobile')) {
                this.fecharMenuMobile(true);
            }
        };
        document.addEventListener('keydown', this.aoPressionarTecla);

        // Ao mudar de celular para desktop, recupera o estado do desktop.
        this.aoMudarTela = () => {
            this.fecharMenuMobile();
        };
        this.mediaMobile.addEventListener('change', this.aoMudarTela);

        this.highlightActiveLink();
        this.sincronizarBotaoMenu();
    }


    // Evita acumular eventos se o componente for removido e inserido novamente.
    disconnectedCallback() {
        document.removeEventListener('toggleSidebar', this.aoAlternarMenu);
        document.removeEventListener('keydown', this.aoPressionarTecla);
        this.mediaMobile?.removeEventListener('change', this.aoMudarTela);
    }


    // Avisa o sistema que o usuário clicou em Sair.
    solicitarLogout() {
        const eventoLogout = new CustomEvent("userLogout");

        document.dispatchEvent(eventoLogout);
    }


    // Escolhe o comportamento conforme a largura da tela.
    alternarMenu() {
        if (this.mediaMobile.matches) {
            this.alternarMenuMobile();
        } else {
            this.toggleCollapse();
        }

        this.sincronizarBotaoMenu();
    }


    // Mostra ou esconde o menu em telas pequenas.
    alternarMenuMobile() {
        const menu = this.querySelector("#sidebarContainer");

        if (!menu) {
            return;
        }

        const menuVisivel = menu.classList.contains("show-mobile");

        if (menuVisivel) {
            menu.classList.remove("show-mobile");
        } else {
            menu.classList.add("show-mobile");
        }
    }


    // Fecha o menu sem alterar o recolhimento escolhido no desktop.
    fecharMenuMobile(devolverFoco = false) {
        const menu = this.querySelector('#sidebarContainer');
        menu?.classList.remove('show-mobile');

        if (devolverFoco) {
            document.querySelector('#btnSidebarToggle')?.focus();
        }

        this.sincronizarBotaoMenu();
    }


    // O ícone acompanha o estado real do menu e a largura da tela.
    sincronizarBotaoMenu() {
        const menu = this.querySelector('#sidebarContainer');
        const botao = document.querySelector('#btnSidebarToggle');

        if (!menu || !botao) {
            return;
        }

        const mobile = this.mediaMobile.matches;
        const visivel = mobile
            ? menu.classList.contains('show-mobile')
            : !this.isCollapsed;

        botao.classList.toggle('is-open', !visivel);
        botao.setAttribute('aria-controls', 'sidebarContainer');
        botao.setAttribute('aria-expanded', String(visivel));
        botao.setAttribute('aria-label', mobile
            ? (visivel ? 'Fechar menu' : 'Abrir menu')
            : 'Menu');

        // Impede foco nos links que estão fora da tela no celular.
        menu.inert = mobile && !visivel;

        if (mobile) {
            menu.setAttribute('aria-hidden', String(!visivel));
        } else {
            menu.removeAttribute('aria-hidden');
        }
    }


    // Recolhe ou expande o menu em telas maiores.
    toggleCollapse() {
        if (this.isCollapsed) {
            this.isCollapsed = false;
        } else {
            this.isCollapsed = true;
        }

        const menu = this.querySelector("#sidebarContainer");

        if (!menu) {
            return;
        }

        if (this.isCollapsed) {
            menu.classList.add("collapsed");
        } else {
            menu.classList.remove("collapsed");
        }
    }


    // Destaca o link correspondente à página atual.
    highlightActiveLink() {
        const caminhoAtual = window.location.pathname;
        const links = this.querySelectorAll(".sidebar-link");

        for (const link of links) {
            const caminhoLink = link.getAttribute("href");

            if (caminhoLink === caminhoAtual) {
                link.classList.add("active");
            }
        }
    }
}


// Permite utilizar <vendly-sidebar> no HTML.
customElements.define("vendly-sidebar", VendlySidebar);
