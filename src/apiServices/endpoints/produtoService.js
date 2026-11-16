import { carregarEstoqueMock, gravarEstoqueMock, proximoId, dataAtualEstoque } from '../estoqueMock.js';
import { getCategorias } from './categoriaService.js';
import { criarRegistroEstoque } from './estoqueService.js';

export async function getProdutos(opcoes) {
    const estado = await carregarEstoqueMock(opcoes);
    return estado.produtos.slice();
}

export function normalizarProduto(produto) {
    return Object.assign({}, produto, { id: produto.id || produto.codigo, unidadeMedida: produto.unidadeMedida || 'UN' });
}

export async function salvarProduto(dados, atual) {
    const estado = await carregarEstoqueMock();
    const categorias = await getCategorias();
    const categoria = categorias.find(function (item) { return item.nome === dados.categoria; });
    if (!categoria) {
        throw new Error('Escolha uma categoria válida.');
    }
    if (!dados.nome || dados.nome.length > 45) {
        throw new Error('O nome deve ter entre 1 e 45 caracteres.');
    }
    if (dados.codigoBarras.length > 50 || dados.caminhoImagem.length > 255) {
        throw new Error('Código de barras ou caminho da imagem excedeu o limite do cadastro.');
    }
    for (const valor of [dados.precoCusto, dados.precoVenda]) {
        if (!Number.isSafeInteger(valor) || valor < 0 || valor > 9999999999) {
            throw new Error('Informe preços válidos, com até duas casas decimais.');
        }
    }
    for (const produto of estado.produtos) {
        if (atual && produto.id === atual.id) {
            continue;
        }
        if (produto.codigo.toLocaleLowerCase('pt-BR') === dados.codigo.toLocaleLowerCase('pt-BR') || (dados.codigoBarras && produto.codigoBarras === dados.codigoBarras)) {
            throw new Error('Código SKU ou código de barras já cadastrado.');
        }
    }
    const agora = dataAtualEstoque();
    const salvo = Object.assign({}, atual || {}, dados);
    let maiorId = proximoId(estado.produtos) - 1;
    for (const movimento of estado.movimentacoes) {
        maiorId = Math.max(maiorId, movimento.produtoId);
    }
    salvo.id = atual ? atual.id : maiorId + 1;
    salvo.categoriaId = categoria.id;
    salvo.estoque = atual ? atual.estoque : 0;
    salvo.dataCriacao = atual ? atual.dataCriacao : agora;
    salvo.dataEdicao = agora;
    const produtos = estado.produtos.slice();
    const movimentos = estado.movimentacoes.slice();
    if (atual) {
        const indice = produtos.findIndex(function (item) { return item.id === atual.id; });
        if (indice < 0) {
            throw new Error('Produto não encontrado.');
        }
        if (atual.precoVenda !== salvo.precoVenda) {
            movimentos.push(await criarRegistroEstoque(atual, 'Alteração de preço', atual.estoque, salvo.precoVenda,
                'Preço de venda alterado no cadastro do produto.', movimentos));
        }
        produtos[indice] = salvo;
    } else {
        produtos.push(salvo);
    }
    gravarEstoqueMock(produtos, movimentos);
    return salvo;
}

export async function excluirProduto(produto, senha) {
    if (!senha.trim()) {
        throw new Error('Preencha a senha para simular a exclusão.');
    }
    const estado = await carregarEstoqueMock();
    const produtos = estado.produtos.filter(function (item) { return item.id !== produto.id; });
    // Mantém a trilha das movimentações, inclusive se o cadastro for excluído.
    gravarEstoqueMock(produtos, estado.movimentacoes);
}

// Dinheiro permanece em centavos na interface, e DECIMAL no contrato da API.
export function prepararProdutoParaAPI(produto) {
    return {
        pro_id: produto.id,
        pro_codigoBarras: produto.codigoBarras,
        pro_cat_id: produto.categoriaId,
        pro_status: produto.status === 'Ativo' ? 1 : 0,
        pro_dataCriacao: produto.dataCriacao.replace('T', ' '),
        pro_dataEdicao: produto.dataEdicao.replace('T', ' '),
        pro_nome: produto.nome,
        pro_descricao: produto.descricao,
        pro_valorVenda: produto.precoVenda / 100,
        pro_valorCusto: produto.precoCusto / 100,
        pro_quantidade: produto.estoque,
        pro_caminhoImagem: produto.caminhoImagem
    };
}
