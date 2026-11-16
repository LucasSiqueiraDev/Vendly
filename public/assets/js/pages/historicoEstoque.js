import { colunasHistoricoEstoque } from '/src/modules/appUtils/colunasEstoque.js';
import { getMovimentacoesEstoque } from '/src/apiServices/endpoints/estoqueService.js';
import { inicializarPaginaTabela } from '/src/modules/appUtils/tablePageHelper.js';
import { escaparHTML } from '/src/modules/appUtils/tableRenderers.js';

let movimentacoes = [];
let tabela;
let modal;

const colunas = colunasHistoricoEstoque;

// Compara o dia registrado, incluindo as duas datas do intervalo.
function aplicarFiltros(evento) {
    const filtros = evento.detail;
    const encontradas = [];
    const busca = filtros.busca.toLocaleLowerCase('pt-BR');

    for (const movimento of movimentacoes) {
        const dia = movimento.dataMovimentacao.slice(0, 10);
        if (filtros.dataInicial && dia < filtros.dataInicial) {
            continue;
        }
        if (filtros.dataFinal && dia > filtros.dataFinal) {
            continue;
        }

        const texto = movimento.codigo + ' ' + movimento.produtoCodigo + ' ' +
            movimento.produtoNome + ' ' + movimento.tipo + ' ' + movimento.responsavel +
            ' ' + movimento.motivo + ' ' + movimento.referencia;
        if (!texto.toLocaleLowerCase('pt-BR').includes(busca)) {
            continue;
        }

        encontradas.push(movimento);
    }

    tabela.atualizarDados(encontradas, { preservarPagina: false });
    mostrarResumo(encontradas.length);
}

function mostrarResumo(quantidade) {
    document.getElementById('resumoHistoricoEstoque').textContent =
        'Movimentações encontradas: ' + quantidade + ' de ' + movimentacoes.length +
        '. Clique em uma movimentação para ver os detalhes.';
}

function mostrarDetalhes(evento) {
    const movimento = evento.detail.data;
    let html = '<dl class="stock-details">';

    for (const coluna of colunas) {
        let valor = escaparHTML(movimento[coluna.data]);
        if (coluna.render) {
            valor = coluna.render(movimento[coluna.data], 'display', movimento);
        }
        html += '<dt>' + escaparHTML(coluna.title) + '</dt><dd>' + valor + '</dd>';
    }

    html += '<dt>Referência</dt><dd>' + escaparHTML(movimento.referencia) + '</dd></dl>';

    modal.abrir('Movimentação ' + movimento.codigo, html, movimento);
}

function configurarPagina(contexto) {
    movimentacoes = contexto.dados;
    tabela = contexto.tabelaComponent;
    modal = document.getElementById('modalHistoricoEstoque');

    // O histórico apenas consulta os registros.
    modal.querySelector('#modalDetalhesMovimentacao_btnEditar').remove();
    tabela.addEventListener('row-click', mostrarDetalhes);

    const filtros = document.getElementById('filtrosHistoricoEstoque');
    filtros.addEventListener('history-search', aplicarFiltros);
    filtros.definirDisponivel(true);
    mostrarResumo(movimentacoes.length);
}

inicializarPaginaTabela({
    nomeEntidade: 'movimentações de estoque',
    mensagemVazia: 'Nenhuma movimentação encontrada para esta consulta.',
    tabelaSelector: '#tabelaHistoricoEstoqueComponent',
    carregarDados: getMovimentacoesEstoque,
    colunas: colunas,
    opcoesTabela: {
        dom: '<"vendly-table-toolbar"l>rt<"vendly-table-footer"ip>',
        order: [[1, 'desc']]
    },
    aoInicializar: configurarPagina
});
