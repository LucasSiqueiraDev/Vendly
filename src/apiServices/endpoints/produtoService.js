/**
 * Busca a lista de produtos simulada
 * @returns {Promise<Array>}
 */
export async function getProdutos() {
    try {
        const response = await fetch('/public/data/produtos.json');
        if (!response.ok) {
            throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erro no serviço de produtos:", error);
        return [];
    }
}