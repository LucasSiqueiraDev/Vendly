/**
 * Busca a lista de categorias simulada
 * @returns {Promise<Array>}
 */
export async function getCategorias() {
    try {
        const response = await fetch('/public/data/categorias.json');
        if (!response.ok) {
            throw new Error(`Erro ao buscar categorias: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erro no serviço de categorias:", error);
        return [];
    }
}