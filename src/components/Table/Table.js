import { BaseComponent } from '../BaseComponent.js';
import { escaparHTML } from '../../modules/appUtils/tableRenderers.js';


// Protege o texto que será exibido nas células.
// Para ordenação e pesquisa, mantém o valor original.
function mostrarTexto(valor, tipo) {
    if (tipo === 'display') {
        return escaparHTML(valor);
    }

    return valor;
}


export class Table extends BaseComponent {

    // Executado quando o componente é inserido na página.
    connectedCallback() {
        this.tableId = this.getAttribute('table-id');

        if (!this.tableId) {
            this.tableId = 'vendlyDataTable';
        }

        this._dt = null;

        this.render();
        this.observarLargura();
    }


    // Executado quando o componente é removido da página.
    disconnectedCallback() {
        if (this.observador) {
            this.observador.disconnect();
        }

        this.destruirTabela();
    }


    // Ajusta as colunas quando a largura do componente muda.
    observarLargura() {
        const componente = this;

        this.observador = new ResizeObserver(function () {
            const larguraAtual = componente.clientWidth;

            if (larguraAtual > 0) {
                if (larguraAtual !== componente.larguraAnterior) {
                    componente.ajustarColunas();
                }
            }

            componente.larguraAnterior = larguraAtual;
        });

        this.observador.observe(this);
    }


    // Monta a estrutura HTML da tabela.
    render() {
        let descricao = this.getAttribute('aria-label');

        if (!descricao) {
            descricao = 'Registros';
        }

        const idSeguro = escaparHTML(this.tableId);
        const descricaoSegura = escaparHTML(descricao);

        this.innerHTML = `
            <link
                rel="stylesheet"
                href="/src/components/Table/Table.css"
            >

            <div class="vendly-table-wrap">
                <table
                    id="${idSeguro}"
                    class="table vendly-data-table w-100"
                    aria-label="${descricaoSegura}"
                    style="width:100%"
                ></table>
            </div>
        `;
    }


    // Remove a instância atual do DataTables.
    destruirTabela() {
        if (this._dt) {
            this._dt.destroy();

            this._dt = null;
        }
    }


    // Permite consultar a instância pelo componente.instanciaTabela.
    get instanciaTabela() {
        return this._dt;
    }


    // Cria a tabela com as colunas, os dados e as opções da página.
    inicializarTabela(colunas, dados, opcoes = {}) {
        // 1. Confere se as bibliotecas estão disponíveis.

        if (!window.jQuery) {
            throw new Error('DataTables não está disponível.');
        }

        if (!window.jQuery.fn.DataTable) {
            throw new Error('DataTables não está disponível.');
        }


        // 2. Remove a tabela anterior e recria o HTML.

        this.destruirTabela();
        this.render();


        // 3. Define se as linhas podem ser selecionadas.

        let selecionarLinha = true;

        if (opcoes.selecionarLinha === false) {
            selecionarLinha = false;
        }

        this.configurarAparencia(selecionarLinha, opcoes);


        // 4. Prepara a configuração do DataTables.

        const configuracao = this.criarConfiguracao(opcoes);

        configuracao.data = dados;
        configuracao.columns = this.prepararColunas(colunas);
        configuracao.language = this.criarTraducao(opcoes);


        // 5. Inicializa o DataTables.

        const tabela = this.querySelector('table');

        this._dt = window.jQuery(tabela).DataTable(configuracao);


        // 6. Configura o clique nas linhas, quando permitido.

        if (selecionarLinha) {
            this.configurarCliqueLinha(tabela, colunas);
        }

        return this._dt;
    }


    // Define as classes visuais do componente.
    configurarAparencia(selecionarLinha, opcoes) {
        if (selecionarLinha) {
            this.classList.add('vendly-table-selectable');
        } else {
            this.classList.remove('vendly-table-selectable');
        }

        if (opcoes.dom === 't') {
            this.classList.add('vendly-table-compact');
        } else {
            this.classList.remove('vendly-table-compact');
        }
    }


    // Define os padrões e aplica as opções enviadas pela página.
    criarConfiguracao(opcoes) {
        const configuracao = {
            autoWidth: false,
            responsive: true,
            dom: '<"vendly-table-toolbar"lf>rt<"vendly-table-footer"ip>',
            pageLength: 10,
            lengthMenu: [10, 25, 50]
        };

        for (const nome in opcoes) {
            // Estas opções pertencem ao componente, não ao DataTables.
            if (nome === 'selecionarLinha') {
                continue;
            }

            if (nome === 'mensagemVazia') {
                continue;
            }

            configuracao[nome] = opcoes[nome];
        }

        return configuracao;
    }


    // Copia as colunas e define a exibição padrão dos textos.
    prepararColunas(colunas) {
        const colunasPreparadas = [];

        for (const coluna of colunas) {
            const copiaColuna = {};

            for (const nome in coluna) {
                copiaColuna[nome] = coluna[nome];
            }

            // Mantém a função de exibição da página, se houver.
            if (typeof copiaColuna.render !== 'function') {
                copiaColuna.render = mostrarTexto;
            }

            colunasPreparadas.push(copiaColuna);
        }

        return colunasPreparadas;
    }


    // Define as mensagens da tabela em português.
    criarTraducao(opcoes) {
        let mensagemVazia = opcoes.mensagemVazia;

        if (!mensagemVazia) {
            mensagemVazia = 'Nenhum registro encontrado.';
        }

        const traducao = {
            decimal: ',',
            thousands: '.',
            emptyTable: escaparHTML(mensagemVazia),
            zeroRecords: 'Nenhum registro corresponde à pesquisa.',
            info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
            infoEmpty: 'Nenhum registro disponível',
            infoFiltered: '(de _MAX_ registros)',
            lengthMenu: 'Mostrar _MENU_',
            search: 'Pesquisar:',
            searchPlaceholder: 'Buscar na tabela...',
            loadingRecords: 'Carregando...',
            processing: 'Processando...',

            paginate: {
                first: 'Primeiro',
                previous: 'Anterior',
                next: 'Próximo',
                last: 'Último'
            },

            aria: {
                sortAscending: ': ordenar em ordem crescente',
                sortDescending: ': ordenar em ordem decrescente'
            }
        };

        return traducao;
    }


    // Configura a seleção de registros pelo clique na linha.
    configurarCliqueLinha(tabela, colunas) {
        const componente = this;

        tabela.onclick = function (evento) {
            // Cliques em botões, links e campos não selecionam a linha.
            const elementoInterativo = evento.target.closest(
                'button, a, input, select, textarea, label, [role="button"]'
            );

            if (elementoInterativo) {
                return;
            }


            // Procura a linha clicada dentro do corpo da tabela.
            const linha = evento.target.closest('tbody tr');

            if (!linha) {
                return;
            }


            // Obtém os dados associados à linha.
            const registro = componente._dt.row(linha).data();

            if (!registro) {
                return;
            }


            // Envia os dados para a página.
            const dadosEvento = {
                data: registro,
                colunas: colunas
            };

            const eventoClique = new CustomEvent('row-click', {
                bubbles: true,
                detail: dadosEvento
            });

            componente.dispatchEvent(eventoClique);
        };
    }


    // Substitui os registros da tabela sem recriar sua estrutura.
    atualizarDados(dados, opcoes = {}) {
        if (!this._dt) {
            throw new Error(
                'Inicialize a tabela antes de atualizar os dados.'
            );
        }

        this._dt.clear();
        this._dt.rows.add(dados);

        if (opcoes.preservarPagina === false) {
            // Retorna à primeira página.
            this._dt.draw(true);
        } else {
            // Mantém a página atual.
            this._dt.draw(false);
        }

        return this._dt;
    }


    // Recalcula as larguras das colunas quando a tabela está visível.
    ajustarColunas() {
        if (!this._dt) {
            return;
        }

        if (this.clientWidth > 0) {
            this._dt.columns.adjust();
        }
    }
}


// Permite utilizar <vendly-table> no HTML.
customElements.define('vendly-table', Table);