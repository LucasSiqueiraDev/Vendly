import { formatarMoeda } from './currencyFormatter.js';


// Impede que textos sejam interpretados como tags HTML.
export function escaparHTML(valor) {
    if (valor === null || valor === undefined) {
        return '';
    }

    const texto = String(valor);

    let textoSeguro = '';

    for (const caractere of texto) {
        if (caractere === '&') {
            textoSeguro = textoSeguro + '&amp;';
        } else if (caractere === '<') {
            textoSeguro = textoSeguro + '&lt;';
        } else if (caractere === '>') {
            textoSeguro = textoSeguro + '&gt;';
        } else if (caractere === '"') {
            textoSeguro = textoSeguro + '&quot;';
        } else if (caractere === "'") {
            textoSeguro = textoSeguro + '&#39;';
        } else {
            textoSeguro = textoSeguro + caractere;
        }
    }

    return textoSeguro;
}


// Formata a moeda para exibição e pesquisa.
// Para ordenação, mantém o valor numérico em centavos.
export function renderMoeda(valor, tipo) {
    if (tipo === 'display' || tipo === 'filter') {
        const textoFormatado = formatarMoeda(valor);

        return textoFormatado;
    }

    return valor;
}


// Exibe um traço quando o valor monetário não é válido.
export function renderMoedaOpcional(valor, tipo) {
    let valorValido = true;

    if (!Number.isSafeInteger(valor)) {
        valorValido = false;
    }

    if (valor < 0) {
        valorValido = false;
    }

    if (!valorValido) {
        if (tipo === 'display' || tipo === 'filter') {
            return '—';
        }

        return -1;
    }

    return renderMoeda(valor, tipo);
}


// Formata a data para exibição e pesquisa.
// Para ordenação, devolve o valor numérico da data.
export function renderDataHora(valor, tipo) {
    const numeroData = Date.parse(valor);

    let dataValida = true;

    if (!valor) {
        dataValida = false;
    }

    if (!Number.isFinite(numeroData)) {
        dataValida = false;
    }


    // Define o resultado quando não há uma data válida.

    if (!dataValida) {
        if (tipo === 'display' || tipo === 'filter') {
            return '—';
        }

        return 0;
    }


    // Devolve o número da data para ordenação.

    if (tipo !== 'display' && tipo !== 'filter') {
        return numeroData;
    }


    // Formata a data e a hora no padrão brasileiro.

    const opcoes = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    const data = new Date(valor);
    const textoFormatado = data.toLocaleString('pt-BR', opcoes);

    return textoFormatado;
}


// Define o texto e a aparência do status.
export function renderStatus(valor, tipo = 'display') {
    let texto = valor;
    let classe = 'is-neutral';


    // 1. Define o texto apresentado.

    if (valor === 'ABERTO') {
        texto = 'Aberto';
    } else if (valor === 'FECHADO') {
        texto = 'Fechado';
    } else if (valor === null || valor === undefined) {
        texto = '';
    }


    // 2. Devolve somente o texto para pesquisa e ordenação.

    if (tipo !== 'display') {
        return String(texto);
    }


    // 3. Define a classe visual do status.

    if (valor === 'Ativo' || valor === 'ABERTO') {
        classe = 'is-positive';
    } else if (valor === 'Inativo') {
        classe = 'is-negative';
    }


    // 4. Monta o HTML com o texto protegido.

    const textoSeguro = escaparHTML(texto);

    return `<span class="vendly-status ${classe}">${textoSeguro}</span>`;
}

// SVGs no mesmo estilo do projeto. Editar e excluir reutilizam os desenhos existentes.
export function renderIcone(nome) {
    const desenhos = {
        editar: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
        excluir: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
        voltar: 'm9 14-5-5 5-5M4 9h10a6 6 0 0 1 0 12h-3',
        salvar: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12l4 4v12a2 2 0 0 1-2 2ZM7 3v6h10V3M7 21v-8h10v8',
        fechar: 'm6 6 12 12M6 18 18 6',
        confirmar: 'm5 12 4 4L19 6',
        repetir: 'M20 4v6h-6M4 20v-6h6M5 9a7 7 0 0 1 12-4l3 5M4 14l3 5a7 7 0 0 0 12-4',
        registrar: 'M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4',
        dados: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z',
        estoque: 'M20 7l-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
    };
    const desenho = desenhos[nome];
    if (!desenho) {
        return '';
    }
    return `<svg class="vendly-button-icon" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true" focusable="false"><path d="${desenho}"></path></svg>`;
}
