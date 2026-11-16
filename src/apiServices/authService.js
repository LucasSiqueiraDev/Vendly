import { buscarListaJSON } from './httpClient.js';


// ROTAS E CHAVE DA SESSÃO

export const ROUTES = {
    LOGIN: '/src/pages/login.html',
    HOME: '/src/pages/frenteCaixa.html',
    TOKEN_KEY: 'vendly_sessao_demo'
};


// VALIDAÇÃO DA SESSÃO

function sessaoValida(sessao) {
    if (!sessao) {
        return false;
    }

    if (typeof sessao.token !== 'string') {
        return false;
    }

    if (sessao.token.trim() === '') {
        return false;
    }

    if (!Number.isSafeInteger(sessao.usuarioId)) {
        return false;
    }

    if (sessao.usuarioId <= 0) {
        return false;
    }

    return true;
}


// CONSULTA DA SESSÃO SALVA NO NAVEGADOR

export function obterSessao() {
    try {
        const textoSalvo = sessionStorage.getItem(ROUTES.TOKEN_KEY);

        if (textoSalvo === null) {
            return null;
        }

        const sessao = JSON.parse(textoSalvo);

        if (sessaoValida(sessao)) {
            return sessao;
        }

        return null;
    } catch (erro) {
        // Se os dados salvos estiverem inválidos, considera deslogado.
        return null;
    }
}


// LOGIN DE DEMONSTRAÇÃO

// Confere o preenchimento dos campos, mas não valida credenciais reais.
// A autenticação real será feita pela API.

export async function autenticar(dados) {
    // 1. Obtém os campos e remove os espaços das extremidades.

    let email = dados.email;
    let senha = dados.senha;

    if (!email) {
        email = '';
    }

    if (!senha) {
        senha = '';
    }

    email = String(email).trim();
    senha = String(senha).trim();


    // 2. Verifica se os campos foram preenchidos.

    if (email === '') {
        throw new Error('Preencha o e-mail e a senha.');
    }

    if (senha === '') {
        throw new Error('Preencha o e-mail e a senha.');
    }


    // 3. Carrega a sessão e os usuários do protótipo.

    const sessoes = await buscarListaJSON('/public/data/sessao.json');

    const usuarios = await buscarListaJSON(
        '/public/data/funcionarios.json'
    );


    // 4. Verifica a sessão de demonstração.

    if (sessoes.length !== 1) {
        throw new Error(
            'A sessão de demonstração está inválida no JSON.'
        );
    }

    const sessao = sessoes[0];

    if (!sessaoValida(sessao)) {
        throw new Error(
            'A sessão de demonstração está inválida no JSON.'
        );
    }


    // 5. Verifica se o usuário da sessão está ativo.

    let usuarioAtivo = false;

    for (const usuario of usuarios) {
        if (usuario.id === sessao.usuarioId) {
            if (usuario.status === 'Ativo') {
                usuarioAtivo = true;
            }
        }
    }

    if (!usuarioAtivo) {
        throw new Error(
            'A sessão de demonstração está inválida no JSON.'
        );
    }


    // 6. Prepara os dados que serão salvos na aba.

    const resposta = {
        token: sessao.token,
        usuarioId: sessao.usuarioId
    };

    const textoSessao = JSON.stringify(resposta);

    sessionStorage.setItem(ROUTES.TOKEN_KEY, textoSessao);

    return resposta;
}


// VERIFICAÇÕES DE NAVEGAÇÃO

export function usuarioEstaLogado() {
    const sessao = obterSessao();

    if (sessao === null) {
        return false;
    }

    return true;
}

export function estaNaPaginaDeLogin() {
    const caminhoAtual = window.location.pathname;
    const caminhoMinusculo = caminhoAtual.toLowerCase();

    if (caminhoMinusculo.endsWith('login.html')) {
        return true;
    }

    return false;
}


// PROTEÇÃO DAS PÁGINAS

export function protegerRota() {
    const estaLogado = usuarioEstaLogado();
    const estaNoLogin = estaNaPaginaDeLogin();

    if (!estaLogado) {
        if (!estaNoLogin) {
            window.location.replace(ROUTES.LOGIN);
        }
    } else {
        if (estaNoLogin) {
            window.location.replace(ROUTES.HOME);
        }
    }
}


// LOGOUT

export function efetuarLogout() {
    sessionStorage.removeItem(ROUTES.TOKEN_KEY);

    window.location.replace(ROUTES.LOGIN);
}