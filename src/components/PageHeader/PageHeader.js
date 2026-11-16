import { BaseComponent } from '../BaseComponent.js';

export class PageHeader extends BaseComponent {

    // Atributos que atualizam o componente quando são alterados.
    static get observedAttributes() {
        return [
            'title',
            'section-label',
            'button-text',
            'button-id',
            'caixa-status',
            'caixa-abertura',
            'caixa-fechavel',
            'caixa-gerenciavel'
        ];
    }


    // Executado quando o componente é inserido na página.
    connectedCallback() {
        this.render();
    }


    // Executado quando um dos atributos observados muda.
    attributeChangedCallback() {
        if (!this.isConnected) {
            return;
        }

        // Aguarda a atualização conjunta dos atributos do caixa.
        if (this._atualizando) {
            return;
        }

        this.render();
    }


    // Atualiza o status e a data de abertura do caixa.
    atualizarCaixa(dados) {
        const status = String(dados.status).toLowerCase();

        let dataAbertura = dados.dataAbertura;

        if (dataAbertura === undefined) {
            dataAbertura = null;
        }


        // 1. Valida o status informado.

        if (status !== 'aberto' && status !== 'fechado') {
            throw new TypeError(
                'O estado do caixa deve ser aberto ou fechado.'
            );
        }


        // 2. Valida a data, caso o caixa esteja aberto.

        if (status === 'aberto') {
            if (dataAbertura) {
                const dataConvertida = Date.parse(dataAbertura);

                if (!Number.isFinite(dataConvertida)) {
                    throw new TypeError(
                        'A data de abertura do caixa é inválida.'
                    );
                }
            }
        }


        // 3. Atualiza os atributos sem redesenhar a cada alteração.

        this._atualizando = true;

        this.setAttribute('caixa-status', status);

        if (status === 'aberto' && dataAbertura) {
            this.setAttribute('caixa-abertura', dataAbertura);
        } else {
            this.removeAttribute('caixa-abertura');
        }

        this._atualizando = false;


        // 4. Redesenha o componente após concluir as alterações.

        if (this.isConnected) {
            this.render();
        }
    }


    // Monta o HTML e preenche cada parte do cabeçalho.
    render() {
        this.innerHTML = `
            <link
                rel="stylesheet"
                href="/src/components/PageHeader/PageHeader.css"
            >

            <header class="page-header">

                <div class="page-header-heading">
                    <p
                        class="page-header-section"
                        data-section
                    ></p>

                    <h1
                        class="page-header-title"
                        data-title
                    ></h1>
                </div>

                <div class="page-header-actions" data-actions>

                    <div
                        class="page-header-caixa"
                        data-caixa
                        aria-live="polite"
                    >
                        <button
                            type="button"
                            class="page-header-caixa-badge"
                            data-caixa-fechar
                        >
                            <svg
                                class="page-header-caixa-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                    stroke="currentColor"
                                    stroke-width="1.6"
                                />

                                <path
                                    data-caixa-icon
                                    stroke="currentColor"
                                    stroke-width="1.8"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>

                            <span data-caixa-texto></span>
                        </button>

                        <small
                            class="page-header-caixa-data"
                            data-caixa-data
                        ></small>
                    </div>

                    <button
                        class="page-header-action btn btn-action-blue d-flex align-items-center gap-2 fw-semibold px-3 py-2 shadow-sm"
                        type="button"
                        data-header-action
                    >
                        <svg
                            class="icon-svg-sm"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            width="20"
                            height="20"
                            aria-hidden="true"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2.5"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>

                        <span data-button-text></span>
                    </button>

                </div>
            </header>
        `;

        this.preencherTitulos();
        this.configurarCaixa();
        this.configurarBotao();

        // Esconde a área de ações quando não há caixa nem botão.
        const areaAcoes = this.querySelector('[data-actions]');
        const mostrarCaixa = this.hasAttribute('caixa-status');
        const botao = this.querySelector('[data-header-action]');

        if (!mostrarCaixa && botao.hidden) {
            areaAcoes.hidden = true;
        } else {
            areaAcoes.hidden = false;
        }
    }


    // Preenche o nome da seção e o título da página.
    preencherTitulos() {
        let secao = this.getAttribute('section-label');
        let titulo = this.getAttribute('title');

        if (!secao) {
            secao = '';
        }

        if (!titulo) {
            titulo = '';
        }

        const elementoSecao = this.querySelector('[data-section]');
        const elementoTitulo = this.querySelector('[data-title]');

        elementoSecao.textContent = secao;
        elementoTitulo.textContent = titulo;

        if (secao === '') {
            elementoSecao.hidden = true;
        } else {
            elementoSecao.hidden = false;
        }
    }


    // Configura a aparência e o clique do indicador de caixa.
    configurarCaixa() {
        const elementoCaixa = this.querySelector('[data-caixa]');
        const textoCaixa = this.querySelector('[data-caixa-texto]');
        const iconeCaixa = this.querySelector('[data-caixa-icon]');
        const botaoCaixa = this.querySelector('[data-caixa-fechar]');

        const mostrarCaixa = this.hasAttribute('caixa-status');
        const gerenciavel = this.hasAttribute('caixa-gerenciavel');
        const fechavel = this.hasAttribute('caixa-fechavel');

        let status = this.getAttribute('caixa-status');

        if (!status) {
            status = '';
        }

        status = status.toLowerCase();

        const aberto = status === 'aberto';


        // 1. Define se o indicador será exibido.

        if (mostrarCaixa) {
            elementoCaixa.hidden = false;
        } else {
            elementoCaixa.hidden = true;
        }


        // 2. Define o texto, a aparência e o ícone.

        if (aberto) {
            elementoCaixa.dataset.status = 'aberto';
            textoCaixa.textContent = 'Caixa aberto';

            iconeCaixa.setAttribute('d', 'm8 12 3 3 5-6');
        } else {
            elementoCaixa.dataset.status = 'fechado';
            textoCaixa.textContent = 'Caixa fechado';

            iconeCaixa.setAttribute('d', 'm9 9 6 6m0-6-6 6');
        }


        // 3. Define se o botão pode ser utilizado.

        botaoCaixa.disabled = true;

        if (gerenciavel) {
            botaoCaixa.disabled = false;
        } else {
            if (aberto && fechavel) {
                botaoCaixa.disabled = false;
            }
        }


        // 4. Define a ação do botão quando ele está habilitado.

        if (!botaoCaixa.disabled) {
            let nomeEvento;

            if (gerenciavel) {
                botaoCaixa.setAttribute(
                    'aria-label',
                    'Gerenciar caixa'
                );

                botaoCaixa.title = 'Abrir gerenciamento do caixa';

                nomeEvento = 'caixa-gerenciar-click';
            } else {
                botaoCaixa.setAttribute(
                    'aria-label',
                    'Fechar caixa'
                );

                botaoCaixa.title = 'Clique para fechar o caixa';

                nomeEvento = 'caixa-fechar-click';
            }

            botaoCaixa.addEventListener('click', () => {
                const evento = new CustomEvent(nomeEvento, {
                    bubbles: true
                });

                this.dispatchEvent(evento);
            });
        }


        // 5. Preenche a data exibida abaixo do indicador.

        this.preencherDataCaixa(aberto);
    }


    // Mostra a data de abertura ou a mensagem correspondente.
    preencherDataCaixa(aberto) {
        const elementoData = this.querySelector('[data-caixa-data]');

        if (!aberto) {
            elementoData.textContent = 'Aguardando abertura';

            return;
        }

        const dataAbertura = this.getAttribute('caixa-abertura');

        if (!dataAbertura) {
            elementoData.textContent = 'Abertura não informada';

            return;
        }

        const dataConvertida = Date.parse(dataAbertura);

        if (!Number.isFinite(dataConvertida)) {
            elementoData.textContent = 'Abertura não informada';

            return;
        }

        const configuracaoData = {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };

        const formatador = new Intl.DateTimeFormat(
            'pt-BR',
            configuracaoData
        );

        const data = new Date(dataAbertura);
        const dataFormatada = formatador.format(data);

        elementoData.textContent = 'Aberto em ' + dataFormatada;
    }


    // Configura o botão de ação principal do cabeçalho.
    configurarBotao() {
        const botao = this.querySelector('[data-header-action]');
        const elementoTexto = this.querySelector('[data-button-text]');

        let textoBotao = this.getAttribute('button-text');
        let idBotao = this.getAttribute('button-id');

        if (!textoBotao) {
            textoBotao = '';
        }

        if (!idBotao) {
            idBotao = 'btnHeaderAction';
        }

        botao.id = idBotao;
        elementoTexto.textContent = textoBotao;

        if (textoBotao === '') {
            botao.hidden = true;
        } else {
            botao.hidden = false;
        }

        botao.addEventListener('click', () => {
            const dadosEvento = {
                buttonId: botao.id
            };

            const evento = new CustomEvent('header-action-click', {
                bubbles: true,
                detail: dadosEvento
            });

            this.dispatchEvent(evento);
        });
    }
}


// Permite utilizar <vendly-page-header> no HTML.
customElements.define('vendly-page-header', PageHeader);