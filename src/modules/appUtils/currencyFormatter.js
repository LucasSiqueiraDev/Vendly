// Define o formato brasileiro de moeda.
const formatadorBRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});


// Converte centavos inteiros em um texto formatado em reais.
// Exemplo: 790 → R$ 7,90.
export function formatarMoeda(centavos) {
    // Verifica se o valor é um número inteiro seguro.
    if (!Number.isSafeInteger(centavos)) {
        throw new TypeError(
            'O valor monetário deve ser um número inteiro de centavos.'
        );
    }

    const valorEmReais = centavos / 100;
    const textoFormatado = formatadorBRL.format(valorEmReais);

    return textoFormatado;
}