import { BaseComponent } from "../BaseComponent.js";

export class Modal extends BaseComponent {
    connectedCallback() {
        this.modalId = this.getAttribute("modal-id") || "vendlyModal";
        this.title = this.getAttribute("title") || "Detalhes";
        this.currentItemData = null; // Guarda os dados do item exibido
        this.render();
        this.setupEvents();
    }

    render() {
        this.innerHTML = `
            <div class="modal fade" id="${this.modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow">
                        <div class="modal-header bg-light">
                            <h5 class="modal-title fw-bold" id="${this.modalId}Title">${this.title}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="${this.modalId}Body">
                            <!-- Conteúdo dinâmico -->
                        </div>
                        <div class="modal-footer" id="${this.modalId}Footer">
                            <!-- Botão Editar posicionado à esquerda do botão de fechar -->
                            <button type="button" id="${this.modalId}_btnEditar" class="btn btn-action-blue d-flex align-items-center gap-1 rounded-2">
                                <svg class="icon-svg-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Editar</span>
                            </button>
                            <button type="button" class="btn btn-secondary rounded-2" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEvents() {
        const btnEditar = this.querySelector(`#${this.modalId}_btnEditar`);
        if (btnEditar) {
            btnEditar.addEventListener("click", () => {
                // Emite um evento avisando que o botão de editar foi clicado, repassando os dados do item
                this.dispatchEvent(new CustomEvent("edit-click", {
                    bubbles: true,
                    detail: { itemData: this.currentItemData }
                }));
            });
        }
    }

    /**
     * Atualiza o título e o corpo do modal e o abre
     * @param {string} titulo 
     * @param {string|HTMLElement} conteudoHtml 
     * @param {Object} [itemData=null] Dados do registro exibido (opcional)
     */
    abrir(titulo, conteudoHtml, itemData = null) {
        this.currentItemData = itemData;

        if (titulo) {
            this.querySelector(`#${this.modalId}Title`).textContent = titulo;
        }
        
        const bodyContainer = this.querySelector(`#${this.modalId}Body`);
        if (typeof conteudoHtml === "string") {
            bodyContainer.innerHTML = conteudoHtml;
        } else {
            bodyContainer.innerHTML = "";
            bodyContainer.appendChild(conteudoHtml);
        }

        const modalElement = this.querySelector(`#${this.modalId}`);
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();
    }

    fechar() {
        const modalElement = this.querySelector(`#${this.modalId}`);
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}

customElements.define("vendly-modal", Modal);