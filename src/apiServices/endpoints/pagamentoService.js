import { buscarListaJSON } from '../httpClient.js';
import { obterCaixaAtual } from './caixaService.js';


// FORMAS DE PAGAMENTO

export function listarFormasPagamento() {
    return buscarListaJSON('/public/data/formasPagamento.json');
}


// CONFIRMAÇÃO DO PAGAMENTO

// Os valores monetários são informados em centavos.
// Este pagamento é simulado: não cobra nem grava a venda.
// Na integração, o backend deverá validar os dados e evitar duplicidades.

export async function confirmarPagamento(dados) {
    // 1. Verifica o caixa da venda.

    const caixa = await obterCaixaAtual();

    if (!caixa) {
        throw new Error('O caixa da venda não está aberto.');
    }

    if (caixa.status !== 'ABERTO') {
        throw new Error('O caixa da venda não está aberto.');
    }

    if (caixa.id !== dados.caixaId) {
        throw new Error('O caixa da venda não está aberto.');
    }


    // 2. Verifica se a venda possui produtos.

    if (!Array.isArray(dados.itens)) {
        throw new Error('A venda precisa ter produtos.');
    }

    if (dados.itens.length === 0) {
        throw new Error('A venda precisa ter produtos.');
    }


    // 3. Verifica o total da venda.

    if (!Number.isSafeInteger(dados.total)) {
        throw new Error('Total da venda inválido.');
    }

    if (dados.total < 0) {
        throw new Error('Total da venda inválido.');
    }


    // 4. Procura a forma de pagamento escolhida.

    const formasPagamento = await listarFormasPagamento();

    let formaEscolhida = null;

    for (const formaPagamento of formasPagamento) {
        if (formaPagamento.id === dados.formaPagamentoId) {
            formaEscolhida = formaPagamento;
        }
    }

    if (!formaEscolhida) {
        throw new Error('Escolha uma forma de pagamento válida.');
    }


    // 5. Verifica o valor recebido e calcula o troco, quando necessário.

    let valorRecebido = null;
    let troco = 0;

    if (formaEscolhida.exigeValorRecebido) {
        valorRecebido = dados.valorRecebido;

        if (!Number.isSafeInteger(valorRecebido)) {
            throw new Error('Informe um valor recebido válido.');
        }

        if (valorRecebido < 0) {
            throw new Error('Informe um valor recebido válido.');
        }

        if (valorRecebido < dados.total) {
            throw new Error(
                'O valor recebido é menor que o total da venda.'
            );
        }

        troco = valorRecebido - dados.total;
    }


    // 6. Consulta o resultado simulado do pagamento.

    const respostas = await buscarListaJSON(
        '/public/data/pagamentoSimulado.json'
    );

    if (respostas.length !== 1) {
        throw new Error(
            'Não foi possível confirmar o pagamento. Tente novamente.'
        );
    }

    const respostaPagamento = respostas[0];

    if (respostaPagamento.status !== 'CONFIRMADO') {
        throw new Error(
            'Não foi possível confirmar o pagamento. Tente novamente.'
        );
    }


    // 7. Devolve os dados da confirmação para a tela.
    // Não grava a venda nem movimenta o caixa ou o estoque.

    return {
        status: respostaPagamento.status,
        simulado: true,
        formaPagamentoId: formaEscolhida.id,
        formaPagamento: formaEscolhida.nome,
        total: dados.total,
        valorRecebido: valorRecebido,
        troco: troco
    };
}