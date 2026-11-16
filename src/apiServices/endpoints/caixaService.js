import { buscarListaJSON } from '../httpClient.js';

// Dados do protótipo.
// As alterações ficam na memória enquanto a página estiver aberta.
let caixas = [];
let movimentos = [];
let usuarios = [];

let usuarioId;

// Guardam operações em andamento para evitar execuções duplicadas.
let carregamento = null;
let aberturaEmAndamento = null;


// CARREGAMENTO DOS DADOS

async function lerJSONs() {
    caixas = await buscarListaJSON('/public/data/caixas.json');

    movimentos = await buscarListaJSON(
        '/public/data/movimentacoesCaixa.json'
    );

    usuarios = await buscarListaJSON('/public/data/funcionarios.json');

    const sessoes = await buscarListaJSON('/public/data/sessao.json');
    const sessaoAtual = sessoes[0];

    usuarioId = sessaoAtual.usuarioId;
}

async function carregarDados() {
    // Inicia o carregamento somente na primeira consulta.
    if (!carregamento) {
        carregamento = lerJSONs();
    }

    try {
        // Outras consultas aguardam esse mesmo carregamento.
        await carregamento;
    } catch (erro) {
        // Permite tentar novamente se o carregamento falhar.
        carregamento = null;

        throw erro;
    }
}


// FUNÇÕES AUXILIARES

function proximoId(lista) {
    let maiorId = 0;

    for (const item of lista) {
        if (item.id > maiorId) {
            maiorId = item.id;
        }
    }

    return maiorId + 1;
}

function copiarObjeto(objeto) {
    const copia = {};

    for (const campo in objeto) {
        copia[campo] = objeto[campo];
    }

    return copia;
}

function caixaAberto() {
    for (const caixa of caixas) {
        if (caixa.status === 'ABERTO') {
            return caixa;
        }
    }

    return null;
}

function prepararCaixa(caixa) {
    if (!caixa) {
        return null;
    }

    // Cria uma cópia para a tela não alterar o registro original.
    const resultado = copiarObjeto(caixa);

    // Acrescenta os dados do usuário responsável pelo caixa.
    for (const usuario of usuarios) {
        if (usuario.id === caixa.usuarioId) {
            resultado.usuario = {
                id: usuario.id,
                nome: usuario.nome
            };

            break;
        }
    }

    // Acrescenta as movimentações deste caixa.
    resultado.movimentacoes = [];

    for (const movimento of movimentos) {
        if (movimento.caixaId === caixa.id) {
            const copiaMovimento = copiarObjeto(movimento);

            resultado.movimentacoes.push(copiaMovimento);
        }
    }

    return resultado;
}

function registrarMovimento(caixa, tipo) {
    const movimento = {
        id: proximoId(movimentos),
        caixaId: caixa.id,
        tipo: tipo
    };

    if (tipo === 'ABERTURA') {
        movimento.data = caixa.dataAbertura;
        movimento.valor = caixa.valorInicial;
        movimento.descricao = 'Abertura do caixa';
    } else {
        movimento.data = caixa.dataFechamento;
        movimento.valor = null;
        movimento.descricao = 'Fechamento do caixa';
    }

    movimentos.push(movimento);
}


// CONSULTAS CHAMADAS PELAS TELAS

export async function obterCaixaAtual() {
    await carregarDados();

    let caixa = caixaAberto();

    // Se não houver caixa aberto, utiliza o último cadastrado.
    if (!caixa) {
        const ultimoIndice = caixas.length - 1;

        caixa = caixas[ultimoIndice];
    }

    return prepararCaixa(caixa);
}

export async function listarCaixas() {
    await carregarDados();

    const lista = [];

    // Percorre do último registro para o primeiro.
    for (let i = caixas.length - 1; i >= 0; i--) {
        const caixa = caixas[i];
        const caixaPreparado = prepararCaixa(caixa);

        lista.push(caixaPreparado);
    }

    return lista;
}

export async function consultarCaixa(id) {
    await carregarDados();

    for (const caixa of caixas) {
        // Converte os dois IDs para texto antes de comparar.
        const idDoCaixa = String(caixa.id);
        const idProcurado = String(id);

        if (idDoCaixa === idProcurado) {
            return prepararCaixa(caixa);
        }
    }

    throw new Error('Caixa não encontrado.');
}


// ABERTURA DO CAIXA

async function criarAbertura(valorInicial) {
    await carregarDados();

    const caixaAtual = caixaAberto();

    // Se já existir um caixa aberto, devolve esse caixa.
    if (caixaAtual) {
        return prepararCaixa(caixaAtual);
    }

    const novoId = proximoId(caixas);
    const dataAtual = new Date().toISOString();

    const novoCaixa = {
        id: novoId,
        numero: novoId,
        usuarioId: usuarioId,
        valorInicial: valorInicial,
        dataAbertura: dataAtual,
        dataFechamento: null,
        status: 'ABERTO'
    };

    caixas.push(novoCaixa);

    registrarMovimento(novoCaixa, 'ABERTURA');

    return prepararCaixa(novoCaixa);
}

export async function abrirCaixa(dados = {}) {
    let valorInicial = dados.valorInicial;

    if (valorInicial === undefined) {
        valorInicial = 0;
    }

    // O valor deve ser um número inteiro seguro.
    if (!Number.isSafeInteger(valorInicial)) {
        throw new Error(
            'Valor inicial inválido ou acima do limite permitido.'
        );
    }

    if (valorInicial < 0 || valorInicial > 9999999999) {
        throw new Error(
            'Valor inicial inválido ou acima do limite permitido.'
        );
    }

    // Inicia uma abertura somente se não houver outra em andamento.
    if (!aberturaEmAndamento) {
        aberturaEmAndamento = criarAbertura(valorInicial);
    }

    try {
        // Cliques repetidos aguardam a mesma abertura.
        const caixa = await aberturaEmAndamento;

        return caixa;
    } finally {
        // Libera uma nova tentativa após sucesso ou erro.
        aberturaEmAndamento = null;
    }
}


// FECHAMENTO DO CAIXA

export async function fecharCaixa() {
    await carregarDados();

    const caixa = caixaAberto();

    if (!caixa) {
        throw new Error('Não há caixa aberto.');
    }

    caixa.status = 'FECHADO';
    caixa.dataFechamento = new Date().toISOString();

    registrarMovimento(caixa, 'FECHAMENTO');

    return prepararCaixa(caixa);
}