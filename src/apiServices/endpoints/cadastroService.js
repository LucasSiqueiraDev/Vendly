// Simulação de escrita: não envia dados nem senhas ao servidor.
// Uma futura API poderá substituir estas funções pelas operações reais.
export async function salvarCadastroSimulado(dados, registros, atual, campoUnico) {
    if (campoUnico) {
        const valor = String(dados[campoUnico]).toLocaleLowerCase('pt-BR');
        for (const registro of registros) {
            if (registro !== atual && String(registro[campoUnico]).toLocaleLowerCase('pt-BR') === valor) {
                throw new Error('Já existe um registro com este ' + campoUnico + '.');
            }
        }
    }

    const salvo = {};
    // Conserva os campos que não são editados pelo formulário.
    if (atual) {
        for (const nome in atual) {
            salvo[nome] = atual[nome];
        }
    } else {
        let maiorId = 0;
        for (const registro of registros) {
            if (Number.isSafeInteger(registro.id) && registro.id > maiorId) {
                maiorId = registro.id;
            }
        }
        salvo.id = maiorId + 1;
    }
    for (const nome in dados) {
        salvo[nome] = dados[nome];
    }
    return salvo;
}

export async function excluirCadastroSimulado(registro, senha) {
    if (!registro || !senha.trim()) {
        throw new Error('Preencha a senha para simular a exclusão.');
    }
    // Qualquer senha preenchida é aceita SOMENTE nesta demonstração.
    // Na API, autorização e senha deverão ser verificadas antes de excluir.
    return true;
}
