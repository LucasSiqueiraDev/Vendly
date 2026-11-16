import { buscarListaJSON } from './httpClient.js';

// Os JSONs iniciam a simulação. A sessão permite navegar até o histórico
// sem perder os lançamentos; nenhuma senha é armazenada aqui.
const CHAVE = 'vendly_estoque_demo_v28';
let dados = null;
let carregamento = null;

export async function carregarEstoqueMock(opcoes) {
    if (dados) {
        return dados;
    }
    if (carregamento) {
        return carregamento;
    }
    carregamento = iniciarDados(opcoes);
    try {
        dados = await carregamento;
        return dados;
    } finally {
        carregamento = null;
    }
}

async function iniciarDados(opcoes) {
    const texto = sessionStorage.getItem(CHAVE);
    if (texto) {
        try {
            const salvo = JSON.parse(texto);
            if (Array.isArray(salvo.produtos) && Array.isArray(salvo.movimentacoes)) {
                return salvo;
            }
        } catch (erro) {
            // Um estado inválido não impede a leitura dos exemplos originais.
        }
    }
    return {
        produtos: await buscarListaJSON('/public/data/produtos.json', opcoes),
        movimentacoes: await buscarListaJSON('/public/data/movimentacoesEstoque.json', opcoes)
    };
}

// Grava os dois conjuntos juntos antes de atualizar a memória.
export function gravarEstoqueMock(produtos, movimentacoes) {
    const novoEstado = { produtos: produtos, movimentacoes: movimentacoes };
    sessionStorage.setItem(CHAVE, JSON.stringify(novoEstado));
    dados = novoEstado;
}

export function proximoId(registros) {
    let maior = 0;
    for (const registro of registros) {
        if (registro.id > maior) {
            maior = registro.id;
        }
    }
    return maior + 1;
}

// DATETIME do protótipo: horário local, no mesmo formato dos exemplos JSON.
export function dataAtualEstoque() {
    const data = new Date();
    function dois(numero) {
        return String(numero).padStart(2, '0');
    }
    return data.getFullYear() + '-' + dois(data.getMonth() + 1) + '-' + dois(data.getDate()) +
        'T' + dois(data.getHours()) + ':' + dois(data.getMinutes()) + ':' + dois(data.getSeconds());
}
