import { carregarEstoqueMock, gravarEstoqueMock, proximoId, dataAtualEstoque } from '../estoqueMock.js';
import { obterSessao } from '../authService.js';
import { getFuncionarios } from './funcionarioService.js';

// Códigos da simulação; confirmar os valores TINYINT ao conectar a API.
export const TIPOS_ESTOQUE = { Entrada: 1, 'Saída': 2, Ajuste: 3, 'Alteração de preço': 4 };

export async function getMovimentacoesEstoque(opcoes) {
    const estado = await carregarEstoqueMock(opcoes);
    return estado.movimentacoes.slice();
}

export async function criarRegistroEstoque(produto, tipo, novaQuantidade, novoPreco, observacao, registros) {
    const sessao = obterSessao();
    if (!sessao) {
        throw new Error('Entre novamente para registrar a movimentação.');
    }
    const funcionarios = await getFuncionarios();
    let responsavel = 'Usuário ' + sessao.usuarioId;
    for (const funcionario of funcionarios) {
        if (funcionario.id === sessao.usuarioId) {
            responsavel = funcionario.nome;
        }
    }
    return {
        id: proximoId(registros),
        codigo: 'MOV-' + String(proximoId(registros)).padStart(4, '0'),
        produtoId: produto.id,
        produtoCodigo: produto.codigo,
        produtoNome: produto.nome,
        usuarioId: sessao.usuarioId,
        responsavel: responsavel,
        tipo: tipo,
        tipoAcaoEstoque: TIPOS_ESTOQUE[tipo],
        estoqueAnterior: produto.estoque,
        estoqueAtual: novaQuantidade,
        quantidade: novaQuantidade - produto.estoque,
        unidadeMedida: produto.unidadeMedida,
        precoVendaAnterior: produto.precoVenda,
        precoVendaNovo: novoPreco,
        motivo: observacao,
        referencia: 'Cadastro do produto',
        dataMovimentacao: dataAtualEstoque()
    };
}

export async function registrarMovimentacao(produtoId, tipo, quantidade, observacao) {
    const estado = await carregarEstoqueMock();
    const produto = estado.produtos.find(function (item) { return item.id === produtoId; });
    if (!produto) {
        throw new Error('Produto não encontrado.');
    }
    if (!['Entrada', 'Saída', 'Ajuste'].includes(tipo)) {
        throw new Error('Escolha o tipo da movimentação.');
    }
    if (!Number.isSafeInteger(quantidade) || quantidade < 0 || (tipo !== 'Ajuste' && quantidade === 0)) {
        throw new Error('Informe uma quantidade inteira válida.');
    }
    if (!observacao.trim()) {
        throw new Error('Informe a observação da movimentação.');
    }
    let novoSaldo = quantidade;
    if (tipo === 'Entrada') {
        novoSaldo = produto.estoque + quantidade;
    } else if (tipo === 'Saída') {
        novoSaldo = produto.estoque - quantidade;
    }
    if (novoSaldo < 0 || novoSaldo > 2147483647) {
        throw new Error('O saldo deve ficar entre zero e 2.147.483.647.');
    }
    if (novoSaldo === produto.estoque) {
        throw new Error('O novo saldo é igual ao saldo atual.');
    }
    const movimento = await criarRegistroEstoque(produto, tipo, novoSaldo, produto.precoVenda, observacao.trim(), estado.movimentacoes);
    const atualizado = Object.assign({}, produto, { estoque: novoSaldo, dataEdicao: movimento.dataMovimentacao });
    const produtos = estado.produtos.slice();
    produtos[produtos.indexOf(produto)] = atualizado;
    const movimentos = estado.movimentacoes.concat(movimento);
    gravarEstoqueMock(produtos, movimentos);
    return atualizado;
}

// A tela usa nomes simples; somente a integração conhece os nomes SQL.
export function prepararMovimentacaoParaAPI(movimento) {
    return {
        hisEst_id: movimento.id,
        tbl_usuario_usu_id: movimento.usuarioId,
        tbl_produto_pro_id: movimento.produtoId,
        hisEst_tipoAcaoEstoque: movimento.tipoAcaoEstoque,
        hisEst_qtdAntiga: movimento.estoqueAnterior,
        hisEst_qtdNova: movimento.estoqueAtual,
        hisEst_valorVendaAntigo: movimento.precoVendaAnterior / 100,
        hisEst_valorVendaNovo: movimento.precoVendaNovo / 100,
        hisEst_observacao: movimento.motivo,
        hisEst_data: movimento.dataMovimentacao.replace('T', ' ')
    };
}
