import { getVendas } from '/src/apiServices/endpoints/vendaService.js';
import { inicializarPaginaTabela } from '/src/modules/appUtils/tablePageHelper.js';
import { escaparHTML, renderMoeda, renderDataHora } from '/src/modules/appUtils/tableRenderers.js';

let vendas = [];
let tabela;
let modal;

const colunas = [
    { title: 'Venda', data: 'codigo', className: 'vendly-cell-nowrap' },
    { title: 'Data e hora', data: 'dataVenda', render: renderDataHora, className: 'vendly-cell-nowrap' },
    { title: 'Cliente', data: 'cliente' },
    { title: 'Operador', data: 'operador' },
    { title: 'Pagamento', data: 'formaPagamento' },
    { title: 'Total', data: 'total', render: renderMoeda, className: 'vendly-cell-right' },
    { title: 'Status', data: 'status', render: renderStatusVenda }
];

function renderStatusVenda(valor, tipo) {
    if (tipo !== 'display') {
        return valor;
    }

    let classe = 'is-pending';
    if (valor === 'Concluída') {
        classe = 'is-positive';
    } else if (valor === 'Cancelada') {
        classe = 'is-negative';
    }

    return '<span class="vendly-status ' + classe + '">' + escaparHTML(valor) + '</span>';
}

// As datas ISO (ano-mês-dia) podem ser comparadas como texto.
// O intervalo inclui o dia inicial e o dia final por inteiro.
function aplicarFiltros(evento) {
    const filtros = evento.detail;
    const encontradas = [];
    const busca = filtros.busca.toLocaleLowerCase('pt-BR');

    for (const venda of vendas) {
        const dia = venda.dataVenda.slice(0, 10);
        if (filtros.dataInicial && dia < filtros.dataInicial) {
            continue;
        }
        if (filtros.dataFinal && dia > filtros.dataFinal) {
            continue;
        }

        const texto = venda.codigo + ' ' + venda.cliente + ' ' + venda.operador +
            ' ' + venda.formaPagamento + ' ' + venda.status;
        if (!texto.toLocaleLowerCase('pt-BR').includes(busca)) {
            continue;
        }

        encontradas.push(venda);
    }

    tabela.atualizarDados(encontradas, { preservarPagina: false });
    mostrarResumo(encontradas.length);
}

function mostrarResumo(quantidade) {
    document.getElementById('resumoHistorico').textContent =
        'Vendas encontradas: ' + quantidade + ' de ' + vendas.length +
        '. Clique em uma venda para ver os detalhes.';
}

// Reaproveita o modal existente, apenas para consulta.
function mostrarDetalhes(evento) {
    const venda = evento.detail.data;
    let html = '<dl class="sale-details">';

    for (const coluna of colunas) {
        let valor = escaparHTML(venda[coluna.data]);
        if (coluna.render) {
            valor = coluna.render(venda[coluna.data], 'display');
        }
        html += '<dt>' + escaparHTML(coluna.title) + '</dt><dd>' + valor + '</dd>';
    }

    html += '</dl><h6 class="fw-bold">Produtos</h6><ul class="list-group list-group-flush">';
    for (const item of venda.itens) {
        html += '<li class="list-group-item px-0">' + escaparHTML(item.quantidade) + ' × ' +
            escaparHTML(item.nome) + ' — ' + renderMoeda(item.precoUnitario * item.quantidade, 'display') + '</li>';
    }
    html += '</ul>';

    if (venda.observacao) {
        html += '<p class="mt-3 mb-0">' + escaparHTML(venda.observacao) + '</p>';
    }

    modal.abrir('Venda ' + venda.codigo, html, venda);
}

function configurarPagina(contexto) {
    vendas = contexto.dados;
    tabela = contexto.tabelaComponent;
    modal = document.getElementById('modalHistoricoVendas');

    // Histórico não altera vendas; o modal mantém apenas a ação de fechar.
    modal.querySelector('#modalDetalhesVenda_btnEditar').remove();
    tabela.addEventListener('row-click', mostrarDetalhes);

    const filtros = document.getElementById('filtrosHistorico');
    filtros.addEventListener('history-search', aplicarFiltros);
    filtros.definirDisponivel(true);
    mostrarResumo(vendas.length);
}

inicializarPaginaTabela({
    nomeEntidade: 'vendas',
    mensagemVazia: 'Nenhuma venda encontrada para esta consulta.',
    tabelaSelector: '#tabelaHistoricoVendasComponent',
    carregarDados: getVendas,
    colunas: colunas,
    // A busca fica no novo componente; mantém paginação e ordenação da tabela.
    opcoesTabela: {
        dom: '<"vendly-table-toolbar"l>rt<"vendly-table-footer"ip>',
        order: [[1, 'desc']]
    },
    aoInicializar: configurarPagina
});
