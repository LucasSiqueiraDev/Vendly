import {
    escaparHTML,
    renderDataHora,
    renderMoedaOpcional,
    renderStatus
} from './tableRenderers.js';


// FORMATAÇÃO DOS DADOS

function mostrarMovimento(valor) {
    if (valor === 'ABERTURA') {
        return 'Abertura do caixa';
    }

    return 'Fechamento do caixa';
}


function mostrarValor(valor, tipo) {
    const textoFormatado = renderMoedaOpcional(valor, tipo);

    // Fora da exibição visual, devolve o resultado original.
    if (tipo !== 'display') {
        return textoFormatado;
    }

    if (!Number.isSafeInteger(valor)) {
        return textoFormatado;
    }

    if (valor < 0) {
        return textoFormatado;
    }

    // Destaca os valores de entrada com o sinal de positivo.
    return `<span class="caixa-credit">+ ${textoFormatado}</span>`;
}


function mostrarNumero(valor, tipo) {
    // Usa o mesmo texto na exibição e na pesquisa da tabela.
    if (tipo === 'display' || tipo === 'filter') {
        let numeroCaixa = valor;

        if (!numeroCaixa) {
            numeroCaixa = 'sem número';
        }

        const numeroSeguro = escaparHTML(numeroCaixa);

        return 'Caixa ' + numeroSeguro;
    }

    // Para operações como ordenação, devolve um número.
    const numero = Number(valor);

    if (!numero) {
        return 0;
    }

    return numero;
}


function mostrarConsulta(valor, tipo, caixa) {
    // O botão aparece somente na exibição visual.
    if (tipo !== 'display') {
        return '';
    }

    const idSeguro = escaparHTML(caixa.id);

    let numeroCaixa = caixa.numero;

    if (!numeroCaixa) {
        numeroCaixa = '';
    }

    const numeroSeguro = escaparHTML(numeroCaixa);

    return `
        <button
            type="button"
            class="caixa-history-consultar"
            data-historico-consultar="${idSeguro}"
            aria-label="Consultar caixa ${numeroSeguro}"
        >
            Consultar →
        </button>
    `;
}


// COLUNAS DAS MOVIMENTAÇÕES

// "data" indica o campo do JSON.
// "render" indica a função usada para apresentar o valor.

export const colunasMovimentacoes = [
    {
        title: 'Data e hora',
        data: 'data',
        render: renderDataHora,
        className: 'vendly-cell-nowrap'
    },
    {
        title: 'Descrição',
        data: 'tipo',
        render: mostrarMovimento
    },
    {
        title: 'Valor',
        data: 'valor',
        render: mostrarValor,
        className: 'vendly-cell-right'
    }
];


// CONFIGURAÇÕES DA TABELA DE MOVIMENTAÇÕES

export const opcoesMovimentacoes = {
    // Exibe somente a tabela, sem os controles adicionais.
    dom: 't',

    paging: false,
    searching: false,
    info: false,
    selecionarLinha: false,

    // Ordena pela primeira coluna, em ordem crescente.
    order: [[0, 'asc']],

    mensagemVazia: 'Nenhuma movimentação registrada.'
};


// COLUNAS DO HISTÓRICO DE CAIXAS

export const colunasHistorico = [
    {
        title: 'Caixa',
        data: 'numero',
        render: mostrarNumero
    },
    {
        title: 'Abertura',
        data: 'dataAbertura',
        render: renderDataHora,
        className: 'vendly-cell-nowrap'
    },
    {
        title: 'Fechamento',
        data: 'dataFechamento',
        defaultContent: null,
        render: renderDataHora,
        className: 'vendly-cell-nowrap'
    },
    {
        title: 'Valor inicial',
        data: 'valorInicial',
        render: renderMoedaOpcional,
        className: 'vendly-cell-right'
    },
    {
        title: 'Status',
        data: 'status',
        render: renderStatus
    },
    {
        title: 'Ações',
        data: null,
        render: mostrarConsulta,
        orderable: false,
        searchable: false,
        className: 'vendly-cell-actions'
    }
];