/**
 * Busca a lista de funcionários simulada
 * @returns {Promise<Array>}
 */
export async function getFuncionarios() {
    try {
        const response = await fetch('/public/data/funcionarios.json');
        if (!response.ok) {
            throw new Error(`Erro ao buscar funcionários: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erro no serviço de funcionários:", error);
        return [];
    }
}