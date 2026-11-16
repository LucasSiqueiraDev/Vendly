import { buscarListaJSON } from '../httpClient.js';

/** Busca a lista simulada e propaga as falhas para a tela. */
export function getCategorias(opcoes) {
    return buscarListaJSON('/public/data/categorias.json', opcoes);
}
