import { comLimiteDeTempo } from '../modules/appUtils/asyncUtils.js';


// BUSCA E VALIDA O CONTEÚDO DO JSON

async function carregarListaJSON(url, controlador) {
    const configuracao = {
        signal: controlador.signal,
        cache: 'no-store'
    };

    const resposta = await fetch(url, configuracao);

    if (!resposta.ok) {
        throw new Error(
            `Falha ao buscar ${url}: HTTP ${resposta.status}.`
        );
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados)) {
        throw new TypeError(
            `A resposta de ${url} deve conter uma lista.`
        );
    }

    return dados;
}


// FUNÇÃO CHAMADA PELOS SERVICES

export async function buscarListaJSON(url, opcoes = {}) {
    // 1. Define o tempo máximo de espera.

    let tempoLimiteMs = opcoes.tempoLimiteMs;

    if (tempoLimiteMs === undefined) {
        tempoLimiteMs = 10000;
    }


    // 2. Cria o controle que permite cancelar a busca.

    const controlador = new AbortController();


    // 3. Inicia o carregamento do JSON.

    const tarefa = carregarListaJSON(url, controlador);

    const mensagemTempoExcedido =
        `O carregamento de ${url} excedeu o tempo de espera.`;


    // 4. Aguarda o resultado dentro do tempo permitido.

    try {
        const lista = await comLimiteDeTempo(
            tarefa,
            tempoLimiteMs,
            mensagemTempoExcedido
        );

        return lista;
    } catch (erro) {
        // Cancela a busca se houver falha ou o tempo acabar.
        controlador.abort();

        // Envia o erro para a tela que solicitou os dados.
        throw erro;
    }
}