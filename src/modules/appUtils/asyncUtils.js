// Executa uma tarefa com um tempo máximo de espera.
export function comLimiteDeTempo(tarefa, tempoMs, mensagem) {
    return new Promise(function (resolve, reject) {

        // Executado se o tempo acabar antes da tarefa.
        function informarTempoExcedido() {
            const erro = new Error(mensagem);

            erro.name = 'TimeoutError';

            reject(erro);
        }

        const temporizador = setTimeout(
            informarTempoExcedido,
            tempoMs
        );


        // Executado se a tarefa terminar com sucesso.
        function concluirTarefa(valor) {
            clearTimeout(temporizador);

            resolve(valor);
        }


        // Executado se a tarefa terminar com erro.
        function informarErro(erro) {
            clearTimeout(temporizador);

            reject(erro);
        }


        // Acompanha o resultado da tarefa.
        const promessaTarefa = Promise.resolve(tarefa);

        promessaTarefa.then(concluirTarefa, informarErro);
    });
}


// Verifica uma condição repetidamente até obter um valor
// verdadeiro ou atingir o tempo máximo de espera.
export function aguardarCondicao(condicao, tempoMs, mensagem) {
    const prazoFinal = Date.now() + tempoMs;

    return new Promise(function (resolve, reject) {

        function verificar() {
            let valor;


            // 1. Executa a função que verifica a condição.

            try {
                valor = condicao();
            } catch (erro) {
                reject(erro);

                return;
            }


            // 2. Conclui a espera se a condição for atendida.

            if (valor) {
                resolve(valor);

                return;
            }


            // 3. Verifica se o prazo terminou.

            const horarioAtual = Date.now();

            if (horarioAtual >= prazoFinal) {
                const erro = new Error(mensagem);

                erro.name = 'TimeoutError';

                reject(erro);

                return;
            }


            // 4. Calcula o intervalo até a próxima verificação.

            const tempoRestante = prazoFinal - Date.now();

            let intervalo = 50;

            if (tempoRestante < intervalo) {
                intervalo = tempoRestante;
            }


            // 5. Agenda uma nova verificação.

            setTimeout(verificar, intervalo);
        }


        // Faz a primeira verificação imediatamente.
        verificar();
    });
}