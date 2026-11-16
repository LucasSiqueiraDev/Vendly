import { buscarListaJSON } from '../httpClient.js';

/** Busca a lista simulada e propaga as falhas para a tela. */
export function getFuncionarios(opcoes) {
    return buscarListaJSON('/public/data/funcionarios.json', opcoes);
}
