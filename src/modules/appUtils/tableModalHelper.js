import { appPronto } from '../../app.js';
import { escaparHTML } from './tableRenderers.js';


// Monta a lista de informações exibidas no modal.
function montarDetalhes(dados, colunas) {
    let html = '<ul class="list-group list-group-flush">';

    for (const coluna of colunas) {
        // Ignora colunas sem um campo associado.
        if (!coluna.data) {
            continue;
        }

        const valor = dados[coluna.data];

        // Ignora campos que não existem no registro.
        if (valor === undefined) {
            continue;
        }


        // Define como o valor será exibido.

        let texto = escaparHTML(valor);

        if (typeof coluna.render === 'function') {
            texto = coluna.render(valor, 'display', dados);
        }

        const tituloSeguro = escaparHTML(coluna.title);


        // Acrescenta o campo à lista de detalhes.

        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                <span class="fw-semibold text-secondary">
                    ${tituloSeguro}:
                </span>

                <span class="text-dark fw-bold">
                    ${texto}
                </span>
            </li>
        `;
    }

    html += '</ul>';

    return html;
}


// Cria a tabela e conecta o modal de detalhes, quando informado.
export async function setupTabelaComModal(opcoes) {
    // 1. Aguarda a aplicação estar pronta.

    await appPronto;


    // 2. Procura o componente de tabela.

    const tabela = document.querySelector(opcoes.tabelaSelector);

    if (!tabela) {
        throw new Error(
            'Tabela não encontrada: ' + opcoes.tabelaSelector
        );
    }


    // 3. Inicializa a tabela com os dados da página.

    const configuracaoTabela = {
        mensagemVazia: opcoes.mensagemVazia
    };

    // Permite que cada página ajuste opções como busca e ordenação.
    if (opcoes.opcoesTabela) {
        for (const nome in opcoes.opcoesTabela) {
            configuracaoTabela[nome] = opcoes.opcoesTabela[nome];
        }
    }

    tabela.inicializarTabela(
        opcoes.colunas,
        opcoes.dados,
        configuracaoTabela
    );


    // 4. Configura o modal, se a página informou um seletor.

    let modal = null;

    if (opcoes.modalSelector) {
        modal = document.querySelector(opcoes.modalSelector);

        if (!modal) {
            throw new Error(
                'Modal não encontrado: ' + opcoes.modalSelector
            );
        }


        // Remove o evento anterior para evitar ações duplicadas.

        if (tabela._rowClickHandler) {
            tabela.removeEventListener(
                'row-click',
                tabela._rowClickHandler
            );
        }


        // Guarda a função para poder removê-la em uma nova configuração.

        tabela._rowClickHandler = function (evento) {
            const dadosRegistro = evento.detail.data;
            const colunasRegistro = evento.detail.colunas;

            const htmlDetalhes = montarDetalhes(
                dadosRegistro,
                colunasRegistro
            );


            // Define o título do modal.

            let prefixoTitulo = opcoes.tituloModalPrefix;

            if (!prefixoTitulo) {
                prefixoTitulo = 'Detalhes';
            }

            let nomeRegistro = dadosRegistro.nome;

            if (!nomeRegistro) {
                nomeRegistro = '';
            }

            const tituloModal = prefixoTitulo + ': ' + nomeRegistro;


            // Abre o modal com os detalhes do registro.

            modal.abrir(
                tituloModal,
                htmlDetalhes,
                dadosRegistro
            );
        };

        tabela.addEventListener(
            'row-click',
            tabela._rowClickHandler
        );
    }


    // 5. Devolve os componentes para a página.

    const componentes = {
        tabelaComponent: tabela,
        modalComponent: modal
    };

    return componentes;
}


// Atualiza os dados sem recriar uma tabela que já foi inicializada.
export function atualizarTabelaComponente(
    componente,
    colunas,
    dados,
    opcoes = {}
) {
    // Verifica se o componente está disponível.

    if (!componente) {
        throw new Error('Componente de tabela indisponível.');
    }

    if (typeof componente.inicializarTabela !== 'function') {
        throw new Error('Componente de tabela indisponível.');
    }


    // Atualiza somente os dados se a tabela já existir.

    if (componente.instanciaTabela) {
        return componente.atualizarDados(dados);
    }


    // Inicializa a tabela se ainda não existir uma instância.

    return componente.inicializarTabela(
        colunas,
        dados,
        opcoes
    );
}