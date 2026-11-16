import { buscarListaJSON } from '../httpClient.js';

// Quando a API estiver pronta, a consulta ao JSON será substituída aqui.
// Valores monetários são centavos inteiros; datas são o horário local da loja.
export function getVendas(opcoes) {
    return buscarListaJSON('/public/data/vendas.json', opcoes);
}
