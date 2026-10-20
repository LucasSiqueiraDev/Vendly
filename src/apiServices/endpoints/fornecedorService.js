/**
 * Busca a lista de fornecedores simulada
 * @returns {Promise<Array>}
 */
export async function getFornecedores() {
    try {
        const response = await fetch('/public/data/fornecedores.json');
        if (!response.ok) {
            throw new Error(`Erro ao buscar fornecedores: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erro no serviço de fornecedores:", error);
        return [];
    }
}