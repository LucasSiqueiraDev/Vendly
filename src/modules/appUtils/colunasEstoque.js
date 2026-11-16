import { escaparHTML, renderDataHora, renderMoeda } from './tableRenderers.js';

function renderNumero(valor, tipo) {
    if (tipo === 'display') {
        return Number(valor).toLocaleString('pt-BR');
    }
    return valor;
}

function renderProduto(valor, tipo, movimento) {
    if (tipo !== 'display') {
        return valor;
    }
    return escaparHTML(valor) + '<small class="stock-product-code">ID ' + escaparHTML(movimento.produtoId) +
        ' · ' + escaparHTML(movimento.produtoCodigo) + '</small>';
}

function renderUsuario(valor, tipo, movimento) {
    if (tipo !== 'display') {
        return valor;
    }
    return escaparHTML(valor) + '<small class="stock-product-code">ID ' + escaparHTML(movimento.usuarioId) + '</small>';
}

function renderTipo(valor, tipo) {
    if (tipo !== 'display') {
        return valor;
    }
    let classe = 'is-adjustment';
    if (valor === 'Entrada') {
        classe = 'is-positive';
    } else if (valor === 'Saída') {
        classe = 'is-negative';
    }
    return '<span class="vendly-status ' + classe + '">' + escaparHTML(valor) + '</span>';
}

// Mesmos campos na aba do produto e na tela geral de histórico.
export const colunasHistoricoEstoque = [
    { title: 'Registro', data: 'id' },
    { title: 'Data e hora', data: 'dataMovimentacao', render: renderDataHora, className: 'vendly-cell-nowrap' },
    { title: 'Produto', data: 'produtoNome', render: renderProduto },
    { title: 'Usuário', data: 'responsavel', render: renderUsuario },
    { title: 'Ação', data: 'tipo', render: renderTipo },
    { title: 'Quantidade anterior', data: 'estoqueAnterior', render: renderNumero },
    { title: 'Quantidade nova', data: 'estoqueAtual', render: renderNumero },
    { title: 'Preço de venda anterior', data: 'precoVendaAnterior', render: renderMoeda },
    { title: 'Preço de venda novo', data: 'precoVendaNovo', render: renderMoeda },
    { title: 'Observação', data: 'motivo' }
];
