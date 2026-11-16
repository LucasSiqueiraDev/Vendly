import { buscarListaJSON } from '../httpClient.js';

/** Busca a lista simulada e propaga as falhas para a tela. */
export function getFornecedores(opcoes) {
    return buscarListaJSON('/public/data/fornecedores.json', opcoes);
}
