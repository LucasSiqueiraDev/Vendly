import { renderIcone } from '../../modules/appUtils/tableRenderers.js';
import { BaseComponent } from "../BaseComponent.js";

export class Modal extends BaseComponent {

    // Executado quando o componente é inserido na página.
    connectedCallback() {
        this.modalId = this.getAttribute("modal-id");
        this.title = this.getAttribute("title");

        if (!this.modalId) {
            this.modalId = "vendlyModal";
        }

        if (!this.title) {
            this.title = "Detalhes";
        }

        // Guarda os dados do registro exibido.
        this.currentItemData = null;

        this.render();
        this.setupEvents();
    }


    // Monta a estrutura visual do modal.
    render() {
        this.innerHTML = `
            <link rel="stylesheet" href="/src/components/Modal/Modal.css">
            <div
                class="modal fade"
                id="${this.modalId}"
                tabindex="-1"
                aria-hidden="true"
                aria-labelledby="${this.modalId}Title"
            >
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content border-0 shadow">

                        <div class="modal-header">
                            <h5
                                class="modal-title fw-bold"
                                id="${this.modalId}Title"
                            >
                                ${this.title}
                            </h5>

                            <button
                                type="button"
                                class="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Fechar"
                            ></button>
                        </div>

                        <div
                            class="modal-body"
                            id="${this.modalId}Body"
                        >
                            <!-- O conteúdo será colocado ao abrir o modal. -->
                        </div>

                        <div
                            class="modal-footer"
                            id="${this.modalId}Footer"
                        >
                            <button
                                type="button"
                                id="${this.modalId}_btnEditar"
                                class="btn btn-action-blue rounded-2"
                            >
                                ${renderIcone('editar')}
                                <span>Editar</span>
                            </button>

                            <button
                                type="button"
                                class="btn btn-secondary rounded-2"
                                data-bs-dismiss="modal"
                            >
                                ${renderIcone('fechar')}Fechar
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }


    // Configura o clique no botão Editar.
    setupEvents() {
        const botaoEditar = this.querySelector(
            `#${this.modalId}_btnEditar`
        );

        if (botaoEditar) {
            botaoEditar.addEventListener("click", () => {
                this.emitirEventoEdicao();
            });
        }
    }


    // Avisa a página que o usuário deseja editar o registro.
    emitirEventoEdicao() {
        const dadosEvento = {
            itemData: this.currentItemData
        };

        const configuracaoEvento = {
            bubbles: true,
            detail: dadosEvento
        };

        const eventoEdicao = new CustomEvent(
            "edit-click",
            configuracaoEvento
        );

        this.dispatchEvent(eventoEdicao);
    }


    // Atualiza os dados, preenche o conteúdo e exibe o modal.
    abrir(titulo, conteudoHtml, itemData = null) {
        this.currentItemData = itemData;


        // 1. Atualiza o título, se ele foi informado.

        if (titulo) {
            const elementoTitulo = this.querySelector(
                `#${this.modalId}Title`
            );

            elementoTitulo.textContent = titulo;
        }


        // 2. Preenche o corpo do modal.

        const elementoCorpo = this.querySelector(
            `#${this.modalId}Body`
        );

        if (typeof conteudoHtml === "string") {
            elementoCorpo.innerHTML = conteudoHtml;
        } else {
            elementoCorpo.innerHTML = "";
            elementoCorpo.appendChild(conteudoHtml);
        }


        // 3. Obtém o controle do Bootstrap e abre o modal.

        const elementoModal = this.querySelector(
            `#${this.modalId}`
        );

        const instanciaModal = bootstrap.Modal.getOrCreateInstance(
            elementoModal
        );

        instanciaModal.show();
    }


    // Permite que a página escolha as ações de cada etapa do cadastro.
    definirRodape(conteudoHtml) {
        this.querySelector('#' + this.modalId + 'Footer').innerHTML = conteudoHtml;
    }


    // Fecha o modal, se existir uma instância do Bootstrap.
    fechar() {
        const elementoModal = this.querySelector(
            `#${this.modalId}`
        );

        const instanciaModal = bootstrap.Modal.getInstance(
            elementoModal
        );

        if (instanciaModal) {
            instanciaModal.hide();
        }
    }
}


// Permite utilizar <vendly-modal> no HTML.
customElements.define("vendly-modal", Modal);